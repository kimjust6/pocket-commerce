/**
 * Loader for the homepage.
 * Provides dynamic data loaded directly from the PocketBase database.
 * @type {import('pocketpages').PageDataLoaderFunc}
 */
module.exports = function (context) {
    try {
        let recentCards = [];
        let featuredHero = null;

        try {
            const productRecords = $app.findRecordsByFilter("products", "status = 'active'", "-created", 12, 0);
            $app.expandRecords(productRecords, ["category"]);

            const productIds = productRecords.map(p => p.id);
            let minPrices = {};
            let compareAtPrices = {};
            let totalStocks = {};

            if (productIds.length > 0) {
                const variantsFilter = productIds.map(id => `product = '${id}'`).join(' || ');
                const variants = $app.findRecordsByFilter("product_variants", variantsFilter, "", 500, 0);
                variants.forEach(v => {
                    const pId = v.getString('product');
                    const price = v.getFloat('price');
                    const compareAt = v.getFloat('compare_at_price');
                    const stock = v.getInt('stock');

                    if (!minPrices[pId] || price < minPrices[pId]) {
                        minPrices[pId] = price;
                    }
                    if (compareAt && compareAt > price) {
                        compareAtPrices[pId] = compareAt;
                    }
                    totalStocks[pId] = (totalStocks[pId] || 0) + stock;
                });
            }

            recentCards = productRecords.map((p, idx) => {
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
                const compareAtVal = compareAtPrices[p.id];
                const compareAtStr = compareAtVal ? '$' + compareAtVal.toFixed(2) : null;
                const inStock = (totalStocks[p.id] || 0) > 0;

                // Uniqlo-style badge logic
                let tag = null;
                if (idx === 0) tag = "NEW ARRIVAL";
                else if (compareAtVal) tag = "SPECIAL OFFER";
                else if (idx === 1) tag = "BEST SELLER";
                else if (idx === 2) tag = "ONLINE ONLY";

                return {
                    id: p.id,
                    title: name,
                    description: p.getString('description') || 'Handcrafted greeting card printed on recycled cardstock.',
                    price: priceStr,
                    priceNum: priceVal || 0,
                    compareAtPrice: compareAtStr,
                    image: imageUrls[0] || '/card-birthday.webp',
                    images: imageUrls.length > 0 ? imageUrls : ['/card-birthday.webp'],
                    slug: slug,
                    category: cat ? cat.getString('name') : null,
                    categorySlug: cat ? cat.getString('slug') : null,
                    inStock: inStock,
                    tag: tag,
                    rating: 5.0,
                    reviewCount: 18 + (idx * 7)
                };
            });

            if (recentCards.length > 0) {
                featuredHero = recentCards[0];
            }
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
            let description = `Curated ${name.toLowerCase()} greeting cards.`;
            let image = '/card-birthday.webp';
            let count = 0;

            if (slug === 'birthday') {
                description = 'Celebrate milestones with clever, witty greeting cards.';
                image = '/card-birthday.webp';
            } else if (slug === 'animals') {
                description = 'Cute critters and playful illustrations for animal lovers.';
                image = '/card-animals.webp';
            } else if (slug === 'food') {
                description = 'Foodie puns and deliciously funny cards for every taste.';
                image = '/card-food.webp';
            } else if (slug === 'love') {
                description = 'Romantic, sweet, and playful messages for your favorite person.';
                image = '/card-love.webp';
            } else if (slug === 'thank-you') {
                description = 'Express gratitude with elegant botanical & artisan designs.';
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

        // Quick Category Navigation List (Uniqlo Category Bar)
        const categoryNav = [
            { label: 'All Cards', href: '/shop', slug: 'all', badge: 'All' },
            { label: 'Birthday', href: '/shop?category=birthday', slug: 'birthday', badge: 'Popular' },
            { label: 'Thank You', href: '/shop?category=thank-you', slug: 'thank-you', badge: 'Staff Pick' },
            { label: 'Love & Romance', href: '/shop?category=love', slug: 'love', badge: null },
            { label: 'Animals', href: '/shop?category=animals', slug: 'animals', badge: null },
            { label: 'Food & Humor', href: '/shop?category=food', slug: 'food', badge: null },
            { label: 'Limited Offers', href: '/shop?on_sale=1', slug: 'sale', badge: 'Sale', isAccent: true }
        ];

        // Uniqlo LifeWear-style Brand Pillars
        const brandPillars = [
            {
                title: '100% Recycled Cotton Cardstock',
                subtitle: 'Sustainable Craft',
                description: 'Heavyweight 350gsm premium textured stock made from 100% post-consumer recycled fibers.',
                icon: 'leaf'
            },
            {
                title: 'Artisanal Hand-Drawn Designs',
                subtitle: 'Original Artwork',
                description: 'Every illustration is hand-crafted with wit, warmth, and attention to typographic detail.',
                icon: 'sparkles'
            },
            {
                title: 'Carbon-Neutral 24h Dispatch',
                subtitle: 'Fast & Plastic-Free',
                description: 'Plastic-free biodegradable packaging shipped next business day with tracked delivery.',
                icon: 'truck'
            },
            {
                title: '100% Happiness Guarantee',
                subtitle: 'Hassle-Free Returns',
                description: 'Love your cards or we will replace or refund your order with zero questions asked.',
                icon: 'heart'
            }
        ];

        let recentReviews = [];
        try {
            const reviewRecords = $app.findRecordsByFilter("reviews", "", "-created", 4, 0);
            $app.expandRecords(reviewRecords, ["user", "product"]);
            recentReviews = reviewRecords.map(r => {
                const u = r.expandedOne("user");
                const p = r.expandedOne("product");
                const userName = u ? (u.getString("name") || u.getString("email").split('@')[0]) : "Verified Shopper";
                const cardTitle = p ? p.getString("name") : "Greeting Card";

                return {
                    id: r.id,
                    userName: userName,
                    rating: r.getInt("rating") || 5,
                    title: r.getString("title") || "Fantastic Quality!",
                    review: r.getString("body") || "The cardstock is thick and gorgeous, and the print colors are vibrant.",
                    cardTitle: cardTitle
                };
            });
        } catch (e) {
            console.error("Failed to load reviews from DB", e);
        }

        // Fallback reviews if DB has none
        if (recentReviews.length === 0) {
            recentReviews = [
                {
                    id: 'rev-1',
                    userName: 'Sarah M.',
                    rating: 5,
                    title: 'The paper quality is stunning',
                    review: 'Ordered three birthday cards and everyone loved the texture and punny humor. Will definitely buy more!',
                    cardTitle: 'Hilarious Toast Greeting Card'
                },
                {
                    id: 'rev-2',
                    userName: 'David L.',
                    rating: 5,
                    title: 'Arrived super fast & plastic-free',
                    review: 'Shipped the next morning in recycled cardboard. The botanical artwork looks even better in person.',
                    cardTitle: 'Coffee & Botany Thank You Card'
                },
                {
                    id: 'rev-3',
                    userName: 'Emily R.',
                    rating: 5,
                    title: 'Best cards on the internet',
                    review: 'The witty messages actually make people laugh out loud. Highly recommend the animal series!',
                    cardTitle: 'Cute Critters Birthday Card'
                },
                {
                    id: 'rev-4',
                    userName: 'Alex K.',
                    rating: 5,
                    title: 'Five stars all the way',
                    review: 'Exceptional craftsmanship and smooth Banano checkout experience. Super happy with my purchase.',
                    cardTitle: 'Punny Food Greeting Card'
                }
            ];
        }

        const metadata = [
            { name: 'title', content: "Pocket Commerce | Handcrafted Greeting Cards & Art Prints" },
            { name: 'description', content: "Discover thoughtfully crafted greeting cards for every celebration. 100% recycled paper, local artisan designs, and fast carbon-neutral shipping." },
            { name: 'og:title', content: "Pocket Commerce | Handcrafted Greeting Cards & Art Prints" },
            { name: 'og:description', content: "Explore thoughtful, witty, and custom-illustrated cards printed locally on 100% recycled paper stock." },
            { name: 'og:image', content: "/og-image.webp" },
            { name: 'og:type', content: "website" }
        ];

        return {
            title: "Pocket Commerce | Handcrafted Greeting Cards & Art Prints",
            recentCards,
            bestSellers: recentCards.slice(0, 8),
            featuredHero: featuredHero || (recentCards.length > 0 ? recentCards[0] : null),
            topCollections,
            categoryNav,
            brandPillars,
            recentReviews,
            metadata
        };
    } catch (e) {
        console.error('Failed to load homepage data:', e);
        return {
            title: "Pocket Commerce",
            recentCards: [],
            bestSellers: [],
            featuredHero: null,
            topCollections: [],
            categoryNav: [],
            brandPillars: [],
            recentReviews: [],
            metadata: []
        };
    }
};

