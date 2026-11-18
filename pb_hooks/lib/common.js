/**
 * @file Common utility functions and constants for PocketBase hooks.
 * @module common
 */

/**
 * PocketBase Table Name Constants.
 * Use these to avoid hardcoding table names throughout the codebase.
 * @constant {Object<string, string>}
 * @property {string} USERS - The users table
 */
const TABLES = {
    USERS: 'users'
};

module.exports = {
    // Export constants
    TABLES,

    /**
     * Format a date string or Date object to a human-readable format.
     * @param {string|Date|null} date - The date to format
     * @returns {string} Formatted date string (e.g., "Jan 01, 2024") or '-' if invalid
     * @example
     * formatDateTime('2024-01-15') // "Jan 15, 2024"
     * formatDateTime(new Date()) // "Feb 05, 2026"
     * formatDateTime(null) // "-"
     */
    formatDateTime: function (date) {
        if (!date) return '-'
        const d = new Date(date)
        if (isNaN(d.getTime())) return '-'
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        const month = months[d.getMonth()]
        const day = d.getDate().toString().padStart(2, '0')
        const year = d.getFullYear()
        return `${month} ${day}, ${year}`
    },

    /**
     * Helper to get param from various context locations
     * @param {object} context - The pb_hooks context object
     * @param {string} key - The parameter key
     * @returns {string|null} The parameter value or null
     */
    getParam: function (context, key) {
        if (context.params && context.params[key]) return context.params[key]
        if (context.query && context.query[key]) return context.query[key]
        if (typeof context.queryParam === 'function') return context.queryParam(key)
        return null
    },

    /**
     * Helper to safely extract form data from a PocketBase context.
     * Handles both multipart/form-data and JSON bodies (if parsed).
     * @param {object} context - The pb_hooks context object (request/response)
     * @returns {object} Simple key-value object of the form data
     */
    parseFormData: function (context) {
        let data = {}
        try {
            // Try built-in Context.formData() first (multipart/form-data)
            if (typeof context.formData === 'function') {
                const fd = context.formData()
                return fd
            }

            // Fallback to body() for JSON payloads
            if (typeof context.body === 'function') {
                const body = context.body()
                if (body) return body
            }

            // PocketPages templates and hooks also expose body() globally.
            if (typeof body === 'function') {
                const parsedBody = body()
                if (parsedBody) return parsedBody
            }
        } catch (e) {
            console.error('[common.js] Error parsing form data:', e)
        }
        return data
    },

    /**
     * Initialize PocketBase client and get authenticated user.
     * @param {object} context - The pb_hooks context object
     * @returns {{client: any, user: any}} Object containing the initialized client and user model (or null)
     */
    init: function (context) {
        const { request } = context
        const client = context.pb({ request })
        const user = client.authStore.model
        return { client, user }
    },

    normalizeJsonField: function (value) {
        if (value === null || value === undefined) return {}
        if (typeof value === 'string') {
            try {
                return JSON.parse(value)
            } catch (e) {
                return {}
            }
        }
        if (typeof value === 'object') {
            try {
                if (typeof value.string === 'function') {
                    const s = value.string()
                    return s ? JSON.parse(s) : {}
                }
            } catch (e) { }
            try {
                const str = JSON.stringify(value)
                return str ? JSON.parse(str) : {}
            } catch (e) { }
            return value
        }
        return {}
    },

    /**
     * Safely retrieves a cookie value from the request.
     * Supports request.cookie / request.cookies as either a function or an object/map, plus direct header parsing.
     * @param {any} request - The request object.
     * @param {string} name - The name of the cookie.
     * @returns {any} The cookie value, or null if not found.
     */
    getCookie: function (request, name) {
        if (!request) return null;
        if (typeof request.cookie === "function") {
            try {
                const val = request.cookie(name);
                if (val !== undefined && val !== null) return val;
            } catch { }
        }
        if (request.cookie && typeof request.cookie === "object") {
            if (request.cookie[name] !== undefined) return request.cookie[name];
        }
        if (typeof request.cookies === "function") {
            try {
                const val = request.cookies(name);
                if (val !== undefined && val !== null) return val;
            } catch { }
        }
        if (request.cookies && typeof request.cookies === "object") {
            if (request.cookies[name] !== undefined) return request.cookies[name];
        }
        try {
            let cookieHeader = '';
            if (typeof request.header === 'function') {
                cookieHeader = request.header('Cookie') || request.header('cookie') || '';
            } else if (request.headers) {
                cookieHeader = request.headers['cookie'] || request.headers['Cookie'] || '';
            }
            if (cookieHeader) {
                const parts = cookieHeader.split(';');
                for (const part of parts) {
                    const [k, ...v] = part.trim().split('=');
                    if (k === name) {
                        return decodeURIComponent(v.join('='));
                    }
                }
            }
        } catch { }
        return null;
    },

    /**
     * Retrieves active cart items, total count, and subtotal for current user or session.
     * @param {object} context - PocketPages context
     * @returns {{ cart: any, sessionId: string, cartItems: Array, totalItems: number, totalPrice: number }}
     */
    getCartState: function (context) {
        const { client, user } = this.init(context);
        let sessionId = this.getCookie(context.request, 'cart_session_id');

        if (!user && !sessionId && context.response && typeof context.response.cookie === 'function') {
            sessionId = $security.randomStringWithAlphabet(24, "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789");
            context.response.cookie('cart_session_id', sessionId);
        }

        let cart = null;
        let totalItems = 0;
        let totalPrice = 0.0;
        let cartItems = [];

        try {
            if (user) {
                const records = $app.findRecordsByFilter("carts", `user = '${user.id}'`, "", 1, 0);
                if (records.length > 0) {
                    cart = records[0];
                } else if (sessionId) {
                    const guestRecords = $app.findRecordsByFilter("carts", `session_id = '${sessionId}'`, "", 1, 0);
                    if (guestRecords.length > 0) {
                        cart = guestRecords[0];
                        cart.set("user", user.id);
                        cart.set("session_id", "");
                        $app.save(cart);
                    }
                }
            } else if (sessionId) {
                const records = $app.findRecordsByFilter("carts", `session_id = '${sessionId}'`, "", 1, 0);
                if (records.length > 0) {
                    cart = records[0];
                }
            }

            if (cart) {
                const items = $app.findRecordsByFilter("cart_items", `cart = '${cart.id}'`, "", 100, 0);
                if (items.length > 0) {
                    $app.expandRecords(items, ["variant"]);
                    const variantRecords = items.map(item => item.expandedOne("variant")).filter(Boolean);
                    if (variantRecords.length > 0) {
                        $app.expandRecords(variantRecords, ["product"]);
                    }

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
                        let imageUrl = "/card-birthday.webp";
                        if (imagesArray && imagesArray.length > 0) {
                            const img = imagesArray[0];
                            const cleanImg = (img || '').split('"').join('').trim();
                            if (cleanImg.startsWith('http://') || cleanImg.startsWith('https://') || cleanImg.startsWith('/')) {
                                imageUrl = cleanImg;
                            } else {
                                imageUrl = `/api/files/products/${product.id}/${cleanImg}`;
                            }
                        }

                        return {
                            id: item.id,
                            quantity,
                            price,
                            total: itemTotal,
                            variantId: variant.id,
                            sku: variant.getString("sku"),
                            attributes: this.normalizeJsonField(variant.get("attributes")),
                            productId: product.id,
                            productName: product.getString("name"),
                            productSlug: product.getString("slug") || product.getString("name").toLowerCase().replace(/\s+/g, '-'),
                            image: imageUrl,
                            stock: variant.getInt("stock")
                        };
                    }).filter(Boolean);
                }
            }
        } catch (e) {
            console.error("[common.js] Error in getCartState:", e);
        }

        return {
            cart,
            sessionId,
            cartItems,
            totalItems,
            totalPrice: parseFloat(totalPrice.toFixed(2))
        };
    }
};
