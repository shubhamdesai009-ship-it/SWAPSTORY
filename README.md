# SwapStory — reader accounts, chat & ₹99 subscription

This is a static Cloudflare Pages website with Firebase Authentication + Firestore, plus a Cloudflare Worker that creates Razorpay recurring subscriptions and processes verified subscription webhooks.

## Features
- Email/password registration and sign-in
- Public reader profiles: location, bio, interests, books read, swap wish and books offered
- Live community shelf populated from registered reader profiles
- Private one-to-one conversations with live message updates
- One free outgoing message per person in each conversation
- After using that message, that account must have an active ₹99/month subscription to send further messages
- Razorpay subscription activation is written to Firestore only by the signed webhook

## 1. Create and configure Firebase
1. Create a project at https://console.firebase.google.com/.
2. Add a Web App and copy its configuration.
3. In **Authentication → Sign-in method**, enable **Email/Password**.
4. In **Firestore Database**, create a database (production mode is fine).
5. Open `firebase-config.js` and replace every `YOUR_...` value with your Firebase Web App values.
6. Deploy `firestore.rules` from **Firestore Database → Rules** (or with Firebase CLI).
7. In Firebase Authentication → Settings → Authorized domains, add your Cloudflare Pages domain.

Do not put a Firebase service-account private key in `firebase-config.js` or in the website. It belongs only in the Cloudflare Worker secret.

## 2. Create the ₹99 monthly Razorpay plan
1. In Razorpay Dashboard, open **Subscriptions / Plans** and create a monthly plan for **₹99** (INR, monthly billing interval).
2. Copy its Plan ID (`plan_...`).
3. Create a Razorpay API key pair for the account that owns the plan.
4. In Razorpay Webhooks, add the deployed Worker URL plus `/razorpay-webhook`.
5. Subscribe to these events: `subscription.activated`, `subscription.charged`, `subscription.cancelled`, `subscription.halted`, `subscription.paused`, `subscription.resumed`.
6. Set a webhook secret and keep it safe.

## 3. Deploy the Cloudflare Worker
Install Wrangler locally (`npm install -g wrangler`), log in (`wrangler login`), then from this folder run:

```bash
wrangler deploy
wrangler secret put RAZORPAY_KEY_ID
wrangler secret put RAZORPAY_KEY_SECRET
wrangler secret put RAZORPAY_PLAN_ID
wrangler secret put RAZORPAY_WEBHOOK_SECRET
wrangler secret put FIREBASE_API_KEY
wrangler secret put FIREBASE_PROJECT_ID
wrangler secret put FIREBASE_SERVICE_ACCOUNT_JSON
```

For `FIREBASE_SERVICE_ACCOUNT_JSON`, paste the complete JSON service-account key downloaded from Firebase/Google Cloud. The service account must have permission to update Firestore documents (for example, the Cloud Datastore User role). Keep this JSON private. `FIREBASE_API_KEY` is the Firebase Web API key from the web app config; `FIREBASE_PROJECT_ID` is the Firebase project ID.

After deploy, copy the Worker URL (for example `https://swapstory-api.<your-subdomain>.workers.dev`) into `API_BASE_URL` in `firebase-config.js`.

Then update the Razorpay webhook URL to `https://<your-worker-url>/razorpay-webhook`.

## 4. Deploy the website to Cloudflare Pages
1. Put `index.html`, `styles.css`, `account.css`, `script.js`, `firebase-config.js`, and the other project files in the root of your GitHub repository.
2. Commit and push to `main`.
3. In Cloudflare Pages, connect the repository. Framework preset: **None**. Build command: leave blank. Build output directory: `/` (root).
4. Redeploy after setting Firebase and Worker configuration.

## Important security / production notes
- Firestore rules restrict profile editing to the account owner, messages to conversation participants, and enforce the one-free-message-per-person rule. Subscription status cannot be edited by website clients; only the signed Razorpay webhook's service account writes it.
- Test in Razorpay test mode first. Configure test API keys, a test plan, and a test webhook secret before taking real payments.
- The Worker currently creates a Razorpay subscription and redirects the reader to Razorpay's hosted checkout URL. Confirm the subscription webhook reaches the Worker before expecting paid chat to unlock.
- Add your own privacy policy, terms, refund/cancellation policy, moderation/reporting tools and support contact before public launch. Do not encourage users to publish private contact details in their public profiles.
- This implementation uses email/password login. Password reset, profile photo uploads, notifications, blocking/reporting and admin moderation are not included yet.
- The app is a static frontend + Firebase/Worker backend. The 3D shelves remain the original CSS perspective design.
