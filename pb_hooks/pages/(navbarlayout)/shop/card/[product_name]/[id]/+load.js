module.exports = function(context) {
    const common = require('../../../../../../lib/common.js');
    const productId = common.getParam(context, 'id');
    const { client, user } = common.init(context);
    
    let product = null;
    let variants = [];
    let reviews = [];
    let averageRating = 0;
    let reviewError = null;
    let reviewSuccess = null;
    let userReview = null;

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

        // Handle Review Submission (POST)
        if (context.request && context.request.method === 'POST') {
            const formData = common.parseFormData(context);
            const action = formData.action;

            if (action === 'submit_review') {
                if (!user) {
                    reviewError = "You must be logged in to leave a review.";
                } else {
                    const rating = parseInt(formData.rating || '5', 10);
                    const title = (formData.title || '').trim();
                    const body = (formData.body || '').trim();

                    if (!rating || rating < 1 || rating > 5) {
                        reviewError = "Please select a rating between 1 and 5 stars.";
                    } else if (!title) {
                        reviewError = "Please enter a review title.";
                    } else if (!body) {
                        reviewError = "Please enter review content.";
                    } else {
                        try {
                            const reviewsCollection = $app.findCollectionByNameOrId("reviews");
                            
                            // Check if a review already exists for this user and product
                            const existing = $app.findRecordsByFilter("reviews", `product = '${productId}' && user = '${user.id}'`, "", 1, 0);
                            let reviewRecord;
                            let isEdit = false;
                            
                            if (existing.length > 0) {
                                reviewRecord = existing[0];
                                isEdit = true;
                            } else {
                                reviewRecord = new Record(reviewsCollection);
                                reviewRecord.set("product", productId);
                                reviewRecord.set("user", user.id);
                            }
                            
                            reviewRecord.set("rating", rating);
                            reviewRecord.set("title", title);
                            reviewRecord.set("body", body);

                            // Check if purchase is verified (they ordered this product before)
                            let isVerified = false;
                            try {
                                const orders = $app.findRecordsByFilter("orders", `user = '${user.id}'`, "", 100, 0);
                                if (orders.length > 0) {
                                    const orderIds = orders.map(o => o.id);
                                    for (const oId of orderIds) {
                                        const items = $app.findRecordsByFilter("order_items", `order = '${oId}' && product_name = '${productRecord.getString('name')}'`, "", 1, 0);
                                        if (items.length > 0) {
                                            isVerified = true;
                                            break;
                                        }
                                    }
                                }
                            } catch (err) {
                                console.error("Failed to check verified purchase status:", err);
                            }
                            reviewRecord.set("is_verified_purchase", isVerified);
                            
                            $app.save(reviewRecord);
                            reviewSuccess = isEdit ? "Your review has been updated successfully!" : "Thank you! Your review has been published.";
                        } catch (err) {
                            console.error("Failed to save review:", err);
                            reviewError = "An error occurred while saving your review. Please try again.";
                        }
                    }
                }
            } else if (action === 'delete_review') {
                if (!user) {
                    reviewError = "You must be logged in to delete your review.";
                } else {
                    try {
                        const existing = $app.findRecordsByFilter("reviews", `product = '${productId}' && user = '${user.id}'`, "", 1, 0);
                        if (existing.length > 0) {
                            $app.delete(existing[0]);
                            reviewSuccess = "Your review has been deleted.";
                        } else {
                            reviewError = "Review not found.";
                        }
                    } catch (err) {
                        console.error("Failed to delete review:", err);
                        reviewError = "An error occurred while deleting your review. Please try again.";
                    }
                }
            }
        }

        // Fetch variants
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

        // Fetch logged-in user's existing review if any
        if (user) {
            try {
                const userReviews = $app.findRecordsByFilter("reviews", `product = '${productId}' && user = '${user.id}'`, "", 1, 0);
                if (userReviews.length > 0) {
                    userReview = {
                        id: userReviews[0].id,
                        rating: userReviews[0].getInt("rating"),
                        title: userReviews[0].getString("title"),
                        body: userReviews[0].getString("body")
                    };
                }
            } catch (err) {
                console.error("Failed to fetch user review:", err);
            }
        }

        // Fetch reviews
        let ratingSum = 0;
        try {
            console.log("REVIEWS DEBUG: productId =", productId);
            const reviewRecords = $app.findRecordsByFilter("reviews", `product = '${productId}'`, "", 100, 0);
            console.log("REVIEWS DEBUG: reviewRecords count =", reviewRecords.length);
            if (reviewRecords.length > 0) {
                $app.expandRecords(reviewRecords, ["user"]);
                reviews = reviewRecords.map(r => {
                    const userRec = r.expandedOne("user");
                    const rating = r.getInt("rating");
                    ratingSum += rating;
                    return {
                        id: r.id,
                        rating: rating,
                        title: r.getString("title"),
                        body: r.getString("body"),
                        isVerified: r.getBool("is_verified_purchase"),
                        userName: userRec ? userRec.getString("name") || userRec.getString("username") || "Valued Customer" : "Anonymous",
                        created: common.formatDateTime(r.getString("created"))
                    };
                });
                averageRating = parseFloat((ratingSum / reviews.length).toFixed(1));
            }
        } catch (err) {
            console.log("REVIEWS DEBUG: Failed to load reviews:", err);
            console.error("Failed to load product reviews:", err);
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
        variants,
        reviews,
        averageRating,
        reviewError,
        reviewSuccess,
        user,
        userReview
    };
};
