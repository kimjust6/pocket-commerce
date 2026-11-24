const SITE_NAME = "Pocket Commerce";
const DEFAULT_DESCRIPTION =
    "Explore our collection of funny, thoughtful, and custom-illustrated cards printed locally on 100% recycled paper stock.";
const DEFAULT_IMAGE = "/og-image.webp";

function escapeHtml(str) {
    return String(str || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function getOrigin(e) {
    const envUrl = $os.getenv("APP_URL");
    if (envUrl) return String(envUrl).replace(/\/+$/, "");

    const info = e.requestInfo();
    const headers = info && info.headers ? info.headers : {};
    const proto = headers["x-forwarded-proto"] || headers["X-Forwarded-Proto"] || (e.request.tls ? "https" : "http");
    const host = headers["x-forwarded-host"] || headers["host"] || headers["Host"] || "localhost:8090";
    return `${proto}://${host}`.replace(/\/+$/, "");
}

function resolveUrl(pathOrUrl, origin) {
    const val = String(pathOrUrl || "");
    if (!val) return origin;
    if (val.indexOf("http://") === 0 || val.indexOf("https://") === 0) return val;
    return origin + (val.charAt(0) === "/" ? val : "/" + val);
}

function loadIndexTemplate(hooksDir) {
    const indexPath = $filepath.join(hooksDir, "..", "pb_public", "index.html");
    return toString($os.readFile(indexPath));
}

function stripDefaultSeoTags(html) {
    return html
        .replace(/<title>[\s\S]*?<\/title>/i, "")
        .replace(/<meta\s+name=["'](?:description|robots|twitter:[^"']+)["'][^>]*\/?>/gi, "")
        .replace(/<meta\s+property=["']og:[^"']+["'][^>]*\/?>/gi, "")
        .replace(/<link\s+rel=["']canonical["'][^>]*\/?>/gi, "");
}

function renderSeoHtml(originOrEvent, hooksDir, opts) {
    const origin = typeof originOrEvent === "string" ? originOrEvent : getOrigin(originOrEvent);
    const fullTitle = opts.title
        ? `${opts.title} | ${SITE_NAME}`
        : `${SITE_NAME} | Handcrafted Stationery & Greeting Cards`;
    const description = opts.description || DEFAULT_DESCRIPTION;
    const robots = opts.robots || "index, follow";
    const type = opts.type || "website";
    const canonicalUrl = resolveUrl(opts.canonicalPath || "/", origin);
    const imageUrl = resolveUrl(opts.image || DEFAULT_IMAGE, origin);

    const headTags = [
        `<title>${escapeHtml(fullTitle)}</title>`,
        `<meta name="description" content="${escapeHtml(description)}" />`,
        `<meta name="robots" content="${escapeHtml(robots)}" />`,
        `<link rel="canonical" href="${escapeHtml(canonicalUrl)}" />`,
        `<meta property="og:site_name" content="${escapeHtml(SITE_NAME)}" />`,
        `<meta property="og:type" content="${escapeHtml(type)}" />`,
        `<meta property="og:title" content="${escapeHtml(fullTitle)}" />`,
        `<meta property="og:description" content="${escapeHtml(description)}" />`,
        `<meta property="og:url" content="${escapeHtml(canonicalUrl)}" />`,
        `<meta property="og:image" content="${escapeHtml(imageUrl)}" />`,
        `<meta name="twitter:card" content="summary_large_image" />`,
        `<meta name="twitter:title" content="${escapeHtml(fullTitle)}" />`,
        `<meta name="twitter:description" content="${escapeHtml(description)}" />`,
        `<meta name="twitter:image" content="${escapeHtml(imageUrl)}" />`,
    ];

    if (opts.jsonLd) {
        const safeJson = JSON.stringify(opts.jsonLd).replace(/</g, "\\u003c");
        headTags.push(`<script id="seo-json-ld" type="application/ld+json">${safeJson}</script>`);
    }

    const baseHtml = stripDefaultSeoTags(loadIndexTemplate(hooksDir));
    let rendered = baseHtml.replace("</head>", `    ${headTags.join("\n    ")}\n  </head>`);
    if (opts.bodyHtml) {
        rendered = rendered.replace(/<div id="app"([^>]*)><\/div>/i, `<div id="app"$1>${opts.bodyHtml}</div>`);
    }
    return rendered;
}

function getMinVariantPrice(productId) {
    try {
        const variants = $app.findRecordsByFilter("product_variants", `product = '${productId}'`, "", 50, 0);
        let minPrice = null;
        for (let i = 0; i < variants.length; i++) {
            const p = Number(variants[i].get("price"));
            if (!isNaN(p) && (minPrice === null || p < minPrice)) {
                minPrice = p;
            }
        }
        return minPrice !== null ? minPrice : 4.99;
    } catch (_) {
        return 4.99;
    }
}

function renderNavHtml(categories) {
    const catLinks = (categories || [])
        .map((c) => {
            const slug = c.getString("slug");
            const name = c.getString("name");
            return `<a href="/shop?category=${encodeURIComponent(slug)}">${escapeHtml(name)}</a>`;
        })
        .join(" ");
    return `<header><nav aria-label="Primary"><a href="/">Pocket Commerce</a> <a href="/shop">Shop All</a> ${catLinks}</nav></header>`;
}

function renderProductListHtml(products) {
    if (!products || products.length === 0) return "";
    const items = products
        .map((p) => {
            const slug = p.getString("slug");
            const name = p.getString("name");
            const desc = p.getString("description") || "";
            const images = parseProductImages(p.get("images"));
            const img = images[0] || DEFAULT_IMAGE;
            const price = getMinVariantPrice(p.id).toFixed(2);
            return (
                `<article>` +
                `<a href="/shop/card/${encodeURIComponent(slug)}">` +
                `<img src="${escapeHtml(img)}" alt="${escapeHtml(name)}" />` +
                `<h2>${escapeHtml(name)}</h2>` +
                `</a>` +
                `<p>$${price}</p>` +
                (desc ? `<p>${escapeHtml(desc)}</p>` : "") +
                `</article>`
            );
        })
        .join("");
    return `<section>${items}</section>`;
}

function parseProductImages(raw) {
    if (Array.isArray(raw)) return raw;
    if (typeof raw === "string" && raw) {
        try {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed)) return parsed;
        } catch (_) {
            return [raw];
        }
    }
    return [DEFAULT_IMAGE];
}

const NO_INDEX_TITLES = {
    "/cart": "Your Shopping Cart",
    "/checkout": "Secure Checkout",
    "/checkout/success": "Order Confirmed",
    "/account": "My Account",
    "/profile": "Profile Settings",
    "/login": "Sign In",
    "/register": "Create Account",
};

module.exports = {
    SITE_NAME,
    DEFAULT_DESCRIPTION,
    DEFAULT_IMAGE,
    NO_INDEX_TITLES,
    escapeHtml,
    getOrigin,
    resolveUrl,
    renderSeoHtml,
    parseProductImages,
    getMinVariantPrice,
    renderNavHtml,
    renderProductListHtml,
};
