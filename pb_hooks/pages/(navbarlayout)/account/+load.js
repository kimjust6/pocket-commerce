/**
 * Loader for the /account profile page.
 * Checks authentication, loads user profile details, and queries their order history.
 * @type {import('pocketpages').PageDataLoaderFunc}
 */
module.exports = function (context) {
    const common = require('../../../lib/common.js');
    const { client, user } = common.init(context);

    // 1. Route Protection: Redirect if unauthenticated
    if (!user) {
        return context.redirect('/login');
    }

    // 2. Fetch fresh profile data
    let profile = user;
    try {
        profile = client.collection('users').getOne(user.id);
    } catch (e) {
        console.error("[account/+load.js] Failed to fetch fresh profile:", e);
    }

    // Shim profile if it lacks PocketBase Record helper functions (e.g. if it's a POJO)
    if (profile && typeof profile.getString !== 'function') {
        const p = profile;
        profile = {
            ...p,
            getString: (key) => p[key] || '',
            collection: () => ({ id: p.collectionId || p.collectionName || 'users' }),
            email: () => p.email || user?.email || '',
        };
    }

    // 3. Fetch user orders and their detailed line items
    let orders = [];
    try {
        const orderRecords = $app.findRecordsByFilter(
            "orders",
            `user = '${user.id}'`,
            "-created",
            100,
            0
        );

        const orderIds = orderRecords.map(o => o.id);
        const itemsByOrderId = {};

        if (orderIds.length > 0) {
            // Retrieve line items in chunks to avoid database query string limits
            const chunkSize = 50;
            for (let i = 0; i < orderIds.length; i += chunkSize) {
                const chunk = orderIds.slice(i, i + chunkSize);
                const itemsFilter = chunk.map(id => `order = '${id}'`).join(' || ');
                const itemRecords = $app.findRecordsByFilter("order_items", itemsFilter, "", 1000, 0);

                itemRecords.forEach(item => {
                    const orderId = item.getString('order');
                    if (!itemsByOrderId[orderId]) {
                        itemsByOrderId[orderId] = [];
                    }
                    itemsByOrderId[orderId].push({
                        id: item.id,
                        product_name: item.getString('product_name'),
                        quantity: item.getInt('quantity'),
                        unit_price: item.getFloat('unit_price'),
                        total_price: item.getFloat('total_price'),
                        variant_label: item.getString('variant_label')
                    });
                });
            }
        }

        orders = orderRecords.map(o => {
            // Safe parsing for shipping address JSON
            let shippingAddress = null;
            try {
                const rawAddr = o.get('shipping_address');
                if (rawAddr) {
                    if (typeof rawAddr === 'string') {
                        shippingAddress = JSON.parse(rawAddr);
                    } else {
                        shippingAddress = rawAddr;
                    }
                }
            } catch (addrErr) {
                console.error("[account/+load.js] Error parsing shipping address for order:", o.id, addrErr);
            }

            return {
                id: o.id,
                status: o.getString('status') || 'pending',
                subtotal: o.getFloat('subtotal') || 0,
                tax: o.getFloat('tax') || 0,
                shipping_cost: o.getFloat('shipping_cost') || 0,
                discount: o.getFloat('discount') || 0,
                total: o.getFloat('total') || 0,
                shipping_address: shippingAddress,
                notes: o.getString('notes') || '',
                created: o.getString('created'),
                items: itemsByOrderId[o.id] || []
            };
        });
    } catch (e) {
        console.error("[account/+load.js] Failed to fetch user orders:", e);
    }

    return {
        profile,
        orders,
        formatDateTime: common.formatDateTime
    };
};
