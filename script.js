// ==========================================
// SWAPSTORY — 3D LIBRARY INTERACTION
// ==========================================

const readers = [
  {
    id: 1,
    name: "Aarav Mehta",
    initial: "A",
    location: "Pune, India",
    title: "The Quiet Observer",
    author: "AARAV MEHTA",
    symbol: "✦",
    color: "#8c4e37",
    bio: "I collect stories the way some people collect postcards. Mostly drawn to thoughtful fiction, big questions and books that make an ordinary day feel a little wider.",
    tags: ["Literary fiction", "Design", "Slow travel"],
    books: [
      ["The Alchemist", "Paulo Coelho"],
      ["Norwegian Wood", "Haruki Murakami"],
      ["The Book Thief", "Markus Zusak"],
      ["Sapiens", "Yuval Noah Harari"]
    ],
    wish: "The Midnight Library"
  },

  {
    id: 2,
    name: "Mira Kapoor",
    initial: "M",
    location: "Mumbai, India",
    title: "Between the Lines",
    author: "MIRA KAPOOR",
    symbol: "❋",
    color: "#52644c",
    bio: "A weekend reader, a tea person and a fan of stories with complicated characters. I love passing on books with notes tucked between the pages.",
    tags: ["Romance", "Poetry", "Psychology"],
    books: [
      ["Pride and Prejudice", "Jane Austen"],
      ["The Song of Achilles", "Madeline Miller"],
      ["Milk and Honey", "Rupi Kaur"],
      ["Eleanor Oliphant Is Completely Fine", "Gail Honeyman"]
    ],
    wish: "Educated"
  },

  {
    id: 3,
    name: "Kabir Shah",
    initial: "K",
    location: "Bengaluru, India",
    title: "Curious by Nature",
    author: "KABIR SHAH",
    symbol: "⌘",
    color: "#4d596c",
    bio: "I read to understand how things work: people, cities, technology and the natural world. Happy to swap non-fiction for a great novel.",
    tags: ["Science", "History", "Technology"],
    books: [
      ["Atomic Habits", "James Clear"],
      ["A Brief History of Time", "Stephen Hawking"],
      ["Deep Work", "Cal Newport"],
      ["The Martian", "Andy Weir"]
    ],
    wish: "Thinking, Fast and Slow"
  },

  {
    id: 4,
    name: "Isha Rao",
    initial: "I",
    location: "Hyderabad, India",
    title: "A Garden of Words",
    author: "ISHA RAO",
    symbol: "❀",
    color: "#956b4a",
    bio: "My shelf is a mix of magical worlds, Indian writing and books that feel like a warm conversation. I love discovering new authors.",
    tags: ["Fantasy", "Indian writing", "Mystery"],
    books: [
      ["The Palace of Illusions", "Chitra Banerjee Divakaruni"],
      ["The Hobbit", "J.R.R. Tolkien"],
      ["The Henna Artist", "Alka Joshi"],
      ["A Man Called Ove", "Fredrik Backman"]
    ],
    wish: "The House in the Cerulean Sea"
  },

  {
    id: 5,
    name: "Rohan Das",
    initial: "R",
    location: "Kolkata, India",
    title: "The Long Way Home",
    author: "ROHAN DAS",
    symbol: "☼",
    color: "#80613d",
    bio: "I am happiest with a mystery novel, an old classic or a book about somewhere I have never been. Looking for readers who enjoy a little adventure.",
    tags: ["Thrillers", "Classics", "Travel"],
    books: [
      ["The Silent Patient", "Alex Michaelides"],
      ["The Great Gatsby", "F. Scott Fitzgerald"],
      ["Shantaram", "Gregory David Roberts"],
      ["Into the Wild", "Jon Krakauer"]
    ],
    wish: "The Thursday Murder Club"
  },

  {
    id: 6,
    name: "Ananya Sen",
    initial: "A",
    location: "Delhi, India",
    title: "Small Worlds, Big Ideas",
    author: "ANANYA SEN",
    symbol: "☾",
    color: "#66516c",
    bio: "Poetry, essays and speculative fiction are my comfort zone. I like books that leave a question in your head long after the last page.",
    tags: ["Poetry", "Essays", "Speculative fiction"],
    books: [
      ["The Prophet", "Kahlil Gibran"],
      ["Exhalation", "Ted Chiang"],
      ["Braiding Sweetgrass", "Robin Wall Kimmerer"],
      ["The Anthropocene Reviewed", "John Green"]
    ],
    wish: "Invisible Cities"
  }
];


// ==========================================
// BOOK COVER COLOURS
// ==========================================

const palettes = [
  "#8d4e38",
  "#52644c",
  "#4b5b70",
  "#956c4b",
  "#76533c",
  "#68526f",
  "#a15e43",
  "#48666a",
  "#8a7144",
  "#634b58",
  "#52714f",
  "#a35f48"
];


// ==========================================
// CREATE BOOKS ON THE SHELVES
// ==========================================

function makeBook(reader, index) {

  const book = document.createElement("button");

  book.className = "reader-book";
  book.type = "button";

  book.setAttribute(
    "aria-label",
    `Open ${reader.name}'s reader profile`
  );

  book.style.setProperty("--book", reader.color);

  book.style.background =
    `linear-gradient(90deg, ${reader.color}, ${reader.color} 72%, #24170f)`;

  book.style.setProperty(
    "--height",
    `${150 + (index * 17) % 70}px`
  );

  book.innerHTML = `
    <span class="spine-symbol">${reader.symbol}</span>

    <span class="spine-title">
      ${reader.title}
    </span>

    <span class="spine-author">
      ${reader.initial} · ${String(reader.id).padStart(2, "0")}
    </span>
  `;

  book.addEventListener("click", () => {
    openReader(reader, book);
  });

  return book;
}


// ==========================================
// POPULATE BOTH SHELVES
// ==========================================

const rowOne = document.getElementById("bookRow");
const rowTwo = document.getElementById("bookRowTwo");

[...readers, ...readers.slice(0, 3)].forEach((reader, index) => {

  const book = makeBook(reader, index);

  if (index < 5) {
    rowOne.appendChild(book);
  } else {
    rowTwo.appendChild(book);
  }

});


// ==========================================
// PROFILE BOOK OPENING
// ==========================================

const overlay = document.getElementById("profileOverlay");

const profileBook = document.getElementById("profileBook");

let lastBook = null;


function openReader(reader, book) {

  lastBook = book;

  document.querySelectorAll(".reader-book").forEach(b => {
    b.classList.remove("selected");
  });

  book.classList.add("selected");


  // Update the book cover

  document.getElementById("coverArt").textContent =
    reader.symbol;

  document.getElementById("coverTitle").textContent =
    reader.title.toUpperCase();

  document.getElementById("coverAuthor").textContent =
    reader.author;


  // Update reader information

  document.getElementById("readerAvatar").textContent =
    reader.initial;

  document.getElementById("readerAvatar").style.background =
    reader.color;

  document.getElementById("readerName").textContent =
    reader.name;

  document.getElementById("readerLocation").textContent =
    reader.location;

  document.getElementById("readerBio").textContent =
    reader.bio;


  // Reader interests

  document.getElementById("readerTags").innerHTML =
    reader.tags
      .map(tag => `<span>${escapeHTML(tag)}</span>`)
      .join("");


  // Reader's books

  document.getElementById("readBooks").innerHTML =
    reader.books.map((bookData, index) => {

      return `
        <div class="read-book">

          <span
            class="mini-cover"
            style="background:${palettes[(reader.id + index) % palettes.length]}"
          >
            ${index + 1}
          </span>

          <span>
            <strong>${escapeHTML(bookData[0])}</strong>
            <small>${escapeHTML(bookData[1])}</small>
          </span>

        </div>
      `;

    }).join("");


  // Book they want to exchange

  document.getElementById("swapWish").textContent =
    reader.wish;


  // Demo conversation button

  document.getElementById("messageButton").onclick = () => {

    showToast(
      `Demo: a conversation with ${reader.name} would start here.`
    );

  };


  // Open profile overlay

  overlay.classList.add("open");

  overlay.setAttribute("aria-hidden", "false");

  document.body.style.overflow = "hidden";


  profileBook.style.setProperty(
    "--profile-color",
    reader.color
  );

  document.getElementById("coverArt").style.color =
    "#f0d4a5";

  document.getElementById("profileBook").scrollTop = 0;


  setTimeout(() => {
    document.getElementById("closeProfile").focus();
  }, 150);

}


// ==========================================
// CLOSE PROFILE
// ==========================================

function closeReader() {

  overlay.classList.remove("open");

  overlay.setAttribute("aria-hidden", "true");

  document.body.style.overflow = "";

  if (lastBook) {
    lastBook.classList.remove("selected");
  }

}


document.getElementById("closeProfile").addEventListener(
  "click",
  closeReader
);


overlay.addEventListener("click", event => {

  if (event.target === overlay) {
    closeReader();
  }

});


document.addEventListener("keydown", event => {

  if (
    event.key === "Escape" &&
    overlay.classList.contains("open")
  ) {
    closeReader();
  }

});


// ==========================================
// SAFE HTML TEXT
// ==========================================

function escapeHTML(value) {

  return String(value).replace(/[&<>"']/g, character => {

    return {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    }[character];

  });

}


// ==========================================
// TOAST MESSAGE
// ==========================================

function showToast(message) {

  const toast = document.getElementById("toast");

  toast.textContent = message;

  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 2800);

}


// ==========================================
// SCROLL-LINKED 3D DEPTH EFFECT
// ==========================================

const shelfRoom = document.getElementById("shelfRoom");

const entranceScene = document.querySelector(".entrance-scene");

let ticking = false;


function updateDepth() {

  const y = window.scrollY;


  // Entrance bookshelf moves as the visitor scrolls

  if (entranceScene) {

    const move = Math.min(y * 0.12, 95);

    entranceScene.style.transform =
      `translate3d(0, ${move}px, 0) rotateY(${-Math.min(y * 0.006, 5)}deg)`;

    entranceScene.style.opacity =
      String(Math.max(0.25, 1 - y / 900));

  }


  // Main shelf tilts with scroll position

  if (shelfRoom) {

    const rect = shelfRoom.getBoundingClientRect();

    const progress = Math.max(
      -1,
      Math.min(
        1,
        (window.innerHeight - rect.top) /
        (window.innerHeight + rect.height)
      )
    );

    shelfRoom.style.transform =
      `perspective(1400px) rotateX(${(1 - progress) * 2.2}deg) translateY(${(1 - progress) * 13}px)`;

  }

  ticking = false;

}


window.addEventListener(
  "scroll",
  () => {

    if (!ticking) {

      requestAnimationFrame(updateDepth);

      ticking = true;

    }

  },
  { passive: true }
);

updateDepth();


// ==========================================
// MOBILE NAVIGATION
// ==========================================

document.querySelector(".menu-toggle").addEventListener(
  "click",
  () => {

    document
      .querySelector(".topbar")
      .classList.toggle("nav-open");

  }
);


document.querySelectorAll(".topbar nav a").forEach(link => {

  link.addEventListener("click", () => {

    document
      .querySelector(".topbar")
      .classList.remove("nav-open");

  });

});
