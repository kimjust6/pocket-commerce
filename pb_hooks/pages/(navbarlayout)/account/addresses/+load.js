/**
 * Loader for the /account/addresses page.
 * Handles CRUD actions on user addresses and retrieves addresses for rendering.
 * @type {import('pocketpages').PageDataLoaderFunc}
 */
module.exports = function (context) {
    const common = require('../../../../lib/common.js');
    const { client, user } = common.init(context);

    // 1. Guard route: redirect if unauthenticated (supporting both redirect structures)
    if (!user) {
        if (typeof context.redirect === 'function') {
            return context.redirect('/login');
        }
        context.response.redirect('/login');
        return;
    }

    // 2. Process form submissions (POST)
    if (context.request.method === 'POST') {
        try {
            const formData = context.request.formData();
            const action = formData.action;

            if (action === 'add') {
                const collection = $app.findCollectionByNameOrId("addresses");
                const record = new Record(collection);
                record.set("user", user.id);
                record.set("street", formData.street || "");
                record.set("city", formData.city || "");
                record.set("state", formData.state || "");
                record.set("zip", formData.zip || "");
                record.set("country", formData.country || "");

                const isDefault = formData.is_default === 'on' || formData.is_default === 'true' || formData.is_default === true;
                record.set("is_default", isDefault);

                if (isDefault) {
                    // Unset other defaults
                    const existing = $app.findRecordsByFilter("addresses", `user = '${user.id}' && is_default = true`);
                    existing.forEach(r => {
                        r.set("is_default", false);
                        $app.save(r);
                    });
                } else {
                    // Make it default if it is the user's first address
                    const existing = $app.findRecordsByFilter("addresses", `user = '${user.id}'`);
                    if (existing.length === 0) {
                        record.set("is_default", true);
                    }
                }
                $app.save(record);

            } else if (action === 'update') {
                const record = $app.findRecordById("addresses", formData.id);
                if (record && record.getString("user") === user.id) {
                    record.set("street", formData.street || "");
                    record.set("city", formData.city || "");
                    record.set("state", formData.state || "");
                    record.set("zip", formData.zip || "");
                    record.set("country", formData.country || "");

                    const isDefault = formData.is_default === 'on' || formData.is_default === 'true' || formData.is_default === true;
                    record.set("is_default", isDefault);

                    if (isDefault) {
                        // Unset other defaults
                        const existing = $app.findRecordsByFilter("addresses", `user = '${user.id}' && is_default = true && id != '${record.id}'`);
                        existing.forEach(r => {
                            r.set("is_default", false);
                            $app.save(r);
                        });
                    } else {
                        // If we are unsetting the default, check if we have any other address to make default
                        const otherExisting = $app.findRecordsByFilter("addresses", `user = '${user.id}' && id != '${record.id}'`);
                        if (otherExisting.length > 0) {
                            // If no other address is default, make the first other one default
                            const otherDefault = otherExisting.find(r => r.getBool("is_default"));
                            if (!otherDefault) {
                                otherExisting[0].set("is_default", true);
                                $app.save(otherExisting[0]);
                            }
                        } else {
                            // If this is the only address, it MUST remain default
                            record.set("is_default", true);
                        }
                    }
                    $app.save(record);
                }

            } else if (action === 'delete') {
                const record = $app.findRecordById("addresses", formData.id);
                if (record && record.getString("user") === user.id) {
                    const wasDefault = record.getBool("is_default");
                    $app.delete(record);

                    // If we deleted the default address, automatically set another one as default
                    if (wasDefault) {
                        const remaining = $app.findRecordsByFilter("addresses", `user = '${user.id}'`, "", 100, 0);
                        if (remaining.length > 0) {
                            remaining.sort((a, b) => {
                                const dateA = new Date(a.getString('created'));
                                const dateB = new Date(b.getString('created'));
                                return dateB - dateA;
                            });
                            remaining[0].set("is_default", true);
                            $app.save(remaining[0]);
                        }
                    }
                }

            } else if (action === 'set_default') {
                const record = $app.findRecordById("addresses", formData.id);
                if (record && record.getString("user") === user.id) {
                    const existing = $app.findRecordsByFilter("addresses", `user = '${user.id}' && is_default = true`);
                    existing.forEach(r => {
                        r.set("is_default", false);
                        $app.save(r);
                    });

                    record.set("is_default", true);
                    $app.save(record);
                }
            }

            // Redirect back to avoid resubmission and reload the page
            context.response.redirect('/account/addresses');
            return;
        } catch (e) {
            console.error("[addresses/+load.js] Address CRUD mutation error:", e);
        }
    }

    // 3. Fetch all user addresses for presentation
    let addresses = [];
    try {
        const addressRecords = $app.findRecordsByFilter(
            "addresses",
            `user = '${user.id}'`,
            "",
            100,
            0
        );

        addresses = addressRecords.map(a => ({
            id: a.id,
            street: a.getString('street'),
            city: a.getString('city'),
            state: a.getString('state'),
            zip: a.getString('zip'),
            country: a.getString('country'),
            is_default: a.getBool('is_default'),
            created: a.getString('created') || ''
        }));

        // Sort: is_default descending (true first), then created descending (most recent first)
        addresses.sort((a, b) => {
            if (a.is_default && !b.is_default) return -1;
            if (!a.is_default && b.is_default) return 1;
            
            const dateA = new Date(a.created);
            const dateB = new Date(b.created);
            return dateB - dateA;
        });
    } catch (e) {
        console.error("[addresses/+load.js] Failed to fetch user addresses:", e);
    }

    return {
        addresses,
        user
    };
};
