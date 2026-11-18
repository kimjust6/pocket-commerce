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

    if (!productId) {
        return {
            product: null,
            variants: [],
            reviews: [],
            averageRating: 0,
            reviewError: null,
            reviewSuccess: null,
            user,
            userReview: null
        };
    }

    try {
        const productRecord = $app.findRecordById("products", productId);
        if (!productRecord) {
            return {
                product: null,
                variants: [],
                reviews: [],
                averageRating: 0,
                reviewError: "Product not found",
                reviewSuccess: null,
                user,
                userReview: null
            };
        }

        $app.expandRecord(productRecord, ["category"]);
        const cat = productRecord.expandedOne("category");

        let rawImgs = [];
        try {
            const strVal = productRecord.getString("images");
            if (strVal && strVal.trim()) {
                rawImgs = JSON.parse(strVal);
            }
        } catch (e) {
            try {
                rawImgs = productRecord.getStringSlice("images");
            } catch (ignore) {}
        }

        if (!Array.isArray(rawImgs)) {
            rawImgs = rawImgs ? [rawImgs] : [];
        }

        let imageUrls = rawImgs.map(img => {
            let cleanImg = (img || '').split('"').join('').trim();
            if (cleanImg.startsWith('http://') || cleanImg.startsWith('https://') || cleanImg.startsWith('/')) {
                return cleanImg;
            }
            return `/api/files/products/${productRecord.id}/${cleanImg}`;
        });

        if (imageUrls.length === 0) {
            imageUrls = ["/card-birthday.webp"];
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
                                const matchingItems = $app.findRecordsByFilter(
                                    "order_items",
                                    `product_name = '${productRecord.getString('name')}'`,
                                    "-created",
                                    50,
                                    0
                                );
                                if (matchingItems.length > 0) {
                                    $app.expandRecords(matchingItems, ["order"]);
                                    for (const item of matchingItems) {
                                        const ord = item.expandedOne("order");
                                        if (ord && ord.getString("user") === user.id) {
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

        // Fetch reviews
        let ratingSum = 0;
        try {
            const reviewRecords = $app.findRecordsByFilter("reviews", `product = '${productId}'`, "", 100, 0);
            if (reviewRecords.length > 0) {
                $app.expandRecords(reviewRecords, ["user"]);
                reviews = reviewRecords.map(r => {
                    const userRec = r.expandedOne("user");
                    const rating = r.getInt("rating");
                    const userId = r.getString("user");
                    ratingSum += rating;

                    if (user && userId === user.id && !userReview) {
                        userReview = {
                            id: r.id,
                            rating: rating,
                            title: r.getString("title"),
                            body: r.getString("body")
                        };
                    }

                    const rawCreated = r.getString("created");
                    const createdStr = rawCreated ? common.formatDateTime(rawCreated) : "Verified Buyer";

                    return {
                        id: r.id,
                        rating: rating,
                        title: r.getString("title"),
                        body: r.getString("body"),
                        isVerified: r.getBool("is_verified_purchase"),
                        userName: userRec ? userRec.getString("name") || userRec.getString("username") || "Valued Customer" : "Anonymous",
                        created: createdStr
                    };
                });
                averageRating = parseFloat((ratingSum / reviews.length).toFixed(1));
            }
        } catch (err) {
            console.error("Failed to load product reviews:", err);
        }

        // Fallback user review lookup if user's review wasn't in the top fetched list
        if (user && !userReview) {
            try {
                const userReviewRecs = $app.findRecordsByFilter("reviews", `product = '${productId}' && user = '${user.id}'`, "", 1, 0);
                if (userReviewRecs.length > 0) {
                    userReview = {
                        id: userReviewRecs[0].id,
                        rating: userReviewRecs[0].getInt("rating"),
                        title: userReviewRecs[0].getString("title"),
                        body: userReviewRecs[0].getString("body")
                    };
                }
            } catch (err) {
                console.error("Failed to fetch user review:", err);
            }
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
