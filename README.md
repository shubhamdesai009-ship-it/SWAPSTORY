# SwapStory website starter

A responsive, static front-end concept for **SwapStory** — “Every book has a story. Every exchange begins with one.”

## Included
- Cinematic library-inspired hero with a CSS 3D book emerging from a bookshelf.
- Scroll-linked book movement and page-turn-style interaction.
- Sample book/gift exchange profiles.
- Book DNA section and exchange journey.
- Responsive mobile layout and reduced-motion accessibility support.
- Demo conversation dialog (not connected to a real messaging service).

## Run locally
Open `index.html` in a browser. For a local development server, use VS Code Live Server or run:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## Publish with GitHub + Cloudflare Pages
1. Extract this ZIP file.
2. Create a new GitHub repository, for example `swapstory`.
3. Upload **the contents of this folder** to the repository root. `index.html` must be at the root, not inside an extra nested folder.
4. In Cloudflare, open **Workers & Pages → Create → Pages → Connect to Git**.
5. Select your GitHub repository and production branch (`main`).
6. Framework preset: **None**.
7. Build command: leave blank.
8. Build output directory: `/` (root).
9. Save and deploy.

For later updates, commit and push changes to GitHub; Cloudflare Pages will redeploy automatically.

## Important: what is and isn't connected
This ZIP is a front-end prototype. The profiles are sample content. Sign-up, persistent listings, real matching, secure accounts, and real-time chat are **not connected yet**. Those require a backend such as Firebase (Authentication, Firestore and Storage), plus security rules and moderation/reporting features before a public launch.

## Customization
- Colors, layout and responsive rules: `styles.css`
- Text, page sections and sample profiles: `index.html`
- Scroll effects and demo interactions: `script.js`

Google Fonts are loaded from Google Fonts when online; system serif/sans-serif fallbacks are included.
