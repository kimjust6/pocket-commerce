/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './index.html',
        './src/**/*.{vue,js,ts,jsx,tsx}',
        './pb_hooks/pages/**/*.{ejs,md}'
    ],
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
                    "primary": "#c84b31",           // Terracotta Vermilion
                    "primary-content": "#ffffff",
                    "secondary": "#2d6a4f",         // Studio Sage
                    "secondary-content": "#ffffff",
                    "accent": "#c58940",            // Warm Kraft Gold
                    "accent-content": "#ffffff",
                    "neutral": "#1c1917",           // Charcoal Ink
                    "neutral-content": "#faf7f2",
                    "base-100": "#faf7f2",          // Warm Cotton Paper
                    "base-200": "#f2ece1",          // Soft Cream Stock
                    "base-300": "#e6dfd3",          // Paper Border Tint
                    "base-content": "#1c1917",      // Espresso Ink
                    "info": "#3b82f6",
                    "success": "#2d6a4f",
                    "warning": "#d97706",
                    "error": "#be123c",
                    "--rounded-box": "1.25rem",
                    "--rounded-btn": "0.75rem",
                    "--rounded-badge": "9999px",
                    "--animation-btn": "0.2s",
                    "--animation-input": "0.2s",
                    "--btn-focus-scale": "0.97",
                    "--tab-radius": "0.75rem",
                },
                dark: {
                    "primary": "#e06d53",           // Warm Coral Terracotta
                    "primary-content": "#141210",
                    "secondary": "#52b788",         // Soft Sage
                    "secondary-content": "#0b1912",
                    "accent": "#e0a96d",            // Kraft Gold
                    "accent-content": "#141210",
                    "neutral": "#0c0a09",           // Deep Ink
                    "neutral-content": "#f5f0e6",
                    "base-100": "#141210",          // Espresso Paper
                    "base-200": "#1c1917",          // Charcoal Surface
                    "base-300": "#292524",          // Elevated Stone
                    "base-content": "#f5f0e6",      // Warm Bone Text
                    "info": "#38bdf8",
                    "success": "#52b788",
                    "warning": "#fbbf24",
                    "error": "#fb7185",
                    "--rounded-box": "1.25rem",
                    "--rounded-btn": "0.75rem",
                    "--rounded-badge": "9999px",
                    "--animation-btn": "0.2s",
                    "--animation-input": "0.2s",
                    "--btn-focus-scale": "0.97",
                    "--tab-radius": "0.75rem",
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
