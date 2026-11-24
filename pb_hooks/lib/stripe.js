/**
 * Shared Stripe & order pricing helpers for PocketBase hooks (GoJA runtime).
 * CommonJS only.
 */

const SHIPPING_CONFIG = {
    freeThreshold: 35,
    standardRate: 4.99,
    taxRate: 0.08,
};

const COUPONS = {
    POCKET10: { type: "percent", value: 10 },
    WELCOME20: { type: "percent", value: 20 },
    FREESHIP: { type: "free_shipping", value: 0 },
};

function calculateOrderTotals(items, couponCode) {
    const rawSubtotal = (items || []).reduce(
        (sum, item) => sum + Number(item.price || 0) * Math.max(1, parseInt(item.quantity || 1, 10)),
        0
    );

    const normalizedCode = String(couponCode || "").trim().toUpperCase();
    const coupon = COUPONS[normalizedCode] || null;

    let discountPercent = 0;
    let freeShipping = false;
    if (coupon) {
        if (coupon.type === "percent") discountPercent = coupon.value;
        else if (coupon.type === "free_shipping") freeShipping = true;
    }

    const discountAmount = (rawSubtotal * discountPercent) / 100;
    const shippingAmount =
        rawSubtotal === 0 || rawSubtotal >= SHIPPING_CONFIG.freeThreshold || freeShipping
            ? 0
            : SHIPPING_CONFIG.standardRate;
    const taxableAmount = Math.max(0, rawSubtotal - discountAmount);
    const taxAmount = taxableAmount * SHIPPING_CONFIG.taxRate;
    const computedTotal = Math.max(0, taxableAmount + shippingAmount + taxAmount);

    return {
        rawSubtotal,
        discountAmount,
        shippingAmount,
        taxAmount,
        computedTotal,
    };
}

function buildStripeCheckoutParams({ orderId, email, items, totals, successUrl, cancelUrl }) {
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

    const { rawSubtotal, discountAmount, shippingAmount, taxAmount } = totals;
    const discountRatio =
        rawSubtotal > 0 && discountAmount > 0
            ? Math.max(0, (rawSubtotal - discountAmount) / rawSubtotal)
            : 1;

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

    return params.join("&");
}

function createCheckoutSession(stripeKey, formBody) {
    return $http.send({
        url: "https://api.stripe.com/v1/checkout/sessions",
        method: "POST",
        headers: {
            "Authorization": `Bearer ${stripeKey}`,
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formBody,
    });
}

function fetchCheckoutSession(stripeKey, sessionId) {
    return $http.send({
        url: `https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`,
        method: "GET",
        headers: {
            "Authorization": `Bearer ${stripeKey}`,
        },
    });
}

function verifyWebhookSignature(rawBody, sigHeader, webhookSecret, nowSec) {
    let timestamp = "";
    const signatures = [];
    String(sigHeader || "").split(",").forEach((part) => {
        const idx = part.indexOf("=");
        if (idx === -1) return;
        const k = part.slice(0, idx).trim();
        const v = part.slice(idx + 1).trim();
        if (k === "t") timestamp = v;
        if (k === "v1") signatures.push(v);
    });

    const tsNum = parseInt(timestamp, 10);
    const currentSec = typeof nowSec === "number" ? nowSec : Math.floor(Date.now() / 1000);
    if (!tsNum || Math.abs(currentSec - tsNum) > 300 || signatures.length === 0) {
        return { valid: false, reason: "Invalid or expired Stripe-Signature header." };
    }

    const signedPayload = `${timestamp}.${rawBody}`;
    const expectedSig = $security.hs256(signedPayload, webhookSecret);
    const isValid = signatures.some((sig) => $security.equal(sig, expectedSig));
    if (!isValid) {
        return { valid: false, reason: "Invalid Stripe webhook signature." };
    }

    return { valid: true };
}

function authorizeOrderAccess(auth, order) {
    if (!auth) return false;
    if (auth.getString("role") === "admin") return true;
    return order.getString("user") === auth.id;
}

function markOrderPaid(order, paidCents) {
    if (!order) return false;
    const expectedCents = Math.round(Number(order.get("total_amount") || 0) * 100);
    if (Number(paidCents || 0) >= expectedCents - 5 && order.getString("status") !== "paid") {
        order.set("status", "paid");
        $app.save(order);
        return true;
    }
    return false;
}

module.exports = {
    SHIPPING_CONFIG,
    COUPONS,
    calculateOrderTotals,
    buildStripeCheckoutParams,
    createCheckoutSession,
    fetchCheckoutSession,
    verifyWebhookSignature,
    authorizeOrderAccess,
    markOrderPaid,
};
