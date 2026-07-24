/** @type {import('tailwindcss').Config} */
export default {
    content: ['./pb_hooks/pages/**/*.{ejs,md}'],
    darkMode: 'class',
    theme: {
        extend: {
            fontFamily: {
                serif: ['"Playfair Display"', 'serif'],
            },
        },
    },
    daisyui: {
        themes: [
            {
                light: {
                    "primary": "#2563eb",           // Royal / Brand Blue
                    "primary-content": "#ffffff",
                    "secondary": "#4f46e5",         // Indigo
                    "secondary-content": "#ffffff",
                    "accent": "#0d9488",            // Teal / Emerald
                    "accent-content": "#ffffff",
                    "neutral": "#1e293b",           // Slate dark
                    "neutral-content": "#f8fafc",
                    "base-100": "#ffffff",          // Clean White
                    "base-200": "#f8fafc",          // Slate 50
                    "base-300": "#f1f5f9",          // Slate 100
                    "base-content": "#0f172a",      // Slate 900 body text
                    "info": "#3b82f6",
                    "success": "#10b981",
                    "warning": "#f59e0b",
                    "error": "#ef4444",
                    "--rounded-box": "1rem",
                    "--rounded-btn": "0.5rem",
                    "--rounded-badge": "9999px",
                    "--animation-btn": "0.2s",
                    "--animation-input": "0.2s",
                    "--btn-focus-scale": "0.98",
                    "--tab-radius": "0.5rem",
                },
                dark: {
                    "primary": "#3b82f6",           // Bright Blue
                    "primary-content": "#ffffff",
                    "secondary": "#6366f1",         // Soft Indigo
                    "secondary-content": "#ffffff",
                    "accent": "#14b8a6",            // Soft Teal
                    "accent-content": "#ffffff",
                    "neutral": "#0f172a",           // Very Dark Slate
                    "neutral-content": "#f8fafc",
                    "base-100": "#0f172a",          // Dark Slate Background
                    "base-200": "#1e293b",          // Surface Slate 800
                    "base-300": "#334155",          // Surface Slate 700
                    "base-content": "#f8fafc",      // Light Text
                    "info": "#60a5fa",
                    "success": "#34d399",
                    "warning": "#fbbf24",
                    "error": "#f87171",
                    "--rounded-box": "1rem",
                    "--rounded-btn": "0.5rem",
                    "--rounded-badge": "9999px",
                    "--animation-btn": "0.2s",
                    "--animation-input": "0.2s",
                    "--btn-focus-scale": "0.98",
                    "--tab-radius": "0.5rem",
                },
            },
            'light', 'dark', 'corporate', 'nord'
        ],
        darkTheme: 'dark',
        base: true,
        styled: true,
        utils: true,
    },
    plugins: [require('@tailwindcss/typography'), require('daisyui')],
}
