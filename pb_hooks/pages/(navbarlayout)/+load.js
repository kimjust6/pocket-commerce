/**
 * Loader for the homepage.
 * Provides mock data for the card e-commerce site.
 * @type {import('pocketpages').PageDataLoaderFunc}
 */
module.exports = function (context) {
    try {
        const recentCards = [
            { 
                id: '1', 
                title: 'Have a Mice Day', 
                price: '$4.99', 
                image: 'https://images.unsplash.com/photo-1543852786-1cf6624b9987?auto=format&fit=crop&q=80&w=500', 
                images: [
                    'https://images.unsplash.com/photo-1543852786-1cf6624b9987?auto=format&fit=crop&q=80&w=500',
                    'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=500'
                ],
                slug: 'have-a-mice-day' 
            },
            { 
                id: '2', 
                title: 'Toad-ally Awesome Bday', 
                price: '$5.50', 
                image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&q=80&w=500', 
                images: [
                    'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&q=80&w=500',
                    'https://images.unsplash.com/photo-1534361960057-19889db9621e?auto=format&fit=crop&q=80&w=500'
                ],
                slug: 'toad-ally-awesome-bday' 
            },
            { 
                id: '3', 
                title: 'You Are Purrfect', 
                price: '$4.99', 
                image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=500', 
                images: [
                    'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=500',
                    'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?auto=format&fit=crop&q=80&w=500'
                ],
                slug: 'you-are-purrfect' 
            },
            { 
                id: '4', 
                title: 'Donut Forget My Bday', 
                price: '$5.00', 
                image: 'https://images.unsplash.com/photo-1551024506-0cb4a1cb3613?auto=format&fit=crop&q=80&w=500', 
                images: [
                    'https://images.unsplash.com/photo-1551024506-0cb4a1cb3613?auto=format&fit=crop&q=80&w=500',
                    'https://images.unsplash.com/photo-1514517604298-cf80e0fb7f1e?auto=format&fit=crop&q=80&w=500'
                ],
                slug: 'donut-forget-my-bday' 
            },
            { 
                id: '5', 
                title: 'You Guac My World', 
                price: '$5.99', 
                image: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&q=80&w=500', 
                images: [
                    'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&q=80&w=500',
                    'https://images.unsplash.com/photo-1603048588665-791ca8aea617?auto=format&fit=crop&q=80&w=500'
                ],
                slug: 'you-guac-my-world' 
            },
            { 
                id: '6', 
                title: 'I Loaf You', 
                price: '$4.50', 
                image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=500', 
                images: [
                    'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=500',
                    'https://images.unsplash.com/photo-1549931319-a545dcf3bc73?auto=format&fit=crop&q=80&w=500'
                ],
                slug: 'i-loaf-you' 
            }
        ];

        let categoryRecords = [];
        try {
            categoryRecords = $app.findRecordsByFilter("categories", "", "name", 100, 0);
            if (categoryRecords.length === 0) {
                const collection = $app.findCollectionByNameOrId("categories");
                const defaults = [
                    { name: "Birthday", slug: "birthday" },
                    { name: "Animals", slug: "animals" },
                    { name: "Food", slug: "food" },
                    { name: "Love", slug: "love" }
                ];
                for (const d of defaults) {
                    const record = new Record(collection);
                    record.set("name", d.name);
                    record.set("slug", d.slug);
                    $app.save(record);
                }
                categoryRecords = $app.findRecordsByFilter("categories", "", "name", 100, 0);
            }
        } catch (e) {
            console.error("Failed to load/seed categories", e);
        }

        const topCollections = categoryRecords.map(c => {
            const name = c.getString('name');
            const slug = c.getString('slug');
            let description = `Hilarious ${name.toLowerCase()} greetings.`;
            let image = 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=150';
            let count = 0;

            if (slug === 'birthday') {
                description = 'Punny cards for everyone turning a year older.';
                image = 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&q=80&w=150';
            } else if (slug === 'animals') {
                description = 'Hilarious greetings featuring cute critters.';
                image = 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&q=80&w=150';
            } else if (slug === 'food') {
                description = 'Deliciously funny cards for food lovers.';
                image = 'https://images.unsplash.com/photo-1551024506-0cb4a1cb3613?auto=format&fit=crop&q=80&w=150';
            } else if (slug === 'love') {
                description = 'Romantic puns to make your partner laugh.';
                image = 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&q=80&w=150';
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

        const recentReviews = [
            { userInitials: 'JD', userName: 'John Doe', type: 'review', cardTitle: 'Toad-ally Awesome Bday', review: 'My brother loved this card! The pun is fantastic.', rating: 5 },
            { userInitials: 'AS', userName: 'Alice Smith', type: 'rate', cardTitle: 'Have a Mice Day', rating: 4 },
            { userInitials: 'MR', userName: 'Mike Ross', type: 'review', cardTitle: 'You Guac My World', review: 'Great card quality and fast shipping.', rating: 5 },
            { userInitials: 'EW', userName: 'Emma Watson', type: 'review', cardTitle: 'I Loaf You', review: 'Cute, but the envelope color wasn\'t what I expected.', rating: 3.5 }
        ];

        return {
            recentCards,
            topCollections,
            recentReviews
        }
    } catch (e) {
        console.error('Failed to load homepage data:', e)
        return {
            recentCards: [],
            topCollections: [],
            recentReviews: []
        }
    }
}
