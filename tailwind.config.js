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
                neobrutalism: {
                    "primary": "#D8B4FE",           // Lilac
                    "primary-content": "#000000",
                    "secondary": "#A78BFA",         // Purple
                    "secondary-content": "#000000",
                    "accent": "#F472B6",            // Pink
                    "accent-content": "#000000",
                    "neutral": "#000000",           // Black
                    "neutral-content": "#ffffff",
                    "base-100": "#FFFDF7",          // Warm white / beige
                    "base-200": "#f4f1e1",
                    "base-300": "#e3deca",
                    "base-content": "#000000",
                    "info": "#60A5FA",
                    "success": "#4ADE80",
                    "warning": "#FDE047",
                    "error": "#F87171",
                    "--rounded-box": "0.125rem",
                    "--rounded-btn": "0.125rem",
                    "--rounded-badge": "0.125rem",
                    "--animation-btn": "0",
                    "--animation-input": "0",
                    "--btn-focus-scale": "1",
                    "--tab-radius": "0.125rem",
                },
                neobrutalismdark: {
                    "primary": "#D8B4FE",           // Lilac
                    "primary-content": "#000000",
                    "secondary": "#A78BFA",         // Purple
                    "secondary-content": "#000000",
                    "accent": "#F472B6",            // Pink
                    "accent-content": "#000000",
                    "neutral": "#ffffff",           // White borders
                    "neutral-content": "#000000",
                    "base-100": "#1C1917",          // Very dark slate/brown
                    "base-200": "#292524",
                    "base-300": "#44403C",
                    "base-content": "#FFFFFF",      // White text
                    "info": "#60A5FA",
                    "success": "#4ADE80",
                    "warning": "#FDE047",
                    "error": "#F87171",
                    "--rounded-box": "0.125rem",
                    "--rounded-btn": "0.125rem",
                    "--rounded-badge": "0.125rem",
                    "--animation-btn": "0",
                    "--animation-input": "0",
                    "--btn-focus-scale": "1",
                    "--tab-radius": "0.125rem",
                },
                yellowdark: {
                    "primary": "#FACC15",          // Vibrant yellow
                    "primary-content": "#1C1917",   // Dark text on yellow
                    "secondary": "#e4b159ff",         // Amber/orange
                    "secondary-content": "#1C1917", // Dark text on amber
                    "accent": "#EAB308",            // Yellow accent
                    "accent-content": "#1C1917",    // Dark text on accent
                    "neutral": "#1C1917",           // Dark neutral
                    "neutral-content": "#D4D4D4",   // Light text on dark
                    "base-100": "#000000",          // Darkest background
                    "base-200": "#201f1f",          // Slightly lighter
                    "base-300": "#2b2826",          // Even lighter
                    "base-content": "#E7E5E4",      // Light content text
                    "info": "#38BDF8",              // Sky blue
                    "info-content": "#1C1917",
                    "success": "#4ADE80",           // Green
                    "success-content": "#1C1917",
                    "warning": "#FB923C",           // Orange
                    "warning-content": "#1C1917",
                    "error": "#dd2e2e",             // Red (Darker)
                    "error-content": "#1C1917",
                },
            },
            'light', 'dark', 'cupcake', 'bumblebee', 'emerald', 'corporate', 'synthwave', 'retro', 'cyberpunk', 'valentine', 'halloween', 'garden', 'forest', 'aqua', 'lofi', 'pastel', 'fantasy', 'wireframe', 'black', 'luxury', 'dracula', 'cmyk', 'autumn', 'business', 'acid', 'lemonade', 'night', 'coffee', 'winter', 'dim', 'nord', 'sunset'
        ],
        darkTheme: 'neobrutalism',
        base: true,
        styled: true,
        utils: true,
    },
    plugins: [require('@tailwindcss/typography'), require('daisyui')],
}
