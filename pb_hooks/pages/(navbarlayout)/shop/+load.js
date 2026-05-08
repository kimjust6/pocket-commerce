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

        // Fetch prices for all products
        const productIds = productRecords.map(p => p.id);
        
        let minPrices = {}; // productId -> price

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
                        if (!minPrices[pId] || price < minPrices[pId]) {
                            minPrices[pId] = price;
                        }
                    });
                }
            }
        } catch (e) {
            console.error("Failed to load variants", e);
        }

        products = productRecords.map(p => {
            const cat = p.expandedOne("category");
            const imagesArray = p.getStringSlice("images");
            let imageUrl = "https://placehold.co/400x500?text=No+Image";
            
            if (imagesArray && imagesArray.length > 0) {
                imageUrl = `/api/files/products/${p.id}/${imagesArray[0]}`;
            }

            return {
                id: p.id,
                name: p.getString('name'),
                slug: p.getString('slug'),
                description: p.getString('description'),
                category: cat ? { name: cat.getString('name'), slug: cat.getString('slug') } : null,
                price: minPrices[p.id] || null,
                image: imageUrl
            };
        });

    } catch (e) {
        console.error("Failed to load products", e);
    }

    return {
        categories,
        products,
        selectedCategory: selectedCategorySlug
    };
}
