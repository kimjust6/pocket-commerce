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
    const stripeKey = $os.getenv("STRIPE_SECRET_KEY");
    if (!stripeKey) {
        return e.json(500, {
            error: "Stripe is not configured. Set STRIPE_SECRET_KEY in your environment variables."
        });
    }

    const info = e.requestInfo();
    const body = info.body || {};
    const orderId = body.orderId;
    const email = body.email || "";
    const items = Array.isArray(body.items) ? body.items : [];
    const shippingAmount = Number(body.shippingAmount || 0);
    const taxAmount = Number(body.taxAmount || 0);
    const discountAmount = Number(body.discountAmount || 0);

    if (!orderId || items.length === 0) {
        return e.json(400, { error: "Missing orderId or cart items." });
    }

    // Determine origin for success/cancel redirects
    const originHeader = info.headers["origin"] || info.headers["Origin"];
    const appUrl = $os.getenv("APP_URL") || originHeader || "http://localhost:5173";
    const baseUrl = appUrl.replace(/\/+$/, "");

    const successUrl = `${baseUrl}/checkout/success?order_id=${encodeURIComponent(orderId)}&session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${baseUrl}/checkout?canceled=true`;

    // Build URL-encoded form parameters for Stripe API
    const params = [];
    const addParam = (k, v) => {
        params.push(encodeURIComponent(k) + "=" + encodeURIComponent(String(v)));
    };

    addParam("mode", "payment");
    addParam("success_url", successUrl);
    addParam("cancel_url", cancelUrl);
    addParam("client_reference_id", orderId);
    addParam("metadata[order_id]", orderId);
    if (email) {
        addParam("customer_email", email);
    }

    // Calculate discount ratio if promo code was applied
    const rawSubtotal = items.reduce((sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1), 0);
    const discountRatio = rawSubtotal > 0 && discountAmount > 0 ? Math.max(0, (rawSubtotal - discountAmount) / rawSubtotal) : 1;

    let lineIdx = 0;
    items.forEach((item) => {
        const unitPriceCents = Math.max(50, Math.round(Number(item.price || 0) * discountRatio * 100));
        const qty = Math.max(1, parseInt(item.quantity || 1, 10));
        const name = item.format ? `${item.name} (${item.format})` : (item.name || "Greeting Card");

        addParam(`line_items[${lineIdx}][price_data][currency]`, "usd");
        addParam(`line_items[${lineIdx}][price_data][unit_amount]`, unitPriceCents);
        addParam(`line_items[${lineIdx}][price_data][product_data][name]`, name);
        addParam(`line_items[${lineIdx}][quantity]`, qty);
        lineIdx++;
    });

    if (shippingAmount > 0) {
        addParam(`line_items[${lineIdx}][price_data][currency]`, "usd");
        addParam(`line_items[${lineIdx}][price_data][unit_amount]`, Math.round(shippingAmount * 100));
        addParam(`line_items[${lineIdx}][price_data][product_data][name]`, "Standard Shipping");
        addParam(`line_items[${lineIdx}][quantity]`, 1);
        lineIdx++;
    }

    if (taxAmount > 0) {
        addParam(`line_items[${lineIdx}][price_data][currency]`, "usd");
        addParam(`line_items[${lineIdx}][price_data][unit_amount]`, Math.round(taxAmount * 100));
        addParam(`line_items[${lineIdx}][price_data][product_data][name]`, "Estimated Sales Tax");
        addParam(`line_items[${lineIdx}][quantity]`, 1);
        lineIdx++;
    }

    try {
        const res = $http.send({
            url: "https://api.stripe.com/v1/checkout/sessions",
            method: "POST",
            headers: {
                "Authorization": `Bearer ${stripeKey}`,
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: params.join("&"),
        });

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
    const stripeKey = $os.getenv("STRIPE_SECRET_KEY");
    if (!stripeKey) {
        return e.json(500, { error: "Stripe is not configured." });
    }

    const sessionId = e.request.url.query().get("session_id");
    if (!sessionId) {
        return e.json(400, { error: "Missing session_id parameter." });
    }

    try {
        const res = $http.send({
            url: `https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`,
            method: "GET",
            headers: {
                "Authorization": `Bearer ${stripeKey}`,
            },
        });

        if (res.statusCode < 200 || res.statusCode >= 300) {
            return e.json(res.statusCode || 500, { error: "Could not verify Stripe session." });
        }

        const session = res.json;
        const orderId = session.client_reference_id || (session.metadata && session.metadata.order_id);
        const isPaid = session.payment_status === "paid";

        if (isPaid && orderId) {
            try {
                const order = $app.findRecordById("orders", orderId);
                if (order && order.getString("status") !== "paid") {
                    order.set("status", "paid");
                    $app.save(order);
                }
            } catch (dbErr) {
                console.error("Failed to update order status:", dbErr);
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
    const rawBody = toString(e.request.body);
    const sigHeader = e.request.header.get("Stripe-Signature");

    if (webhookSecret && sigHeader) {
        // Parse t=... and v1=... from Stripe-Signature header
        let timestamp = "";
        const signatures = [];
        sigHeader.split(",").forEach((part) => {
            const [k, v] = part.trim().split("=");
            if (k === "t") timestamp = v;
            if (k === "v1") signatures.push(v);
        });

        const signedPayload = `${timestamp}.${rawBody}`;
        const expectedSig = $security.hs256(signedPayload, webhookSecret);

        const isValid = signatures.some((sig) => $security.equal(sig, expectedSig));
        if (!isValid) {
            return e.json(400, { error: "Invalid Stripe webhook signature." });
        }
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
                if (order) {
                    order.set("status", "paid");
                    $app.save(order);
                }
            } catch (dbErr) {
                console.error("Webhook order update error:", dbErr);
            }
        }
    }

    return e.json(200, { received: true });
});

