module.exports = function (context) {
    const common = require('../../../lib/common.js');
    let categories = [];
    let products = [];

    try {
        const categoryRecords = $app.findRecordsByFilter("categories", "", "name", 100, 0);
        categories = categoryRecords.map(c => ({
            id: c.id,
            name: c.getString('name'),
            slug: c.getString('slug')
        }));
    } catch (e) {
        console.error("Failed to load categories", e);
    }

    const selectedCategorySlug = common.getParam(context, 'category') || null;
    const minPriceParam = common.getParam(context, 'min_price') || null;
    const maxPriceParam = common.getParam(context, 'max_price') || null;
    const availabilityParam = common.getParam(context, 'availability') || null;
    const onSaleParam = common.getParam(context, 'on_sale') || null;

    const minPriceVal = minPriceParam !== null && minPriceParam !== undefined && minPriceParam !== "" && !isNaN(parseFloat(minPriceParam)) ? parseFloat(minPriceParam) : null;
    const maxPriceVal = maxPriceParam !== null && maxPriceParam !== undefined && maxPriceParam !== "" && !isNaN(parseFloat(maxPriceParam)) ? parseFloat(maxPriceParam) : null;

    try {
        let filterStr = "status='active'";
        if (selectedCategorySlug) {
            // Find the category ID for the slug
            const catRec = $app.findFirstRecordByFilter("categories", `slug='${selectedCategorySlug}'`);
            if (catRec) {
                filterStr += ` && category='${catRec.id}'`;
            }
        }

        const productRecords = $app.findRecordsByFilter("products", filterStr, "", 100, 0);
        $app.expandRecords(productRecords, ["category"]);

        // Fetch prices and stock details for all products
        const productIds = productRecords.map(p => p.id);
        
        let minPrices = {}; // productId -> price
        let totalStocks = {}; // productId -> stock
        let isOnSale = {}; // productId -> bool

        try {
            if (productIds.length > 0) {
                // Batch up IDs to avoid query string length limits if there are many products
                const chunkSize = 50;
                for (let i = 0; i < productIds.length; i += chunkSize) {
                    const chunk = productIds.slice(i, i + chunkSize);
                    const variantsFilter = chunk.map(id => `product = '${id}'`).join(' || ');
                    const variants = $app.findRecordsByFilter("product_variants", variantsFilter, "", 1000, 0);
                    
                    variants.forEach(v => {
                        const pId = v.getString('product');
                        const price = v.getFloat('price');
                        const stock = v.getInt('stock');
                        const compareAt = v.getFloat('compare_at_price');

                        if (!minPrices[pId] || price < minPrices[pId]) {
                            minPrices[pId] = price;
                        }
                        totalStocks[pId] = (totalStocks[pId] || 0) + stock;
                        if (compareAt > price) {
                            isOnSale[pId] = true;
                        }
                    });
                }
            }
        } catch (e) {
            console.error("Failed to load variants", e);
        }

        products = productRecords.map(p => {
            const cat = p.expandedOne("category");
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

            let imageUrls = rawImgs.map(img => {
                let cleanImg = (img || '').split('"').join('').trim();
                if (cleanImg.startsWith('http://') || cleanImg.startsWith('https://')) return cleanImg;
                return cleanImg.startsWith('/') ? cleanImg : '/' + cleanImg;
            });
            if (imageUrls.length === 0) {
                imageUrls = ["/card-birthday.webp"];
            }

            const price = minPrices[p.id] || null;
            const stock = totalStocks[p.id] || 0;
            const inStock = stock > 0;
            const onSale = isOnSale[p.id] || false;

            return {
                id: p.id,
                name: p.getString('name'),
                slug: p.getString('slug'),
                description: p.getString('description'),
                category: cat ? { name: cat.getString('name'), slug: cat.getString('slug') } : null,
                price: price,
                image: imageUrls[0],
                images: imageUrls,
                inStock: inStock,
                onSale: onSale
            };
        });

        // Filter products list based on advanced criteria
        if (minPriceVal !== null) {
            products = products.filter(p => p.price !== null && p.price >= minPriceVal);
        }
        if (maxPriceVal !== null) {
            products = products.filter(p => p.price !== null && p.price <= maxPriceVal);
        }
        if (availabilityParam === 'in_stock') {
            products = products.filter(p => p.inStock);
        } else if (availabilityParam === 'out_of_stock') {
            products = products.filter(p => !p.inStock);
        }
        if (onSaleParam == '1') {
            products = products.filter(p => p.onSale);
        }

    } catch (e) {
        console.error("Failed to load products", e);
    }

    return {
        categories,
        products,
        selectedCategory: selectedCategorySlug,
        filters: {
            minPrice: minPriceParam,
            maxPrice: maxPriceParam,
            availability: availabilityParam,
            onSale: onSaleParam
        }
    };
}
