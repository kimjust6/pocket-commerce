/**
 * Loader for the homepage.
 * Provides dynamic data loaded directly from the PocketBase database.
 * @type {import('pocketpages').PageDataLoaderFunc}
 */
module.exports = function (context) {
    try {
        let recentCards = [];
        try {
            const productRecords = $app.findRecordsByFilter("products", "status = 'active'", "", 6, 0);
            $app.expandRecords(productRecords, ["category"]);

            const productIds = productRecords.map(p => p.id);
            let minPrices = {};
            if (productIds.length > 0) {
                const variantsFilter = productIds.map(id => `product = '${id}'`).join(' || ');
                const variants = $app.findRecordsByFilter("product_variants", variantsFilter, "", 500, 0);
                variants.forEach(v => {
                    const pId = v.getString('product');
                    const price = v.getFloat('price');
                    if (!minPrices[pId] || price < minPrices[pId]) {
                        minPrices[pId] = price;
                    }
                });
            }

            recentCards = productRecords.map(p => {
                const name = p.getString('name');
                const slug = p.getString('slug') || name.toLowerCase().replace(/\s+/g, '-');
                let rawImgs = [];
                try {
                    const strVal = p.getString("images");
                    if (strVal && strVal.trim()) {
                        rawImgs = JSON.parse(strVal);
                    }
                } catch (e) {
                    try {
                        rawImgs = p.getStringSlice("images");
                    } catch (ignore) {}
                }

                if (!Array.isArray(rawImgs)) {
                    rawImgs = rawImgs ? [rawImgs] : [];
                }

                const imageUrls = rawImgs.map(img => {
                    let cleanImg = (img || '').split('"').join('').trim();
                    if (cleanImg.startsWith('http://') || cleanImg.startsWith('https://')) return cleanImg;
                    return cleanImg.startsWith('/') ? cleanImg : '/' + cleanImg;
                });
                const cat = p.expandedOne("category");
                const priceVal = minPrices[p.id];
                const priceStr = priceVal !== undefined && priceVal !== null ? '$' + priceVal.toFixed(2) : 'Sold Out';

                return {
                    id: p.id,
                    title: name,
                    price: priceStr,
                    image: imageUrls[0] || '/card-birthday.webp',
                    images: imageUrls.length > 0 ? imageUrls : ['/card-birthday.webp'],
                    slug: slug,
                    category: cat ? cat.getString('name') : null
                };
            });
        } catch (e) {
            console.error("Failed to load recent products from DB", e);
        }

        let categoryRecords = [];
        try {
            categoryRecords = $app.findRecordsByFilter("categories", "", "name", 100, 0);
        } catch (e) {
            console.error("Failed to load categories", e);
        }

        const topCollections = categoryRecords.map(c => {
            const name = c.getString('name');
            const slug = c.getString('slug');
            let description = `Hilarious ${name.toLowerCase()} greetings.`;
            let image = '/card-birthday.webp';
            let count = 0;

            if (slug === 'birthday') {
                description = 'Punny cards for everyone turning a year older.';
                image = '/card-birthday.webp';
            } else if (slug === 'animals') {
                description = 'Hilarious greetings featuring cute critters.';
                image = '/card-animals.webp';
            } else if (slug === 'food') {
                description = 'Deliciously funny cards for food lovers.';
                image = '/card-food.webp';
            } else if (slug === 'love') {
                description = 'Romantic puns to make your partner laugh.';
                image = '/card-love.webp';
            } else if (slug === 'thank-you') {
                description = 'Thoughtful botanical & coffee thank you cards.';
                image = '/card-thankyou.webp';
            }

            try {
                const products = $app.findRecordsByFilter("products", `category = '${c.id}' && status = 'active'`, "", 500, 0);
                count = products.length;
            } catch (e) {}

            return {
                id: c.id,
                slug: slug,
                title: name,
                description: description,
                count: count,
                images: [image]
            };
        });

        let recentReviews = [];
        try {
            const reviewRecords = $app.findRecordsByFilter("reviews", "", "", 4, 0);
            $app.expandRecords(reviewRecords, ["user", "product"]);
            recentReviews = reviewRecords.map(r => {
                const u = r.expandedOne("user");
                const p = r.expandedOne("product");
                const userName = u ? (u.getString("name") || u.getString("email")) : "Verified Buyer";
                const cardTitle = p ? p.getString("name") : "Greeting Card";

                return {
                    id: r.id,
                    userName: userName,
                    rating: r.getInt("rating") || 5,
                    title: r.getString("title"),
                    review: r.getString("body"),
                    cardTitle: cardTitle
                };
            });
        } catch (e) {
            console.error("Failed to load reviews from DB", e);
        }

        return {
            recentCards,
            topCollections,
            recentReviews
        };
    } catch (e) {
        console.error('Failed to load homepage data:', e);
        return {
            recentCards: [],
            topCollections: [],
            recentReviews: []
        };
    }
};
