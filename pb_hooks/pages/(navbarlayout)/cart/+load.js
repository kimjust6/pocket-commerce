/**
 * Loader for the /cart page.
 * Handles adding, updating, removing, and listing shopping cart items.
 * @type {import('pocketpages').PageDataLoaderFunc}
 */
module.exports = function (context) {
    const common = require('../../../lib/common.js');
    const { client, user } = common.init(context);

    const getFormValue = (formData, key, fallback = '') => {
        if (!formData) return fallback;

        const normalizeValue = (value) => {
            if (value === undefined || value === null) return fallback;
            if (Array.isArray(value)) return value.length > 0 ? normalizeValue(value[0]) : fallback;
            if (typeof value === 'string') return value;
            if (typeof value === 'number' || typeof value === 'boolean') return String(value);
            try {
                if (typeof value.string === 'function') return value.string();
            } catch { }
            try {
                return String(value);
            } catch { }
            return fallback;
        };

        if (typeof formData.get === 'function') {
            const value = formData.get(key);
            return normalizeValue(value);
        }

        const value = formData[key];
        return normalizeValue(value);

    };

    const hasFormValue = (formData, key) => {
        if (!formData) return false;
        if (typeof formData.get === 'function') {
            const value = formData.get(key);
            return value !== undefined && value !== null;
        }
        const value = formData[key];
        return value !== undefined && value !== null && value !== '';
    };

    const getRequestFormValue = (key) => {
        try {
            if (context.request && context.request.event && typeof context.request.event.requestInfo === 'function') {
                const info = context.request.event.requestInfo();
                if (info && info.query && info.query[key]) return info.query[key];
                if (info && info.body && info.body[key]) return info.body[key];
            }
            if (context.query && context.query[key]) return context.query[key];
            if (typeof context.queryParam === 'function') {
                const value = context.queryParam(key);
                if (value) return value;
            }
            if (context.request && context.request.url && context.request.url.searchParams) {
                const value = context.request.url.searchParams.get(key);
                if (value) return value;
            }
            if (context.request && context.request.url && context.request.url.search) {
                const query = String(context.request.url.search).replace(/^\?/, '');
                const pairs = query.split('&');
                for (const pair of pairs) {
                    const parts = pair.split('=');
                    if (decodeURIComponent(parts[0] || '') === key) {
                        return decodeURIComponent((parts[1] || '').replace(/\+/g, ' '));
                    }
                }
            }
        } catch { }

        try {
            if (context.request && typeof context.request.formValue === 'function') {
                return context.request.formValue(key);
            }
        } catch { }

        try {
            const eventRequest = context.request && context.request.event && context.request.event.request;
            if (eventRequest && typeof eventRequest.formValue === 'function') {
                return eventRequest.formValue(key);
            }
        } catch { }

        return '';
    };

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
                const records = $app.findRecordsByFilter("carts", `user = '${user.id}'`, "", 1, 0);
                if (records.length > 0) {
                    cart = records[0];
                } else {
                    const collection = $app.findCollectionByNameOrId("carts");
                    cart = new Record(collection);
                    cart.set("user", user.id);
                    $app.save(cart);
                }
            } else if (sessionId) {
                const records = $app.findRecordsByFilter("carts", `session_id = '${sessionId}'`, "", 1, 0);
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

    // Check if JSON / AJAX response is requested
    function isJsonRequest(formData) {
        if (formData && (formData.json === '1' || formData.json === 'true' || formData.ajax === '1' || formData.ajax === 'true')) {
            return true;
        }
        if (getRequestFormValue('json') === '1' || getRequestFormValue('ajax') === '1') {
            return true;
        }
        if (context.request) {
            if (context.request.url && typeof context.request.url.searchParams !== 'undefined') {
                try {
                    const qj = context.request.url.searchParams.get('json');
                    if (qj === '1' || qj === 'true') return true;
                } catch (_) {}
            }
            if (typeof context.request.header === 'function') {
                const accept = (context.request.header('Accept') || context.request.header('accept') || '');
                if (accept.includes('application/json')) return true;
                const xrw = (context.request.header('X-Requested-With') || context.request.header('x-requested-with') || '');
                if (xrw === 'XMLHttpRequest') return true;
            }
            if (context.request.headers) {
                const accept = context.request.headers['accept'] || context.request.headers['Accept'] || '';
                if (typeof accept === 'string' && accept.includes('application/json')) return true;
            }
        }
        return false;
    }

    // 1. Process Form Submissions / Actions (POST)
    if (context.request.method === 'POST') {
        let formData = {};
        try {
            formData = common.parseFormData(context) || {};
        } catch (_) {}

        const asJson = isJsonRequest(formData);

        try {
            if (!hasFormValue(formData, 'action') && context.request && typeof context.request.formData === 'function') {
                try {
                    formData = context.request.formData() || formData;
                } catch (_) {}
            }
            if (!hasFormValue(formData, 'action')) {
                formData = {
                    action: getRequestFormValue('action'),
                    variant_id: getRequestFormValue('variant_id'),
                    product_id: getRequestFormValue('product_id'),
                    quantity: getRequestFormValue('quantity'),
                    item_id: getRequestFormValue('item_id')
                };
            }
            const action = getFormValue(formData, 'action');

            if (action === 'add') {
                let variantId = getFormValue(formData, 'variant_id');
                const productId = getFormValue(formData, 'product_id');
                const quantity = parseInt(getFormValue(formData, 'quantity', '1'), 10);

                if (!variantId && productId) {
                    try {
                        const inStockVariants = $app.findRecordsByFilter("product_variants", `product = '${productId}' && stock > 0`, "price", 1, 0);
                        if (inStockVariants.length > 0) {
                            variantId = inStockVariants[0].id;
                        } else {
                            const allVariants = $app.findRecordsByFilter("product_variants", `product = '${productId}'`, "price", 1, 0);
                            if (allVariants.length > 0) {
                                variantId = allVariants[0].id;
                            }
                        }
                    } catch (_) {}
                }

                if (variantId && quantity > 0) {
                    let variant = null;
                    try {
                        variant = $app.findRecordById("product_variants", variantId);
                    } catch (_) {}
                    const stock = variant ? variant.getInt("stock") : 0;
                    if (stock > 0) {
                        const cart = findOrCreateCart();
                        if (!cart) {
                            if (asJson) {
                                context.response.json(500, { success: false, message: "Could not initialize cart" });
                                return;
                            }
                            context.response.redirect(303, '/cart');
                            return;
                        }

                        // Check if item already exists in this cart
                        const existing = $app.findRecordsByFilter("cart_items", `cart = '${cart.id}' && variant = '${variantId}'`, "", 1, 0);
                        if (existing.length > 0) {
                            const item = existing[0];
                            const nextQuantity = Math.min(item.getInt("quantity") + quantity, stock);
                            if (nextQuantity > 0) {
                                item.set("quantity", nextQuantity);
                                $app.save(item);
                            }
                        } else {
                            const collection = $app.findCollectionByNameOrId("cart_items");
                            const item = new Record(collection);
                            item.set("cart", cart.id);
                            item.set("variant", variantId);
                            item.set("quantity", Math.min(quantity, stock));
                            $app.save(item);
                        }
                    }
                }

            } else if (action === 'update') {
                const itemId = getFormValue(formData, 'item_id');
                const quantity = parseInt(getFormValue(formData, 'quantity', '0'), 10);
                if (itemId) {
                    let item = null;
                    try {
                        item = $app.findRecordById("cart_items", itemId);
                    } catch (_) {}
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
                const itemId = getFormValue(formData, 'item_id');
                if (itemId) {
                    let item = null;
                    try {
                        item = $app.findRecordById("cart_items", itemId);
                    } catch (_) {}
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
                        try {
                            $app.delete(item);
                        } catch (_) {}
                    });
                }
            }

            if (asJson) {
                let updatedTotalItems = 0;
                let updatedTotalPrice = 0.0;
                let updatedCartItems = [];
                const activeCart = findOrCreateCart();
                if (activeCart) {
                    const items = $app.findRecordsByFilter("cart_items", `cart = '${activeCart.id}'`, "", 500, 0);
                    if (items.length > 0) {
                        $app.expandRecords(items, ["variant"]);
                        const variantRecords = items.map(item => item.expandedOne("variant")).filter(Boolean);
                        if (variantRecords.length > 0) {
                            $app.expandRecords(variantRecords, ["product"]);
                        }
                        updatedCartItems = items.map(item => {
                            const q = item.getInt("quantity");
                            const v = item.expandedOne("variant");
                            if (!v) return null;
                            const p = v.expandedOne("product");
                            if (!p) return null;
                            const price = v.getFloat("price");
                            const itemTotal = price * q;
                            updatedTotalItems += q;
                            updatedTotalPrice += itemTotal;

                            const imagesArray = p.getStringSlice("images");
                            let imageUrl = "/card-birthday.webp";
                            if (imagesArray && imagesArray.length > 0) {
                                const img = imagesArray[0];
                                const cleanImg = (img || '').split('"').join('').trim();
                                if (cleanImg.startsWith('http://') || cleanImg.startsWith('https://') || cleanImg.startsWith('/')) {
                                    imageUrl = cleanImg;
                                } else {
                                    imageUrl = `/api/files/products/${p.id}/${cleanImg}`;
                                }
                            }

                            return {
                                id: item.id,
                                quantity: q,
                                price: price,
                                total: itemTotal,
                                variantId: v.id,
                                sku: v.getString("sku"),
                                attributes: common.normalizeJsonField(v.get("attributes")),
                                productId: p.id,
                                productName: p.getString("name"),
                                productSlug: p.getString("slug") || p.getString("name").toLowerCase().replace(/\s+/g, '-'),
                                image: imageUrl,
                                stock: v.getInt("stock")
                            };
                        }).filter(Boolean);
                    }
                }
                context.response.json(200, {
                    success: true,
                    totalItems: updatedTotalItems,
                    totalPrice: updatedTotalPrice,
                    items: updatedCartItems,
                    message: "Cart updated successfully"
                });
                return;
            }

            // Redirect back to page to avoid form double submission and refresh state
            context.response.redirect(303, '/cart');
            return;
        } catch (e) {
            console.error("[cart/+load.js] Action execution error:", e);
            if (asJson) {
                context.response.json(500, { success: false, message: e.message || "Failed to process cart action" });
                return;
            }
            context.response.redirect(303, '/cart');
            return;
        }
    }

    // 2. Fetch Current Cart Items for Presentation (GET)
    let cartItems = [];
    let totalPrice = 0.0;
    let totalItems = 0;

    try {
        let cart = null;
        if (user) {
            const records = $app.findRecordsByFilter("carts", `user = '${user.id}'`, "", 1, 0);
            if (records.length > 0) cart = records[0];
        } else if (sessionId) {
            const records = $app.findRecordsByFilter("carts", `session_id = '${sessionId}'`, "", 1, 0);
            if (records.length > 0) cart = records[0];
        }

        if (cart) {
            const items = $app.findRecordsByFilter("cart_items", `cart = '${cart.id}'`, "", 100, 0);
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
                        const img = imagesArray[0];
                        const cleanImg = (img || '').split('"').join('').trim();
                        if (cleanImg.startsWith('http://') || cleanImg.startsWith('https://')) {
                            imageUrl = cleanImg;
                        } else {
                            imageUrl = `/api/files/products/${product.id}/${cleanImg}`;
                        }
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

    if (isJsonRequest()) {
        context.response.json(200, {
            success: true,
            totalItems,
            totalPrice,
            items: cartItems,
            cartItems
        });
        return;
    }

    return {
        isCartPage: true,
        cartItems,
        totalItems,
        totalPrice,
        user
    };
};
