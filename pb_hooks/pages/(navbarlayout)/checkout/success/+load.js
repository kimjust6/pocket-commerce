const common = require('../../../../lib/common.js');

module.exports = function (context) {
    const { client, user } = common.init(context);

    if (context.request.method === 'GET') {
        let orderId = "";
        try {
            if (context.request.url && context.request.url.searchParams) {
                orderId = context.request.url.searchParams.get('order_id') || "";
            }
        } catch (_) {}

        if (!orderId) {
            context.response.redirect('/shop');
            return;
        }

        let order = null;
        try {
            order = $app.findRecordById("orders", orderId);
        } catch (e) {
            console.error("[checkout/success/+load.js] Order not found:", orderId);
            context.response.redirect('/shop');
            return;
        }

        // Verify the order belongs to the authenticated user
        if (!user || order.getString("user") !== user.id) {
            console.warn("[checkout/success/+load.js] Unauthorized order access. User:", user ? user.id : 'Guest', "Order owner:", order.getString("user"));
            context.response.redirect('/shop');
            return;
        }

        // Query and expand all corresponding order_items
        let orderItems = [];
        try {
            const items = $app.findRecordsByFilter("order_items", `order = '${order.id}'`, "", 100, 0);
            if (items.length > 0) {
                $app.expandRecords(items, ["variant"]);
                const variantRecords = items.map(item => item.expandedOne("variant")).filter(Boolean);
                if (variantRecords.length > 0) {
                    $app.expandRecords(variantRecords, ["product"]);
                }

                orderItems = items.map(item => {
                    const variant = item.expandedOne("variant");
                    const product = variant ? variant.expandedOne("product") : null;
                    
                    let imageUrl = "https://placehold.co/400x500?text=No+Image";
                    if (product) {
                        const imagesArray = product.getStringSlice("images");
                        if (imagesArray && imagesArray.length > 0) {
                            imageUrl = `/api/files/products/${product.id}/${imagesArray[0]}`;
                        }
                    }

                    return {
                        id: item.id,
                        productName: item.getString("product_name"),
                        variantLabel: item.getString("variant_label"),
                        quantity: item.getInt("quantity"),
                        unitPrice: item.getFloat("unit_price"),
                        totalPrice: item.getFloat("total_price"),
                        image: imageUrl
                    };
                });
            }
        } catch (e) {
            console.error("[checkout/success/+load.js] Error fetching order items:", e);
        }

        // Parse shipping address
        let shippingAddress = {};
        try {
            shippingAddress = common.normalizeJsonField(order.get("shipping_address"));
        } catch (e) {
            console.error("[checkout/success/+load.js] Error parsing address:", e);
        }

        // Calculate totals
        const subtotal = order.getFloat("subtotal");
        const shippingCost = order.getFloat("shipping_cost");
        const discount = order.getFloat("discount");
        const tax = order.getFloat("tax");
        const total = order.getFloat("total");

        return {
            order: {
                id: order.id,
                created: order.getString("created"),
                status: order.getString("status"),
                subtotal,
                shippingCost,
                discount,
                tax,
                total,
                shippingAddress,
                notes: order.getString("notes")
            },
            orderItems,
            user
        };
    }
};
