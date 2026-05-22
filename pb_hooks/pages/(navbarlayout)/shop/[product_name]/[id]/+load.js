module.exports = function(context) {
    const common = require('../../../../../lib/common.js');
    const productId = common.getParam(context, 'id');
    
    let product = null;
    let variants = [];

    try {
        const productRecord = $app.findRecordById("products", productId);
        $app.expandRecord(productRecord, ["category"]);
        
        const cat = productRecord.expandedOne("category");
        const imagesArray = productRecord.getStringSlice("images");
        
        let imageUrls = [];
        if (imagesArray && imagesArray.length > 0) {
            imageUrls = imagesArray.map(img => `/api/files/products/${productRecord.id}/${img}`);
        } else {
            imageUrls = ["https://placehold.co/600x800?text=No+Image"];
        }

        try {
            const variantRecords = $app.findRecordsByFilter("product_variants", `product='${productId}'`, "", 100, 0);
            variants = variantRecords
                .map(v => ({
                    id: v.id,
                    sku: v.getString('sku'),
                    price: v.getFloat('price'),
                    compare_at_price: v.getFloat('compare_at_price'),
                    stock: v.getInt('stock'),
                    attributes: common.normalizeJsonField(v.get('attributes'))
                }))
                .sort((a, b) => {
                    if (a.stock > 0 && b.stock <= 0) return -1;
                    if (a.stock <= 0 && b.stock > 0) return 1;
                    return a.price - b.price;
                });
        } catch (e) {
            console.error("Failed to load variants", e);
        }

        product = {
            id: productRecord.id,
            name: productRecord.getString('name'),
            description: productRecord.getString('description'),
            category: cat ? { name: cat.getString('name'), slug: cat.getString('slug') } : null,
            images: imageUrls,
            status: productRecord.getString('status')
        };
    } catch (e) {
        console.error("Failed to load product details", e);
    }

    return {
        product,
        variants
    };
};
