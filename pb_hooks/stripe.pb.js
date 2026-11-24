/// <reference path="../pb_data/types.d.ts" />

/**
 * Stripe Checkout & Webhook integration for PocketBase (GoJA runtime).
 *
 * Required environment variables:
 *   STRIPE_SECRET_KEY=sk_test_...
 *   STRIPE_WEBHOOK_SECRET=whsec_...
 *   APP_URL=https://your-domain.com (optional; falls back to request origin)
 */

routerAdd("POST", "/api/stripe/create-checkout-session", (e) => {
    if (!e.auth) {
        return e.json(401, { error: "Authentication required." });
    }

    const stripeKey = $os.getenv("STRIPE_SECRET_KEY");
    if (!stripeKey) {
        return e.json(500, {
            error: "Stripe is not configured. Set STRIPE_SECRET_KEY in your environment variables."
        });
    }

    const stripeLib = require(__hooks + "/lib/stripe.js");
    const info = e.requestInfo();
    const body = info.body || {};
    const orderId = body.orderId;
    const email = body.email || "";
    const couponCode = String(body.couponCode || "").trim().toUpperCase();

    if (!orderId) {
        return e.json(400, { error: "Missing orderId." });
    }

    let order;
    try {
        order = $app.findRecordById("orders", orderId);
    } catch (_) {
        return e.json(404, { error: "Order not found." });
    }

    if (!stripeLib.authorizeOrderAccess(e.auth, order)) {
        return e.json(403, { error: "Forbidden." });
    }

    if (order.getString("status") === "paid") {
        return e.json(400, { error: "Order is already paid." });
    }

    let orderItems = [];
    try {
        orderItems = $app.findRecordsByFilter("order_items", "order = {:orderId}", "", 100, 0, { orderId });
    } catch (_) {}

    if (!orderItems || orderItems.length === 0) {
        return e.json(400, { error: "Order has no items." });
    }

    const items = [];
    for (let i = 0; i < orderItems.length; i++) {
        const oi = orderItems[i];
        const qty = Math.max(1, parseInt(oi.get("quantity") || 1, 10));
        let unitPrice = Number(oi.get("price") || 0);
        let name = "Greeting Card";
        let format = "";

        const productId = oi.getString("product");
        if (productId) {
            try {
                const prod = $app.findRecordById("products", productId);
                if (prod) name = prod.getString("name") || name;
            } catch (_) {}
        }

        const variantId = oi.getString("variant");
        if (variantId) {
            try {
                const variant = $app.findRecordById("product_variants", variantId);
                if (variant) {
                    unitPrice = Number(variant.get("price") ?? unitPrice);
                    const attrs = variant.get("attributes");
                    if (attrs && typeof attrs === "object" && attrs.Format) {
                        format = attrs.Format;
                    }
                }
            } catch (_) {}
        }

        items.push({ name, format, price: unitPrice, quantity: qty });
    }

    const totals = stripeLib.calculateOrderTotals(items, couponCode);
    order.set("total_amount", Number(totals.computedTotal.toFixed(2)));
    $app.save(order);

    const originHeader = info.headers["origin"] || info.headers["Origin"];
    const appUrl = $os.getenv("APP_URL") || originHeader || "http://localhost:5173";
    const baseUrl = appUrl.replace(/\/+$/, "");

    const successUrl = `${baseUrl}/checkout/success?order_id=${encodeURIComponent(orderId)}&session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${baseUrl}/checkout?canceled=true`;

    const formBody = stripeLib.buildStripeCheckoutParams({
        orderId,
        email,
        items,
        totals,
        successUrl,
        cancelUrl,
    });

    try {
        const res = stripeLib.createCheckoutSession(stripeKey, formBody);
        if (res.statusCode < 200 || res.statusCode >= 300) {
            const errMsg = (res.json && res.json.error && res.json.error.message) || "Stripe Checkout creation failed.";
            return e.json(res.statusCode || 500, { error: errMsg });
        }

        return e.json(200, {
            sessionId: res.json.id,
            url: res.json.url,
        });
    } catch (err) {
        return e.json(500, { error: "Failed to communicate with Stripe API: " + String(err) });
    }
});

/**
 * Verify a Stripe Checkout Session on the success page and update order status.
 */
routerAdd("GET", "/api/stripe/verify-session", (e) => {
    if (!e.auth) {
        return e.json(401, { error: "Authentication required." });
    }

    const stripeKey = $os.getenv("STRIPE_SECRET_KEY");
    if (!stripeKey) {
        return e.json(500, { error: "Stripe is not configured." });
    }

    const sessionId = e.request.url.query().get("session_id");
    if (!sessionId) {
        return e.json(400, { error: "Missing session_id parameter." });
    }

    const stripeLib = require(__hooks + "/lib/stripe.js");

    try {
        const res = stripeLib.fetchCheckoutSession(stripeKey, sessionId);
        if (res.statusCode < 200 || res.statusCode >= 300) {
            return e.json(res.statusCode || 500, { error: "Could not verify Stripe session." });
        }

        const session = res.json;
        const orderId = session.client_reference_id || (session.metadata && session.metadata.order_id);
        const isPaid = session.payment_status === "paid";

        if (orderId) {
            let order = null;
            try {
                order = $app.findRecordById("orders", orderId);
            } catch (_) {}

            if (!order) {
                return e.json(404, { error: "Order not found." });
            }

            if (!stripeLib.authorizeOrderAccess(e.auth, order)) {
                return e.json(403, { error: "Forbidden." });
            }

            if (isPaid) {
                try {
                    stripeLib.markOrderPaid(order, session.amount_total);
                } catch (dbErr) {
                    console.error("Failed to update order status:", dbErr);
                }
            }
        }

        return e.json(200, {
            paid: isPaid,
            paymentStatus: session.payment_status,
            orderId: orderId || null,
            amountTotal: (session.amount_total || 0) / 100,
        });
    } catch (err) {
        return e.json(500, { error: "Error verifying Stripe session: " + String(err) });
    }
});

/**
 * Stripe Webhook endpoint for asynchronous payment confirmation.
 */
routerAdd("POST", "/api/stripe/webhook", (e) => {
    const webhookSecret = $os.getenv("STRIPE_WEBHOOK_SECRET");
    if (!webhookSecret) {
        return e.json(500, { error: "Stripe webhook secret is not configured." });
    }

    const rawBody = toString(e.request.body);
    const sigHeader = e.request.header.get("Stripe-Signature");
    if (!sigHeader) {
        return e.json(400, { error: "Missing Stripe-Signature header." });
    }

    const stripeLib = require(__hooks + "/lib/stripe.js");
    const sigCheck = stripeLib.verifyWebhookSignature(rawBody, sigHeader, webhookSecret);
    if (!sigCheck.valid) {
        return e.json(400, { error: sigCheck.reason });
    }

    let event;
    try {
        event = JSON.parse(rawBody);
    } catch {
        return e.json(400, { error: "Invalid JSON payload." });
    }

    if (event.type === "checkout.session.completed") {
        const session = event.data && event.data.object;
        const orderId = session && (session.client_reference_id || (session.metadata && session.metadata.order_id));

        if (orderId && session.payment_status === "paid") {
            try {
                const order = $app.findRecordById("orders", orderId);
                stripeLib.markOrderPaid(order, session.amount_total);
            } catch (dbErr) {
                console.error("Webhook order update error:", dbErr);
            }
        }
    }

    return e.json(200, { received: true });
});
