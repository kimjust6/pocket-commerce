const common = require('../../lib/common.js')

// Configure your site URL here (no trailing slash)
const BASE_URL = 'https://store.jkim.win';

/**
 * Safely retrieves a cookie value from the request.
 * Supports request.cookie / request.cookies as either a function or an object/map.
 * @param {any} request - The request object.
 * @param {string} name - The name of the cookie.
 * @returns {any} The cookie value, or null if not found.
 */
const getCookie = (request, name) => {
    if (!request) return null;

    // Check request.cookie
    if (typeof request.cookie === "function") {
        try {
            return request.cookie(name);
        } catch { }
    }
    if (request.cookie && typeof request.cookie === "object") {
        if (request.cookie[name] !== undefined) {
            return request.cookie[name];
        }
    }

    // Check request.cookies
    if (typeof request.cookies === "function") {
        try {
            return request.cookies(name);
        } catch { }
    }
    if (request.cookies && typeof request.cookies === "object") {
        if (request.cookies[name] !== undefined) {
            return request.cookies[name];
        }
    }

    return null;
};

/**
 * Middleware function to provide site metadata and global data.
 * @param {import('pocketpages').MiddlewareContext} context - The middleware context.
 * @returns {Object} The metadata and data object.
 */
module.exports = function (context) {
    const { client, user } = common.init(context);
    const { cart, sessionId, cartItems, totalItems, totalPrice } = common.getCartState(context);

    let userOrders = [];

    return {
        userOrders,
        cartItems,
        totalItems,
        totalPrice,
        metadata: [
            // Basic metadata
            {
                name: 'title',
                content: 'Card Store',
            },
            {
                name: 'description',
                content: "Shop hilariously punny birthday cards and unique greetings for every occasion.",
            },
            { name: 'url', content: BASE_URL },

            // Open Graph metadata
            {
                name: 'og:title',
                content: 'Card Store',
            },
            { name: 'og:type', content: 'website' },
            { name: 'og:url', content: BASE_URL },
            {
                name: 'og:image',
                content: `${BASE_URL}/og-image.webp`,
            },
            { name: 'og:image:alt', content: 'Card Store' },
            { name: 'og:image:width', content: '637' },
            { name: 'og:image:height', content: '425' },
            {
                name: 'og:description',
                content: "Shop hilariously punny birthday cards and unique greetings for every occasion.",
            },
            { name: 'og:site_name', content: 'Card Store' },
            { name: 'og:locale', content: 'en_CA' },

            // Twitter Card metadata (optional, but helpful)
            { name: 'twitter:card', content: 'summary_large_image' },
            { name: 'twitter:site', content: '@MatchaLatteTea' },
            {
                name: 'twitter:title',
                content: 'Card Store',
            },
            {
                name: 'twitter:description',
                content: "Shop hilariously punny birthday cards and unique greetings for every occasion.",
            },
            {
                name: 'twitter:image',
                content: `${BASE_URL}/og-image.webp`,
            },
        ],
    }
}
