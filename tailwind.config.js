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
                // "Glacier Mist" — cute blue pastel light theme
                light: {
                    'primary': '#3B7BA8',           // cheerful ocean periwinkle
                    'primary-content': '#ffffff',
                    'secondary': '#78B2E8',          // soft powder sky blue
                    'secondary-content': '#ffffff',
                    'accent': '#FA6B86',             // sweet strawberry blush
                    'accent-content': '#ffffff',
                    'neutral': '#1C2A39',
                    'neutral-content': '#ffffff',
                    'base-100': '#F4F8FD',           // fresh cloud pastel — page bg
                    'base-200': '#E3EEFA',           // soft marshmallow mist
                    'base-300': '#BED8F4',           // deeper mist blue — cards, navbar, borders
                    'base-content': '#142436',       // dark slate navy
                    'info': '#5CA6E8',
                    'info-content': '#ffffff',
                    'success': '#43B581',            // fresh mint
                    'success-content': '#ffffff',
                    'warning': '#F5A623',            // warm honey sunshine
                    'warning-content': '#ffffff',
                    'error': '#E5566E',              // soft strawberry red
                    'error-content': '#ffffff',
                    "--rounded-box": "1.5rem",
                    "--rounded-btn": "9999px",
                    "--rounded-badge": "9999px",
                    "--animation-btn": "0.2s",
                    "--animation-input": "0.2s",
                    "--btn-focus-scale": "0.97",
                    "--tab-radius": "9999px",
                },
                nord: {
                    'primary': '#3B7BA8',           // cheerful ocean periwinkle
                    'primary-content': '#ffffff',
                    'secondary': '#78B2E8',          // soft powder sky blue
                    'secondary-content': '#ffffff',
                    'accent': '#FA6B86',             // sweet strawberry blush
                    'accent-content': '#ffffff',
                    'neutral': '#1C2A39',
                    'neutral-content': '#ffffff',
                    'base-100': '#F4F8FD',           // fresh cloud pastel — page bg
                    'base-200': '#E3EEFA',           // soft marshmallow mist
                    'base-300': '#BED8F4',           // deeper mist blue — cards, navbar, borders
                    'base-content': '#142436',       // dark slate navy
                    'info': '#5CA6E8',
                    'info-content': '#ffffff',
                    'success': '#43B581',            // fresh mint
                    'success-content': '#ffffff',
                    'warning': '#F5A623',            // warm honey sunshine
                    'warning-content': '#ffffff',
                    'error': '#E5566E',              // soft strawberry red
                    'error-content': '#ffffff',
                    "--rounded-box": "1.5rem",
                    "--rounded-btn": "9999px",
                    "--rounded-badge": "9999px",
                    "--animation-btn": "0.2s",
                    "--animation-input": "0.2s",
                    "--btn-focus-scale": "0.97",
                    "--tab-radius": "9999px",
                },
                // "Midnight Studio" — deep navy dark theme
                dark: {
                    'color-scheme': 'dark',
                    'primary': '#68A8E2',           // vivid friendly electric blue
                    'primary-content': '#06111f',
                    'secondary': '#9FD2F6',          // pale sky blue
                    'secondary-content': '#071624',
                    'accent': '#F8B146',             // honey sunshine warm focal point
                    'accent-content': '#1a1000',
                    'neutral': '#1e2535',
                    'neutral-content': '#a6adbb',
                    'base-100': '#0f141c',           // deep navy — main bg
                    'base-200': '#0b0f16',           // darker navy
                    'base-300': '#070a11',           // near-black navy — cards, navbar
                    'base-content': '#b0bdd4',       // soft blue-grey text
                    'info': '#68A8E2',
                    'info-content': '#06111f',
                    'success': '#5cb88a',
                    'success-content': '#061a0f',
                    'warning': '#F8B146',
                    'warning-content': '#1a1000',
                    'error': '#E56D6D',
                    'error-content': '#200808',
                    "--rounded-box": "1.5rem",
                    "--rounded-btn": "9999px",
                    "--rounded-badge": "9999px",
                    "--animation-btn": "0.2s",
                    "--animation-input": "0.2s",
                    "--btn-focus-scale": "0.97",
                    "--tab-radius": "9999px",
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
