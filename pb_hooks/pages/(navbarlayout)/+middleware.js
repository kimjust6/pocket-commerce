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
    const { client, user } = common.init(context)

    let userOrders = []
    let sessionId = getCookie(context.request, 'cart_session_id');

    // If not logged in and no session ID cookie exists, generate one
    if (!user && !sessionId) {
        sessionId = $security.randomStringWithAlphabet(24, "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789");
        context.response.cookie('cart_session_id', sessionId);
    }

    let cart = null;
    let totalItems = 0;
    let totalPrice = 0.0;
    let cartItems = [];

    try {
        if (user) {
            // Logged in user: find by user relation
            const records = $app.findRecordsByFilter("carts", `user = '${user.id}'`, "-created", 1, 0);
            if (records.length > 0) {
                cart = records[0];
            } else if (sessionId) {
                // If there's a guest cart for this session, associate it with the logged in user
                const guestRecords = $app.findRecordsByFilter("carts", `session_id = '${sessionId}'`, "-created", 1, 0);
                if (guestRecords.length > 0) {
                    cart = guestRecords[0];
                    cart.set("user", user.id);
                    cart.set("session_id", ""); // Clear guest session ID now that it's associated with a user
                    $app.save(cart);
                }
            }
        } else if (sessionId) {
            // Guest user: find by session_id
            const records = $app.findRecordsByFilter("carts", `session_id = '${sessionId}'`, "-created", 1, 0);
            if (records.length > 0) {
                cart = records[0];
            }
        }

        if (cart) {
            const items = $app.findRecordsByFilter("cart_items", `cart = '${cart.id}'`, "-created", 100, 0);
            if (items.length > 0) {
                // Expand variants
                $app.expandRecords(items, ["variant"]);

                // Collect variant records to expand their products
                const variantRecords = items.map(item => item.expandedOne("variant")).filter(Boolean);
                if (variantRecords.length > 0) {
                    $app.expandRecords(variantRecords, ["product"]);
                }

                // Construct clean cart items array and calculate aggregates
                cartItems = items.map(item => {
                    const quantity = item.getInt("quantity");
                    const variant = item.expandedOne("variant");
                    if (!variant) return null;

                    const product = variant.expandedOne("product");
                    if (!product) return null;

                    const price = variant.getFloat("price");
                    const itemTotal = price * quantity;

                    totalItems += quantity;
                    totalPrice += itemTotal;

                    const imagesArray = product.getStringSlice("images");
                    let imageUrl = "https://placehold.co/400x500?text=No+Image";
                    if (imagesArray && imagesArray.length > 0) {
                        imageUrl = `/api/files/products/${product.id}/${imagesArray[0]}`;
                    }

                    return {
                        id: item.id,
                        quantity,
                        price,
                        total: itemTotal,
                        variantId: variant.id,
                        sku: variant.getString("sku"),
                        attributes: common.normalizeJsonField(variant.get("attributes")),
                        productId: product.id,
                        productName: product.getString("name"),
                        productSlug: product.getString("slug"),
                        image: imageUrl
                    };
                }).filter(Boolean);
            }
        }
    } catch (e) {
        console.error("[+middleware.js] Error loading active cart in middleware:", e);
    }

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
