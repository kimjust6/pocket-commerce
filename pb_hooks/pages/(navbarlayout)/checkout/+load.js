const common = require('../../../lib/common.js');

module.exports = function (context) {
    const { client, user } = common.init(context);

    // Get cookie helper
    const getCookie = (request, name) => {
        if (!request) return null;
        if (typeof request.cookie === "function") {
            try { return request.cookie(name); } catch { }
        }
        if (request.cookie && typeof request.cookie === "object") {
            return request.cookie[name];
        }
        if (typeof request.cookies === "function") {
            try { return request.cookies(name); } catch { }
        }
        if (request.cookies && typeof request.cookies === "object") {
            return request.cookies[name];
        }
        return null;
    };

    let sessionId = getCookie(context.request, 'cart_session_id');

    // 1. Loader GET handling
    if (context.request.method === 'GET') {
        let cart = null;
        if (user) {
            const records = $app.findRecordsByFilter("carts", `user = '${user.id}'`, "", 1, 0);
            if (records.length > 0) cart = records[0];
        } else if (sessionId) {
            const records = $app.findRecordsByFilter("carts", `session_id = '${sessionId}'`, "", 1, 0);
            if (records.length > 0) cart = records[0];
        }

        let cartItems = [];
        let totalPrice = 0.0;
        let totalItems = 0;

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
                        total: itemTotal,
                        variantId: variant.id,
                        sku: variant.getString("sku"),
                        attributes: common.normalizeJsonField(variant.get("attributes")),
                        productName: product.getString("name"),
                        image: imageUrl
                    };
                }).filter(Boolean);
            }
        }

        // If cart is empty, redirect back to /cart
        if (cartItems.length === 0) {
            context.response.redirect('/cart');
            return;
        }

        // Fetch user addresses if authenticated
        let addresses = [];
        if (user) {
            try {
                const addressRecords = $app.findRecordsByFilter("addresses", `user = '${user.id}'`, "", 100, 0);
                addresses = addressRecords.map(a => ({
                    id: a.id,
                    street: a.getString('street'),
                    city: a.getString('city'),
                    state: a.getString('state'),
                    zip: a.getString('zip'),
                    country: a.getString('country'),
                    is_default: a.getBool('is_default')
                }));
            } catch (e) {
                console.error("[checkout/+load.js] Address fetch error:", e);
            }
        }

        const FREE_SHIPPING_THRESHOLD = 30.00;
        const shippingCost = totalPrice >= FREE_SHIPPING_THRESHOLD ? 0.00 : 4.99;
        const finalTotal = totalPrice + shippingCost;

        let errorMsg = null;
        try {
            if (context.request.url && context.request.url.searchParams) {
                errorMsg = context.request.url.searchParams.get('error');
            }
        } catch (_) {}

        return {
            cartItems,
            totalItems,
            totalPrice,
            shippingCost,
            finalTotal,
            addresses,
            user,
            error: errorMsg
        };
    }

    // 2. Action POST handling (Order Creation)
    if (context.request.method === 'POST') {
        try {
            let formData = common.parseFormData(context);
            if (!formData.name && context.request && typeof context.request.formData === 'function') {
                formData = context.request.formData();
            }

            // A. Authentication handling: Sign in anonymous guest if not authenticated
            let activeUser = user;
            if (!activeUser) {
                try {
                    const authData = context.signInAnonymously();
                    if (authData && authData.record) {
                        activeUser = authData.record;
                    }
                } catch (e) {
                    console.error("[checkout/+load.js] Guest anonymous login failed:", e);
                    throw new Error("Checkout failed to associate user credentials.");
                }
            }

            if (!activeUser) {
                throw new Error("Unauthenticated checkout attempt.");
            }

            // B. Resolve Cart and items
            let cart = null;
            // First check if cart is associated with active user
            const userCarts = $app.findRecordsByFilter("carts", `user = '${activeUser.id}'`, "", 1, 0);
            if (userCarts.length > 0) {
                cart = userCarts[0];
            } else if (sessionId) {
                // Otherwise check if there is still a session id cart
                const guestCarts = $app.findRecordsByFilter("carts", `session_id = '${sessionId}'`, "", 1, 0);
                if (guestCarts.length > 0) {
                    cart = guestCarts[0];
                    cart.set("user", activeUser.id);
                    cart.set("session_id", "");
                    $app.save(cart);
                }
            }

            if (!cart) {
                throw new Error("No active shopping cart found.");
            }

            const items = $app.findRecordsByFilter("cart_items", `cart = '${cart.id}'`, "", 100, 0);
            if (items.length === 0) {
                throw new Error("Your shopping cart is empty.");
            }

            $app.expandRecords(items, ["variant"]);
            const variantRecords = items.map(item => item.expandedOne("variant")).filter(Boolean);
            if (variantRecords.length > 0) {
                $app.expandRecords(variantRecords, ["product"]);
            }

            // C. Calculate Order totals
            let subtotal = 0.0;
            items.forEach(item => {
                const variant = item.expandedOne("variant");
                if (variant) {
                    subtotal += variant.getFloat("price") * item.getInt("quantity");
                }
            });

            const FREE_SHIPPING_THRESHOLD = 30.00;
            const shippingCost = subtotal >= FREE_SHIPPING_THRESHOLD ? 0.00 : 4.99;
            const finalTotal = subtotal + shippingCost;

            // D. Parse or create shipping address details
            let shippingAddressObj = {};
            const addressId = formData.address_id;

            if (addressId && addressId !== 'new') {
                const addr = $app.findRecordById("addresses", addressId);
                if (addr && addr.getString("user") === activeUser.id) {
                    shippingAddressObj = {
                        name: formData.name || activeUser.getString("name") || "Valued Customer",
                        email: formData.email || activeUser.getString("email") || "",
                        street: addr.getString("street"),
                        city: addr.getString("city"),
                        state: addr.getString("state"),
                        zip: addr.getString("zip"),
                        country: addr.getString("country")
                    };
                } else {
                    throw new Error("Selected shipping address was not found.");
                }
            } else {
                // Parse new address inputs
                if (!formData.street || !formData.city || !formData.country) {
                    throw new Error("Street, City, and Country are required.");
                }

                shippingAddressObj = {
                    name: formData.name || activeUser.getString("name") || "Valued Customer",
                    email: formData.email || activeUser.getString("email") || "",
                    street: formData.street || "",
                    city: formData.city || "",
                    state: formData.state || "",
                    zip: formData.zip || "",
                    country: formData.country || ""
                };

                // E. Save new address to profile if checked
                if (formData.save_address === 'on' || formData.save_address === 'true' || formData.save_address === true) {
                    const addressCollection = $app.findCollectionByNameOrId("addresses");
                    const addrRec = new Record(addressCollection);
                    addrRec.set("user", activeUser.id);
                    addrRec.set("street", shippingAddressObj.street);
                    addrRec.set("city", shippingAddressObj.city);
                    addrRec.set("state", shippingAddressObj.state);
                    addrRec.set("zip", shippingAddressObj.zip);
                    addrRec.set("country", shippingAddressObj.country);
                    addrRec.set("is_default", false);

                    // If it is the first address, make it default
                    const existing = $app.findRecordsByFilter("addresses", `user = '${activeUser.id}'`);
                    if (existing.length === 0) {
                        addrRec.set("is_default", true);
                    }
                    $app.save(addrRec);
                }
            }

            // F. Create Order record
            const orderCollection = $app.findCollectionByNameOrId("orders");
            const order = new Record(orderCollection);
            order.set("user", activeUser.id);
            order.set("status", "pending");
            order.set("subtotal", subtotal);
            order.set("shipping_cost", shippingCost);
            order.set("tax", 0.0);
            order.set("discount", 0.0);
            order.set("total", finalTotal);
            order.set("shipping_address", JSON.stringify(shippingAddressObj));
            order.set("notes", formData.notes || "");
            $app.save(order);

            // G. Create Order Line Items and Adjust Stock
            items.forEach(item => {
                const variant = item.expandedOne("variant");
                if (!variant) return;
                const product = variant.expandedOne("product");
                if (!product) return;

                const qty = item.getInt("quantity");
                const unitPrice = variant.getFloat("price");
                const totalItemPrice = unitPrice * qty;

                let variantLabel = variant.getString("sku");
                const attrs = common.normalizeJsonField(variant.get("attributes"));
                if (attrs && typeof attrs === 'object') {
                    const keys = Object.keys(attrs);
                    if (keys.length > 0) {
                        variantLabel = keys.map(k => `${k}: ${attrs[k]}`).join(', ');
                    }
                }

                // Create order item
                const orderItemCollection = $app.findCollectionByNameOrId("order_items");
                const orderItem = new Record(orderItemCollection);
                orderItem.set("order", order.id);
                orderItem.set("product_name", product.getString("name"));
                orderItem.set("variant", variant.id);
                orderItem.set("variant_label", variantLabel);
                orderItem.set("quantity", qty);
                orderItem.set("unit_price", unitPrice);
                orderItem.set("total_price", totalItemPrice);
                $app.save(orderItem);

                // Reduce stock
                const oldStock = variant.getInt("stock");
                const newStock = Math.max(0, oldStock - qty);
                variant.set("stock", newStock);
                $app.save(variant);
            });

            // H. Create Payment record
            const paymentCollection = $app.findCollectionByNameOrId("payments");
            const payment = new Record(paymentCollection);
            payment.set("order", order.id);
            payment.set("amount", finalTotal);
            payment.set("provider", formData.payment_method || "manual");
            payment.set("status", "pending");
            $app.save(payment);

            // I. Clear Cart Items
            items.forEach(item => {
                $app.delete(item);
            });

            // J. Redirect to checkout success page
            context.response.redirect(`/checkout/success?order_id=${order.id}`);
            return;
        } catch (e) {
            console.error("[checkout/+load.js] Checkout action error:", e);
            context.response.redirect('/checkout?error=' + encodeURIComponent(e.message || "Failed to process checkout."));
            return;
        }
    }
};
