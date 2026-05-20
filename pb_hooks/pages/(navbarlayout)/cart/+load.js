/**
 * Loader for the /cart page.
 * Handles adding, updating, removing, and listing shopping cart items.
 * @type {import('pocketpages').PageDataLoaderFunc}
 */
module.exports = function (context) {
    const common = require('../../../lib/common.js');
    const { client, user } = common.init(context);

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

    let sessionId = getCookie(context.request, 'cart_session_id');

    // If guest and no session ID cookie exists, generate one
    if (!user && !sessionId) {
        sessionId = $security.randomStringWithAlphabet(24, "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789");
        context.response.cookie('cart_session_id', sessionId);
    }

    /**
     * Helper to find or create the active cart record for the user or guest session.
     */
    function findOrCreateCart() {
        let cart = null;
        try {
            if (user) {
                const records = $app.findRecordsByFilter("carts", `user = '${user.id}'`, "-created", 1, 0);
                if (records.length > 0) {
                    cart = records[0];
                } else {
                    const collection = $app.findCollectionByNameOrId("carts");
                    cart = new Record(collection);
                    cart.set("user", user.id);
                    $app.save(cart);
                }
            } else if (sessionId) {
                const records = $app.findRecordsByFilter("carts", `session_id = '${sessionId}'`, "-created", 1, 0);
                if (records.length > 0) {
                    cart = records[0];
                } else {
                    const collection = $app.findCollectionByNameOrId("carts");
                    cart = new Record(collection);
                    cart.set("session_id", sessionId);
                    $app.save(cart);
                }
            }
        } catch (e) {
            console.error("[cart/+load.js] findOrCreateCart error:", e);
        }
        return cart;
    }

    // 1. Process Form Submissions / Actions (POST)
    if (context.request.method === 'POST') {
        try {
            const formData = context.request.formData();
            const action = formData.action;

            if (action === 'add') {
                const variantId = formData.variant_id;
                const quantity = parseInt(formData.quantity || '1', 10);
                if (variantId && quantity > 0) {
                    const cart = findOrCreateCart();
                    if (cart) {
                        // Check if item already exists in this cart
                        const existing = $app.findRecordsByFilter("cart_items", `cart = '${cart.id}' && variant = '${variantId}'`, "-created", 1, 0);
                        if (existing.length > 0) {
                            const item = existing[0];
                            item.set("quantity", item.getInt("quantity") + quantity);
                            $app.save(item);
                        } else {
                            const collection = $app.findCollectionByNameOrId("cart_items");
                            const item = new Record(collection);
                            item.set("cart", cart.id);
                            item.set("variant", variantId);
                            item.set("quantity", quantity);
                            $app.save(item);
                        }
                    }
                }

            } else if (action === 'update') {
                const itemId = formData.item_id;
                const quantity = parseInt(formData.quantity || '0', 10);
                if (itemId) {
                    const item = $app.findRecordById("cart_items", itemId);
                    if (item) {
                        const cart = item.getString("cart");
                        const activeCart = findOrCreateCart();
                        if (activeCart && cart === activeCart.id) {
                            if (quantity <= 0) {
                                $app.delete(item);
                            } else {
                                item.set("quantity", quantity);
                                $app.save(item);
                            }
                        }
                    }
                }

            } else if (action === 'delete') {
                const itemId = formData.item_id;
                if (itemId) {
                    const item = $app.findRecordById("cart_items", itemId);
                    if (item) {
                        const cart = item.getString("cart");
                        const activeCart = findOrCreateCart();
                        if (activeCart && cart === activeCart.id) {
                            $app.delete(item);
                        }
                    }
                }

            } else if (action === 'clear') {
                const activeCart = findOrCreateCart();
                if (activeCart) {
                    const items = $app.findRecordsByFilter("cart_items", `cart = '${activeCart.id}'`, "", 500, 0);
                    items.forEach(item => {
                        $app.delete(item);
                    });
                }
            }

            // Redirect back to page to avoid form double submission and refresh state
            context.response.redirect('/cart');
            return;
        } catch (e) {
            console.error("[cart/+load.js] Action execution error:", e);
        }
    }

    // 2. Fetch Current Cart Items for Presentation (GET)
    let cartItems = [];
    let totalPrice = 0.0;
    let totalItems = 0;

    try {
        let cart = null;
        if (user) {
            const records = $app.findRecordsByFilter("carts", `user = '${user.id}'`, "-created", 1, 0);
            if (records.length > 0) cart = records[0];
        } else if (sessionId) {
            const records = $app.findRecordsByFilter("carts", `session_id = '${sessionId}'`, "-created", 1, 0);
            if (records.length > 0) cart = records[0];
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
                    const total = price * quantity;
                    
                    totalItems += quantity;
                    totalPrice += total;

                    const imagesArray = product.getStringSlice("images");
                    let imageUrl = "https://placehold.co/400x500?text=No+Image";
                    if (imagesArray && imagesArray.length > 0) {
                        imageUrl = `/api/files/products/${product.id}/${imagesArray[0]}`;
                    }

                    return {
                        id: item.id,
                        quantity,
                        price,
                        total,
                        variantId: variant.id,
                        sku: variant.getString("sku"),
                        attributes: common.normalizeJsonField(variant.get("attributes")),
                        productId: product.id,
                        productName: product.getString("name"),
                        productSlug: product.getString("slug"),
                        image: imageUrl,
                        stock: variant.getInt("stock")
                    };
                }).filter(Boolean);
            }
        }
    } catch (e) {
        console.error("[cart/+load.js] GET fetch error:", e);
    }

    return {
        cartItems,
        totalItems,
        totalPrice,
        user
    };
};
