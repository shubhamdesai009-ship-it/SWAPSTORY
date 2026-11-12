
const ALLOWED_ORIGIN = "https://swapstory.pages.dev";

function corsHeaders(request) {
  const origin = request.headers.get("Origin");
  const headers = {
    "Access-Control-Allow-Methods": "POST,OPTIONS,GET",
    "Access-Control-Allow-Headers": "Authorization,Content-Type",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin"
  };

  if (origin === ALLOWED_ORIGIN) {
    headers["Access-Control-Allow-Origin"] = ALLOWED_ORIGIN;
  }

  return headers;
}

function json(data, status = 200, request) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...corsHeaders(request),
      "Content-Type": "application/json"
    }
  });
}

const b64url = bytes =>
  btoa(String.fromCharCode(...new Uint8Array(bytes)))
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

function getRazorpayConfig(env) {
  return {
    keyId: String(env.RAZORPAY_KEY_ID || "").trim(),
    keySecret: String(env.RAZORPAY_KEY_SECRET || "").trim(),
    planId: String(env.RAZORPAY_PLAN_ID || "").trim()
  };
}

async function verifyFirebaseToken(token, env) {
  const apiKey = String(env.FIREBASE_API_KEY || "").trim();

  if (!apiKey) {
    throw new Error("FIREBASE_API_KEY is missing in Cloudflare.");
  }

  const res = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:lookup?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ idToken: token })
    }
  );

  const data = await res.json();

  if (!res.ok) {
    const firebaseError =
      data.error?.message || "UNKNOWN_FIREBASE_ERROR";

    throw new Error(
      `Firebase verification failed: ${firebaseError}`
    );
  }

  const user = data.users?.[0];

  if (!user?.localId) {
    throw new Error("Firebase did not return a valid user account.");
  }

  return user.localId;
}

async function createSubscription(request, env) {
  const auth = request.headers.get("Authorization") || "";
  const token = auth.startsWith("Bearer ")
    ? auth.slice(7).trim()
    : "";

  if (!token) {
    return json({
      error: "Sign in is required. Firebase token is missing."
    }, 401, request);
  }

  let uid;

  try {
    uid = await verifyFirebaseToken(token, env);
  } catch (e) {
    return json({
      error: e.message
    }, 401, request);
  }

  const razorpay = getRazorpayConfig(env);

  const missing = [];

  if (!razorpay.keyId) missing.push("RAZORPAY_KEY_ID");
  if (!razorpay.keySecret) missing.push("RAZORPAY_KEY_SECRET");
  if (!razorpay.planId) missing.push("RAZORPAY_PLAN_ID");

  if (missing.length > 0) {
    return json({
      error: "Worker cannot read these Razorpay settings: " +
        missing.join(", "),
      diagnostic: {
        keyIdAvailable: Boolean(razorpay.keyId),
        keySecretAvailable: Boolean(razorpay.keySecret),
        planIdAvailable: Boolean(razorpay.planId)
      }
    }, 503, request);
  }

  let basic;

  try {
    basic = btoa(
      `${razorpay.keyId}:${razorpay.keySecret}`
    );
  } catch (e) {
    return json({
      error: "Could not prepare Razorpay authentication."
    }, 500, request);
  }

  let res;
  let data;

  try {
    res = await fetch(
      "https://api.razorpay.com/v1/subscriptions",
      {
        method: "POST",
        headers: {
          Authorization: `Basic ${basic}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          plan_id: razorpay.planId,
          total_count: 120,
          quantity: 1,
          customer_notify: 1,
          notes: {
            firebase_uid: uid,
            product: "SwapStory Chat Subscription"
          }
        })
      }
    );

    data = await res.json();
  } catch (e) {
    return json({
      error: "Could not connect to Razorpay. Please try again."
    }, 502, request);
  }

  if (!res.ok) {
    return json({
      error:
        data.error?.description ||
        data.error?.reason ||
        "Razorpay could not create the subscription.",
      razorpay_error_code: data.error?.code || null
    }, 502, request);
  }

  if (!data.id || !data.short_url) {
    return json({
      error: "Razorpay did not return a valid subscription checkout URL."
    }, 502, request);
  }

  return json({
    subscription_id: data.id,
    short_url: data.short_url,
    status: data.status
  }, 200, request);
}

async function signServiceAccountJwt(sa) {
  const now = Math.floor(Date.now() / 1000);

  const header = b64url(
    new TextEncoder().encode(
      JSON.stringify({
        alg: "RS256",
        typ: "JWT"
      })
    )
  );

  const claim = b64url(
    new TextEncoder().encode(
      JSON.stringify({
        iss: sa.client_email,
        scope: "https://www.googleapis.com/auth/datastore",
        aud: sa.token_uri ||
          "https://oauth2.googleapis.com/token",
        iat: now,
        exp: now + 3600
      })
    )
  );

  const unsigned = `${header}.${claim}`;

  const pem = sa.private_key.replace(
    /-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----|\s/g,
    ""
  );

  const der = Uint8Array.from(
    atob(pem),
    c => c.charCodeAt(0)
  );

  const key = await crypto.subtle.importKey(
    "pkcs8",
    der,
    {
      name: "RSASSA-PKCS1-v1_5",
      hash: "SHA-256"
    },
    false,
    ["sign"]
  );

  const sig = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    key,
    new TextEncoder().encode(unsigned)
  );

  return `${unsigned}.${b64url(sig)}`;
}

async function firestoreAccessToken(env) {
  if (!env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    throw new Error("Firebase service account is missing.");
  }

  const sa = JSON.parse(env.FIREBASE_SERVICE_ACCOUNT_JSON);
  const assertion = await signServiceAccountJwt(sa);

  const r = await fetch(
    sa.token_uri || "https://oauth2.googleapis.com/token",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: new URLSearchParams({
        grant_type:
          "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion
      })
    }
  );

  const d = await r.json();

  if (!r.ok) {
    throw new Error(
      d.error_description ||
      "Firebase service authentication failed."
    );
  }

  return d.access_token;
}

async function writeBilling(uid, fields, env) {
  const token = await firestoreAccessToken(env);
  const project = env.FIREBASE_PROJECT_ID;

  if (!project) {
    throw new Error("FIREBASE_PROJECT_ID is missing.");
  }

  const url =
    `https://firestore.googleapis.com/v1/projects/${project}/databases/(default)/documents/users/${uid}/billing/current`;

  const body = {
    fields: {
      status: {
        stringValue: fields.status
      },
      subscriptionId: {
        stringValue: fields.subscriptionId || ""
      },
      plan: {
        stringValue: "SwapStory Chat ₹99/month"
      },
      currentPeriodEnd: {
        timestampValue: new Date(
          (fields.currentEnd ||
            Math.floor(Date.now() / 1000) +
            30 * 86400) * 1000
        ).toISOString()
      },
      updatedAt: {
        timestampValue: new Date().toISOString()
      }
    }
  };

  const r = await fetch(url, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  if (!r.ok) {
    throw new Error(
      `Firestore billing write failed: ${await r.text()}`
    );
  }
}

async function verifyWebhook(request, env, raw) {
  const signature =
    request.headers.get("X-Razorpay-Signature") || "";

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(env.RAZORPAY_WEBHOOK_SECRET),
    {
      name: "HMAC",
      hash: "SHA-256"
    },
    false,
    ["sign"]
  );

  const digest = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(raw)
  );

  const expected = [...new Uint8Array(digest)]
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");

  if (
    !signature ||
    signature.length !== expected.length
  ) {
    return false;
  }

  let diff = 0;

  for (let i = 0; i < signature.length; i++) {
    diff |=
      signature.charCodeAt(i) ^
      expected.charCodeAt(i);
  }

  return diff === 0;
}

async function webhook(request, env) {
  if (
    !env.RAZORPAY_WEBHOOK_SECRET ||
    !env.FIREBASE_SERVICE_ACCOUNT_JSON
  ) {
    return json({
      error: "Webhook is not configured."
    }, 503, request);
  }

  const raw = await request.text();

  if (!await verifyWebhook(request, env, raw)) {
    return json({
      error: "Invalid signature."
    }, 401, request);
  }

  const event = JSON.parse(raw);

  const sub = event.payload?.subscription?.entity;

  if (!sub) {
    return json({
      ok: true,
      ignored: true
    }, 200, request);
  }

  const uid = sub.notes?.firebase_uid;

  if (!uid) {
    return json({
      ok: true,
      ignored: true
    }, 200, request);
  }

  const active = [
    "subscription.activated",
    "subscription.charged",
    "subscription.resumed"
  ].includes(event.event);

  const cancelled =
    event.event === "subscription.cancelled";

  const currentEnd =
    sub.current_end ||
    sub.charge_at ||
    Math.floor(Date.now() / 1000);

  const stillPaid =
    cancelled &&
    currentEnd > Math.floor(Date.now() / 1000);

  const status =
    (active || stillPaid) ? "active" : "inactive";

  await writeBilling(
    uid,
    {
      status,
      subscriptionId: sub.id,
      currentEnd
    },
    env
  );

  return json({
    ok: true
  }, 200, request);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin");

    if (origin && origin !== ALLOWED_ORIGIN) {
      return new Response(
        "Forbidden origin",
        { status: 403 }
      );
    }

    if (request.method === "OPTIONS") {
      if (origin !== ALLOWED_ORIGIN) {
        return new Response(
          "Forbidden origin",
          { status: 403 }
        );
      }

      return new Response(null, {
        status: 204,
        headers: corsHeaders(request)
      });
    }

    try {
      // TEMPORARY DIAGNOSTIC ENDPOINT
      if (
        request.method === "GET" &&
        url.pathname === "/check-config"
      ) {
        const razorpay = getRazorpayConfig(env);

        return json({
          worker: "swapstory",
          razorpayKeyId: Boolean(razorpay.keyId),
          razorpayKeySecret: Boolean(razorpay.keySecret),
          razorpayPlanId: Boolean(razorpay.planId)
        }, 200, request);
      }

      if (
        request.method === "POST" &&
        url.pathname === "/create-subscription"
      ) {
        if (origin !== ALLOWED_ORIGIN) {
          return json({
            error: "Request origin is not allowed."
          }, 403, request);
        }

        return await createSubscription(request, env);
      }

      if (
        request.method === "POST" &&
        url.pathname === "/razorpay-webhook"
      ) {
        return await webhook(request, env);
      }

      return json({
        error: "Not found"
      }, 404, request);

    } catch (e) {
      return json({
        error: e.message || "Server error"
      }, 500, request);
    }
  }
};
