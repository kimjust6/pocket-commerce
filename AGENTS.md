# AGENTS.md

Welcome to **Pocket Commerce**! This document provides technical guidelines, architecture patterns, and best practices for AI coding agents working within this repository.

---

## 1. Project Overview & Tech Stack

**Pocket Commerce** is a self-hosted e-commerce store with a bold Neo-Brutalist aesthetic.

- **Backend & Database**: [PocketBase](https://pocketbase.io/) (Golang backend with embedded SQLite). Runs server-side JavaScript hooks in a GoJA runtime (`pb_hooks/`).
- **SSR Framework**: [PocketPages](https://github.com/pocketpages/pocketpages) (`pb_hooks/pages/`). File-based routing rendering EJS views with server-side JS data loaders.
- **Styling**: Tailwind CSS v3 + DaisyUI v4 configured with a high-contrast Neo-Brutalist design system.
- **Client Interactivity**: Alpine.js for lightweight client-side state (cart drawers, address modals, interactive components).
- **Testing**: Vitest (`tests/`).

---

## 2. Directory Structure & Key Files

```
pocket-commerce/
├── pb_hooks/                  # PocketBase JavaScript hooks (GoJA runtime)
│   ├── pocketpages.pb.js      # Main PocketPages entrypoint hook
│   ├── lib/                   # Shared CommonJS utilities & services
│   │   ├── common.js          # Shared table constants, date formatters, body parsers, init helpers
│   │   ├── banano.js          # Node bridge for Banano cryptocurrency payments
│   │   └── pocketbase-types.ts# Generated PocketBase TypeScript interfaces
│   └── pages/                 # PocketPages routing directory
│       ├── +config.js         # Global PocketPages configuration & auth plugins
│       ├── (navbarlayout)/    # Route group sharing top navbar layout
│       │   ├── +layout.ejs    # Parent EJS layout view
│       │   ├── +load.js       # Parent data loader for navbar & route context
│       │   ├── +middleware.js # Middleware (session handling, cart cookie parsing)
│       │   ├── index.ejs      # Homepage template view
│       │   ├── shop/          # Product catalog routes
│       │   ├── cart/          # Cart management page
│       │   ├── checkout/      # Order checkout flow
│       │   ├── account/       # Saved addresses & user account settings
│       │   └── profile/       # User profile management
│       ├── login/             # Authentication: Login route (+load.js, +post.js, index.ejs)
│       ├── register/          # Authentication: Registration route (+load.js, +post.js, index.ejs)
│       └── pagenotfound.ejs   # 404 fallback layout
├── pb_public/                 # Compiled static assets served directly by PocketBase
├── pb_data/                   # SQLite database files (DO NOT COMMIT dynamic data)
├── scripts/                   # CLI build & helper scripts (typegen, payment runners)
└── tests/                     # Vitest unit test suites
```

---

## 3. PocketPages Architecture & Conventions

PocketPages implements file-system-based routing inside `pb_hooks/pages/`:

### Routing & File Roles

| Special File | Description & Best Practice |
|---|---|
| `+config.js` | Global PocketPages configuration. Configures plugins (`authPlugin`), error handling, and request lifecycle hooks. |
| `+layout.ejs` | Outer EJS layout template. Receives `<%- body %>` and page context variables. |
| `+load.js` | Server-side data loader. Must export a function `module.exports = function(context)` that returns data passed directly to EJS templates. |
| `+middleware.js` | Folder-level middleware. Runs before `+load.js` and HTTP handlers for all nested routes in the directory. |
| `+post.js` / HTTP Handlers | Handles HTTP POST/PUT/DELETE actions for form submissions or API endpoints. |
| `(group)` | Route grouping folder (parentheses). Groups routes logically to share layouts or middleware without adding a URL path segment. |
| `[param]` | Dynamic path parameter (e.g. `pages/shop/[slug]/+load.js`). Accessible in loader context via `context.params`. |
| `_private/` | Private folder prefix. Excluded from public URL routing. Useful for partials, private helpers, or internal templates. |

### PocketPages Data Loaders (`+load.js`)
```javascript
/**
 * Loader function for route data initialization
 * @type {import('pocketpages').PageDataLoaderFunc}
 */
module.exports = function (context) {
    // Access request, params, PocketBase instance, and user
    const { request, response, params } = context;
    const { client, user } = require('../../lib/common.js').init(context);

    return {
        title: "Page Title",
        user: user,
        // ... returned object properties become variables inside .ejs views
    };
};
```

---

## 4. PocketBase & GoJA Runtime Rules

PocketBase runs JavaScript hooks inside **GoJA** (a Go-based ECMAScript engine), NOT standard Node.js. Keep the following constraints in mind:

1. **CommonJS Only**: Use `require(...)` and `module.exports = ...`. Do **NOT** use ES modules (`import`/`export`) inside `pb_hooks/`.
2. **GoJA Global Objects**:
   - `$app`: Core PocketBase application instance.
   - `$security`: Cryptographic utilities and random string generation (e.g., `$security.randomStringWithAlphabet(...)`).
   - `$os`: System OS operations (e.g., `$os.cmd("node", ...)` for executing external scripts).
   - `$filepath`: Cross-platform path helpers (e.g., `$filepath.join(...)`).
3. **Async / Event Loop Limitations**:
   - GoJA does not support standard Node.js asynchronous event loops or unhandled promises natively.
   - For heavy Node.js libraries requiring async network calls or binary buffers (e.g., `@bananocoin/bananojs`), use external Node scripts invoked via `$os.cmd(...)` (see `pb_hooks/lib/banano.js`).
4. **Database Operations**:
   - Always import table constants from `pb_hooks/lib/common.js` (`TABLES.USERS`, etc.) to prevent hardcoded magic strings.
   - Use PocketBase JS collection query methods: `$app.findRecordsByFilter(...)`, `pb.collection(...)`.

---

## 5. UI, Styling & Frontend Development Rules

1. **Neo-Brutalist Aesthetic**:
   - Maintain thick borders (`border-2`, `border-4`, `border-black`).
   - Hard offset box shadows (`shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`).
   - High-contrast, bold HSL color palettes and DaisyUI components.
2. **SSR First with Alpine.js**:
   - Perform all data fetching, authentication, and layout rendering server-side using PocketPages + EJS.
   - Use **Alpine.js** (`x-data`, `x-show`, `x-on:click`) purely for client-side micro-interactions (modals, dropdowns, cart drawers, dynamic total calculations).
   - Avoid bringing heavy SPA frameworks (React/Vue/Svelte) into the frontend.
3. **Tailwind Compilation**:
   - Source styles live in `pb_hooks/pages/app.tailwind.css`.
   - Output bundle is written to `pb_hooks/pages/app.css`.
   - When introducing new Tailwind classes or DaisyUI themes, verify Tailwind CSS compiles properly via `npm run dev`.

---

## 6. Cart & Session Management Guidelines

- **Session Identification**: Guest sessions rely on a `cart_session_id` cookie set in `+middleware.js`.
- **Cart Migration**: When a guest user logs in or registers, migrate any existing guest cart items (associated with `cart_session_id`) to the newly authenticated `user.id`.
- **Common Initialization**: Always use `common.init(context)` inside loaders and middleware to maintain consistent auth and request context.

---

## 7. Testing & Verification Requirements

- **Run Unit Tests**: Before committing changes to loader logic, cart calculations, address profile management, or checkout flows, execute tests:
  ```bash
  npm run test
  ```
- **Type Generation**: If PocketBase schema or collection fields change, update generated TypeScript definitions:
  ```bash
  npm run typegen
  ```
- **Runtime Sanity Check**: Ensure standard dev server startup completes without errors:
  ```bash
  npm run dev
  ```

---

## 8. Common Commands

- `npm run dev`: Runs Tailwind CSS builder (`--watch`) and PocketBase server (`--dir=pb_data --dev`) concurrently.
- `npm run test`: Runs Vitest test suite (`vitest run`).
- `npm run typegen`: Runs `scripts/typegen.mjs` to rebuild TypeScript types.
- `npm run wsl`: Launches `npm run dev` inside a WSL environment with `.env` variables loaded.

---

## 9. Git & Commit Guidelines

- **No Automatic Commits**: Never run `git commit` or commit changes on behalf of the user. Always leave git commits and staging for the user to review and execute explicitly.
