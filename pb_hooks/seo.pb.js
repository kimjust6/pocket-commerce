/// <reference path="../pb_data/types.d.ts" />

/**
 * Server-Side SEO Injection, Sitemap, and Robots.txt for PocketBase (GoJA runtime).
 */

routerAdd("GET", "/robots.txt", (e) => {
    const seo = require(__hooks + "/lib/seo.js");
    const origin = seo.getOrigin(e);
    const body = [
        "User-agent: *",
        "Allow: /",
        "Disallow: /account",
        "Disallow: /profile",
        "Disallow: /checkout",
        "Disallow: /cart",
        `Sitemap: ${origin}/sitemap.xml`,
        "",
    ].join("\n");
    e.response.header().set("Content-Type", "text/plain; charset=utf-8");
    return e.string(200, body);
});

routerAdd("GET", "/sitemap.xml", (e) => {
    const seo = require(__hooks + "/lib/seo.js");
    const origin = seo.getOrigin(e);
    const urls = [
        { loc: `${origin}/`, changefreq: "weekly", priority: "1.0" },
        { loc: `${origin}/shop`, changefreq: "daily", priority: "0.9" },
    ];

    try {
        const categories = $app.findRecordsByFilter("categories", "", "name", 100, 0);
        for (let i = 0; i < categories.length; i++) {
            const slug = categories[i].getString("slug");
            if (slug) {
                urls.push({
                    loc: `${origin}/shop?category=${encodeURIComponent(slug)}`,
                    changefreq: "weekly",
                    priority: "0.7",
                });
            }
        }
    } catch (_) {}

    try {
        const products = $app.findRecordsByFilter("products", "status = 'active'", "-updated", 500, 0);
        for (let i = 0; i < products.length; i++) {
            const slug = products[i].getString("slug");
            const updated = products[i].getString("updated");
            if (slug) {
                urls.push({
                    loc: `${origin}/shop/card/${encodeURIComponent(slug)}`,
                    lastmod: updated ? updated.slice(0, 10) : "",
                    changefreq: "weekly",
                    priority: "0.8",
                });
            }
        }
    } catch (_) {}

    const xmlEntries = urls
        .map((u) => {
            const parts = [`    <loc>${seo.escapeHtml(u.loc)}</loc>`];
            if (u.lastmod) parts.push(`    <lastmod>${seo.escapeHtml(u.lastmod)}</lastmod>`);
            if (u.changefreq) parts.push(`    <changefreq>${u.changefreq}</changefreq>`);
            if (u.priority) parts.push(`    <priority>${u.priority}</priority>`);
            return `  <url>\n${parts.join("\n")}\n  </url>`;
        })
        .join("\n");

    const xml =
        `<?xml version="1.0" encoding="UTF-8"?>\n` +
        `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
        `${xmlEntries}\n` +
        `</urlset>\n`;

    e.response.header().set("Content-Type", "application/xml; charset=utf-8");
    return e.string(200, xml);
});

routerAdd("GET", "/{$}", (e) => {
    const seo = require(__hooks + "/lib/seo.js");
    const origin = seo.getOrigin(e);
    let categories = [];
    let products = [];
    try {
        categories = $app.findRecordsByFilter("categories", "", "name", 50, 0);
    } catch (_) {}
    try {
        products = $app.findRecordsByFilter("products", "status = 'active'", "-created", 8, 0);
    } catch (_) {}

    const bodyHtml =
        `<div style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap">` +
        seo.renderNavHtml(categories) +
        `<main>` +
        `<h1>Handcrafted Greeting Cards</h1>` +
        `<p>${seo.escapeHtml(seo.DEFAULT_DESCRIPTION)}</p>` +
        seo.renderProductListHtml(products) +
        `</main>` +
        `</div>`;

    const html = seo.renderSeoHtml(e, __hooks, {
        title: "Handcrafted Greeting Cards",
        description: seo.DEFAULT_DESCRIPTION,
        canonicalPath: "/",
        bodyHtml,
        jsonLd: {
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: seo.SITE_NAME,
            url: `${origin}/`,
            potentialAction: {
                "@type": "SearchAction",
                target: `${origin}/shop?search={search_term_string}`,
                "query-input": "required name=search_term_string",
            },
        },
    });
    return e.html(200, html);
});

routerAdd("GET", "/shop", (e) => {
    const seo = require(__hooks + "/lib/seo.js");
    const categorySlug = e.request.url.query().get("category");
    let title = "Shop All Cards";
    let description =
        "Browse handcrafted greeting cards for birthdays, thank you notes, love, foodies, and animal lovers.";
    let canonicalPath = "/shop";
    let filter = "status = 'active'";
    let categories = [];
    let products = [];

    try {
        categories = $app.findRecordsByFilter("categories", "", "name", 50, 0);
    } catch (_) {}

    if (categorySlug) {
        try {
            const cat = $app.findFirstRecordByData("categories", "slug", categorySlug);
            if (cat) {
                const catName = cat.getString("name");
                title = `${catName} Greeting Cards`;
                description = `Shop handcrafted ${catName.toLowerCase()} greeting cards printed locally on 100% recycled paper stock.`;
                canonicalPath = `/shop?category=${encodeURIComponent(categorySlug)}`;
                filter = `status = 'active' && category = '${cat.id}'`;
            }
        } catch (_) {}
    }

    try {
        products = $app.findRecordsByFilter("products", filter, "-created", 60, 0);
    } catch (_) {}

    const bodyHtml =
        `<div style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap">` +
        seo.renderNavHtml(categories) +
        `<main>` +
        `<h1>${seo.escapeHtml(title)}</h1>` +
        `<p>${seo.escapeHtml(description)}</p>` +
        seo.renderProductListHtml(products) +
        `</main>` +
        `</div>`;

    const html = seo.renderSeoHtml(e, __hooks, { title, description, canonicalPath, bodyHtml });
    return e.html(200, html);
});

routerAdd("GET", "/shop/card/{slug}", (e) => {
    const seo = require(__hooks + "/lib/seo.js");
    const slug = e.request.pathValue("slug");
    const origin = seo.getOrigin(e);

    try {
        let product = null;
        try {
            product = $app.findFirstRecordByData("products", "slug", slug);
        } catch (_) {
            product = $app.findRecordById("products", slug);
        }

        if (product) {
            const name = product.getString("name");
            const description =
                product.getString("description") ||
                `${name} — handcrafted greeting card printed on 100% recycled cotton paper stock.`;
            const images = seo.parseProductImages(product.get("images"));
            const primaryImage = images[0] || seo.DEFAULT_IMAGE;

            const minPrice = seo.getMinVariantPrice(product.id);

            let reviews = [];
            try {
                reviews = $app.findRecordsByFilter("reviews", `product = '${product.id}'`, "", 200, 0);
            } catch (_) {}

            const productSlug = product.getString("slug") || slug;
            const canonicalPath = `/shop/card/${productSlug}`;
            const productSchema = {
                "@context": "https://schema.org",
                "@type": "Product",
                name,
                description,
                image: [seo.resolveUrl(primaryImage, origin)],
                sku: product.id,
                brand: { "@type": "Brand", name: seo.SITE_NAME },
                offers: {
                    "@type": "Offer",
                    url: seo.resolveUrl(canonicalPath, origin),
                    priceCurrency: "USD",
                    price: Number(minPrice !== null ? minPrice : 4.99).toFixed(2),
                    availability: "https://schema.org/InStock",
                },
            };

            if (reviews.length > 0) {
                let sum = 0;
                for (let i = 0; i < reviews.length; i++) {
                    sum += Number(reviews[i].get("rating") || 5);
                }
                productSchema.aggregateRating = {
                    "@type": "AggregateRating",
                    ratingValue: (sum / reviews.length).toFixed(1),
                    reviewCount: reviews.length,
                };
            }

            const bodyHtml =
                `<div style="position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap">` +
                `<nav aria-label="Breadcrumb"><a href="/">Home</a> <a href="/shop">Shop</a></nav>` +
                `<main>` +
                `<h1>${seo.escapeHtml(name)}</h1>` +
                `<img src="${seo.escapeHtml(primaryImage)}" alt="${seo.escapeHtml(name)}" />` +
                `<p>$${Number(minPrice !== null ? minPrice : 4.99).toFixed(2)}</p>` +
                `<p>${seo.escapeHtml(description)}</p>` +
                `</main>` +
                `</div>`;

            const html = seo.renderSeoHtml(e, __hooks, {
                title: name,
                description,
                image: primaryImage,
                type: "product",
                canonicalPath,
                bodyHtml,
                jsonLd: productSchema,
            });
            return e.html(200, html);
        }
    } catch (_) {}

    const fallbackHtml = seo.renderSeoHtml(e, __hooks, {
        title: "Card Not Found",
        description: seo.DEFAULT_DESCRIPTION,
        robots: "noindex, nofollow",
        canonicalPath: `/shop/card/${encodeURIComponent(slug)}`,
    });
    return e.html(404, fallbackHtml);
});

const NO_INDEX_PATHS = ["/cart", "/checkout", "/checkout/success", "/account", "/profile", "/login", "/register"];

for (let i = 0; i < NO_INDEX_PATHS.length; i++) {
    routerAdd("GET", NO_INDEX_PATHS[i], (e) => {
        const seo = require(__hooks + "/lib/seo.js");
        const path = e.request.url.path;
        const html = seo.renderSeoHtml(e, __hooks, {
            title: seo.NO_INDEX_TITLES[path] || "Pocket Commerce",
            robots: "noindex, nofollow",
            canonicalPath: path,
        });
        return e.html(200, html);
    });
}
