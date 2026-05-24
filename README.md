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

This project is engineered on a lightweight, high-performance stack designed for simple deployments:

- **Backend**: [PocketBase](https://pocketbase.io/) (Golang + SQLite embedded DB) - Powers Authentication, API endpoints, and data collections.
- **Frontend**: [PocketPages](https://github.com/pocketpages/pocketpages) - Fast, lightweight server-side rendering using **EJS**.
- **Interactivity**: [Alpine.js](https://alpinejs.dev/) - For micro-animations and reactive client-side bindings (Modals, Cart drawers, address select).
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [DaisyUI](https://daisyui.com/) with a curated "neobrutalism" theme.

---

## Getting Started

Follow these steps to get your own card commerce store running locally.

### Prerequisites

- **Node.js** (LTS version recommended)
- **PocketBase**: The PocketBase binary is integrated, running directly on SQLite.

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

3. **Run the Application**:
   Starts the Tailwind CSS builder and the PocketBase server concurrently in development mode:
   ```bash
   npm run dev
   ```

4. **Visit the App**:
   Open [http://localhost:8090](http://localhost:8090) in your browser.

---

## Project Structure

- `pb_hooks/` - Server-side hook handlers and templates.
  - `pages/` - EJS views, static stylesheet bundles, and route loaders (PocketPages framework).
  - `lib/` - Shared business logic and common wrappers.
- `pb_public/` - Compiled static assets.
- `pb_data/` - SQLite database files and store data (generated automatically).
- `tests/` - Vitest unit tests verifying business loader rules.

---

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open-source and available under the [MIT License](LICENSE).
