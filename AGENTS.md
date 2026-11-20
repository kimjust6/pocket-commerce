# AGENTS.md

Welcome to **Pocket Commerce**! This document provides technical guidelines, architecture patterns, and best practices for AI coding agents working within this repository.

---

## 1. Project Overview & Tech Stack

**Pocket Commerce** is a self-hosted e-commerce store for handcrafted greeting cards.

- **Backend & Database**: [PocketBase](https://pocketbase.io/) (Golang backend with embedded SQLite). Runs server-side JavaScript hooks in a GoJA runtime (`pb_hooks/`).
- **Frontend SPA**: Vue 3 (`<script setup>`), Vite, Pinia (`src/stores/`), and Vue Router (`src/router/`), built to `pb_public/` and served by PocketBase.
- **Styling**: Tailwind CSS v3 + DaisyUI v4.
- **Testing**: Vitest (`tests/`).

---

## 2. Directory Structure & Key Files

```
pocket-commerce/
├── index.html                 # Vite SPA HTML entry point
├── vite.config.mjs            # Vite config (proxies /api to 127.0.0.1:8090, builds to pb_public/)
├── src/                       # Vue 3 SPA source
│   ├── main.js                # App bootstrap (Pinia + Router)
│   ├── App.vue                # Root layout (Navbar, RouterView, CartDrawer, Footer, Toast)
│   ├── router/index.js        # Vue Router routes, auth guard, and SEO meta updates
│   ├── services/pocketbase.js # PocketBase JS SDK client & collection service helpers
│   ├── stores/                # Pinia stores (auth, cart, theme, toast)
│   ├── views/                 # Route views (Home, Shop, ProductDetail, Cart, Checkout, Account, etc.)
│   ├── components/            # Reusable UI, cart, layout, auth, and product components
│   └── utils/                 # Formatters and client-side SEO meta helpers
├── pb_hooks/                  # PocketBase JavaScript hooks (GoJA runtime)
│   ├── stripe.pb.js           # Stripe Checkout session creation, verification, and webhook handler
│   ├── seo.pb.js              # Server-side SEO injection, /sitemap.xml, and /robots.txt
│   └── lib/                   # Shared GoJA utilities (seo.js, common.js, banano.js)
├── pb_public/                 # Compiled Vite static assets served directly by PocketBase
├── pb_data/                   # SQLite database files (DO NOT COMMIT dynamic data)
├── scripts/                   # Helper scripts (typegen, Banano runner, phio patch)
└── tests/                     # Vitest unit test suites
```

---

## 3. PocketBase & GoJA Runtime Rules

PocketBase runs JavaScript hooks inside **GoJA** (a Go-based ECMAScript engine), NOT standard Node.js:

1. **CommonJS Only**: Use `require(...)` and `module.exports = ...` inside `pb_hooks/`. Do **NOT** use ES modules (`import`/`export`) in `pb_hooks/`.
2. **GoJA Global Objects**:
   - `$app`: Core PocketBase application instance (`$app.findRecordById`, `$app.findRecordsByFilter`, `$app.save`).
   - `$security`: Cryptographic utilities (`$security.hs256`, `$security.equal`, `$security.randomStringWithAlphabet`).
   - `$http`: Outbound HTTP requests (`$http.send(...)`).
   - `$os`, `$filepath`: OS/environment (`$os.getenv(...)`) and path helpers.
3. **Database Queries**:
   - Always use parameterized filter bindings (`pb.filter('slug = {:slug}', { slug })` on the client, or bind params in `$app.findRecordsByFilter`) rather than string interpolation.
   - Never trust client-supplied prices, discounts, or totals when creating or verifying payment sessions.

---

## 4. Frontend Conventions (`src/`)

- Use Vue 3 Composition API (`<script setup>`) and Pinia stores (`useAuthStore`, `useCartStore`, `useThemeStore`, `useToastStore`).
- Keep PocketBase API calls centralized in `src/services/pocketbase.js`.
- Use Tailwind CSS + DaisyUI utility classes.

---

## 5. Testing & Verification Commands

- `npm run dev`: Runs Vite dev server and PocketBase (`--dir=pb_data --dev`) concurrently.
- `npm run build`: Cleans `pb_public/assets` and builds the Vue SPA into `pb_public/`.
- `npm run test`: Runs Vitest test suite (`vitest run`).
- `npm run typegen`: Runs `scripts/typegen.mjs` to rebuild TypeScript types.

---

## 6. Git & Commit Guidelines

- **No Automatic Commits**: Never run `git commit` or commit changes on behalf of the user. Always leave git commits and staging for the user to review and execute explicitly.
