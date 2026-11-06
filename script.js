const heroBook = document.getElementById("heroBook");
const openBook = document.getElementById("openBook");
let ticking = false;

function updateScrollScene() {
  const y = window.scrollY || 0;
  const heroHeight = Math.max(1, document.querySelector(".hero").offsetHeight);
  const progress = Math.min(1, Math.max(0, y / (heroHeight * 0.72)));
  if (heroBook && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    const lift = progress * 115;
    const rotate = -25 + progress * 25;
    const scale = 1 + progress * 0.12;
    heroBook.style.transform = `translate(-50%, ${-lift}px) rotateY(${rotate}deg) rotateZ(${-4 + progress * 4}deg) scale(${scale})`;
  }
  if (openBook) {
    const rect = openBook.getBoundingClientRect();
    const visible = Math.min(1, Math.max(0, (window.innerHeight - rect.top) / (window.innerHeight + rect.height)));
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const turn = Math.max(0, Math.min(1, (visible - 0.15) * 1.4));
      const right = openBook.querySelector(".right-page");
      right.style.transform = `rotateY(${-turn * 9}deg)`;
      right.style.boxShadow = `${-turn * 8}px 3px 12px #6a523022`;
    }
  }
  ticking = false;
}
window.addEventListener("scroll", () => {
  if (!ticking) { window.requestAnimationFrame(updateScrollScene); ticking = true; }
}, { passive: true });
window.addEventListener("resize", updateScrollScene);
updateScrollScene();

const dialog = document.getElementById("messageDialog");
const dialogTitle = document.getElementById("dialogTitle");
document.querySelectorAll(".connect-button").forEach(button => {
  button.addEventListener("click", () => {
    dialogTitle.textContent = `Say hello to ${button.dataset.person}`;
    document.getElementById("dialogFeedback").textContent = "";
    dialog.showModal();
  });
});
document.querySelector(".dialog-close").addEventListener("click", () => dialog.close());
document.getElementById("demoSend").addEventListener("click", () => {
  document.getElementById("dialogFeedback").textContent = "Message preview ready. Connect Firebase to send real messages.";
});
document.getElementById("joinButton").addEventListener("click", () => {
  alert("Thanks for your interest in SwapStory! Member registration will be added in the next development stage.");
});
const menuButton = document.querySelector(".menu-toggle");
menuButton.addEventListener("click", () => {
  const nav = document.querySelector(".desktop-nav");
  const opened = nav.classList.toggle("open");
  menuButton.setAttribute("aria-expanded", String(opened));
});
document.querySelectorAll(".desktop-nav a").forEach(link => link.addEventListener("click", () => {
  document.querySelector(".desktop-nav").classList.remove("open");
  menuButton.setAttribute("aria-expanded", "false");
}));
