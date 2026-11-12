# Pocket Commerce

**Pocket Commerce** is a premium, self-hosted greeting card ecommerce application featuring a bold, modern Neo-Brutalist aesthetic. Designed for maximum speed and simplicity, it provides complete control over your store's backend, checkout systems, and database with a highly premium user experience.

---

## Features

- **Greeting Card Catalog**: Interactive browsing experience for jokes, memes, and premium greeting cards categorized for quick discovery.
- **Neo-Brutalist Visuals**: Sleek typography, thick borders, robust shadows, and vibrant HSL palettes built with Tailwind CSS, Alpine.js, and DaisyUI.
- **Intuitive Cart & Session Management**: Cart persistence using session cookies, supporting seamless transition of items from guest sessions to authenticated accounts.
- **Smooth Checkout Pipelines**:
  - **Guest Checkout**: Automatic secure guest registration via anonymous authentication plugin so users can check out frictionlessly.
  - **Registered Checkout**: Ability to manage multiple saved addresses and select defaults for one-click orders.
- **Automated Order Processing**: Direct generation of order entries, line items, and payment transactions coupled with real-time stock adjustments.
- **Security & Auth**: Complete user login/registration matching email, passwords, Google OAuth, and secure profile management.
- **Thorough Test Suites**: Ready-to-run Vitest test suites checking cart math, address profiles, checkouts, and system middleware.

---

## Tech Stack

This project is engineered on a modern, high-performance stack:

- **Backend & Database**: [PocketBase](https://pocketbase.io/) (Golang + embedded SQLite) - Powers real-time REST API, Authentication, and database collections.
- **Frontend**: [Vue.js 3](https://vuejs.org/) (Composition API, `<script setup>`) with [Vite](https://vitejs.dev/) for sub-second HMR and optimized builds.
- **State Management**: [Pinia](https://pinia.vuejs.org/) for reactive cart persistence, auth state, and theme management.
- **Routing**: [Vue Router 4](https://router.vuejs.org/) with HTML5 History API.
- **Styling**: [Tailwind CSS v3](https://tailwindcss.com/) + [DaisyUI v4](https://daisyui.com/) with squircle curves and Neo-Brutalist themes.
- **Deployment**: [PocketHost](https://pockethost.io/) via `phio deploy`.

---

## Getting Started

Follow these steps to get your own card commerce store running locally:

### Prerequisites

- **Node.js** (v18+)
- **PocketBase binary** (installed and in your PATH)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/kimjust6/pocket-commerce.git
   cd pocket-commerce
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Run in Development**:
   Starts Vite dev server with proxy to PocketBase:
   ```bash
   npm run dev
   ```
   Or run the services individually:
   - `npm run dev:ui`: Launches Vite development server on `http://localhost:5173`.
   - `npm run dev:pb`: Launches PocketBase server on `http://127.0.0.1:8090`.

4. **Build for Production**:
   Compiles the Vue 3 application into `pb_public/`:
   ```bash
   npm run build
   ```

5. **Deploy to PocketHost**:
   Builds the latest assets and deploys your application to PocketHost:
   ```bash
   npm run push
   ```

---

## Project Structure

- `src/` - Vue 3 Single Page Application
  - `components/` - Modular UI, layout, product card, and cart drawer components
  - `views/` - Route views (Home, Shop, ProductDetail, Cart, Checkout, Account, Profile, Auth)
  - `stores/` - Pinia state stores (cart, auth, theme, toast)
  - `services/` - PocketBase JS SDK client and API wrappers
  - `router/` - Vue Router configuration with auth route guards
- `public/` - Static assets, images, and card illustrations served by Vite and copied to `pb_public/`
- `pb_public/` - Compiled static frontend bundle directly served by PocketBase and deployed to PocketHost
- `pb_hooks/` - PocketBase GoJA hooks (Banano crypto runner, etc.)
- `pb_data/` - SQLite database files and store data
- `tests/` - Vitest unit test suites

---

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open-source and available under the [MIT License](LICENSE).
