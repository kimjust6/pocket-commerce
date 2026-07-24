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
                    "primary": "#4f46e5",           // Indigo 600
                    "primary-content": "#ffffff",
                    "secondary": "#7c3aed",         // Violet 600
                    "secondary-content": "#ffffff",
                    "accent": "#06b6d4",            // Cyan / Emerald
                    "accent-content": "#ffffff",
                    "neutral": "#0f172a",           // Slate 900
                    "neutral-content": "#f8fafc",
                    "base-100": "#ffffff",          // Clean Surface
                    "base-200": "#f8fafc",          // Soft Tint
                    "base-300": "#f1f5f9",          // Border Tint
                    "base-content": "#0f172a",      // Text
                    "info": "#3b82f6",
                    "success": "#10b981",
                    "warning": "#f59e0b",
                    "error": "#f43f5e",
                    "--rounded-box": "1.25rem",
                    "--rounded-btn": "0.75rem",
                    "--rounded-badge": "9999px",
                    "--animation-btn": "0.2s",
                    "--animation-input": "0.2s",
                    "--btn-focus-scale": "0.97",
                    "--tab-radius": "0.75rem",
                },
                dark: {
                    "primary": "#6366f1",           // Vibrant Indigo 500
                    "primary-content": "#ffffff",
                    "secondary": "#8b5cf6",         // Vivid Violet 500
                    "secondary-content": "#ffffff",
                    "accent": "#22d3ee",            // Bright Cyan 400
                    "accent-content": "#0f172a",
                    "neutral": "#030712",           // Darkest Slate
                    "neutral-content": "#f9fafb",
                    "base-100": "#0b0f19",          // Deep Slate Dark Base
                    "base-200": "#111827",          // Dark Surface Card
                    "base-300": "#1f2937",          // Dark Surface Elevated
                    "base-content": "#f9fafb",      // Bright Text
                    "info": "#38bdf8",
                    "success": "#34d399",
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
