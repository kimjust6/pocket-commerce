const common = require('../../lib/common.js')

// Configure your site URL here (no trailing slash)
const BASE_URL = 'https://product.jkim.win';

/**
 * Middleware function to provide site metadata and global data.
 * @param {import('pocketpages').MiddlewareContext} context - The middleware context.
 * @returns {Object} The metadata and data object.
 */
module.exports = function (context) {
    const { client, user } = common.init(context)

    let userOrders = []

    return {
        userOrders,
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
