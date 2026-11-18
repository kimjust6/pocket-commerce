import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import ejs from 'pocketbase-ejs';

describe('Product Detail EJS Rendering', () => {
    const filePath = path.resolve(__dirname, '../pb_hooks/pages/(navbarlayout)/shop/card/[product_name]/[id]/index.ejs');
    const content = fs.readFileSync(filePath, 'utf-8');

    it('renders product detail template with 5 faded stars and dash when there are no reviews', () => {
        const mockData = {
            product: {
                id: 'prd000000000002',
                name: 'Festive Birthday Candles Card',
                description: 'A great card',
                category: { name: 'Birthday', slug: 'birthday' },
                images: ['/card-birthday.webp'],
                status: 'active'
            },
            variants: [
                {
                    id: 'var000000000002',
                    sku: 'SKU-Bday-02',
                    price: 4.99,
                    compare_at_price: 0,
                    stock: 45,
                    attributes: { Format: 'Single Card' }
                }
            ],
            reviews: [],
            averageRating: 0,
            reviewError: null,
            reviewSuccess: null,
            user: null,
            userReview: null
        };

        const html = ejs.render(content, { data: mockData }, { root: path.resolve(__dirname, '../pb_hooks/pages') });
        expect(html).toContain('Festive Birthday Candles Card');
        expect(html).toContain('$4.99');
        // Faded stars check
        expect(html).toContain('bg-amber-400 opacity-20');
        // Dash check
        expect(html).toContain('- (0 reviews)');
        expect(html).toContain('Based on 0 reviews');
    });

    it('renders populated ratings and amber stars when reviews exist', () => {
        const mockData = {
            product: {
                id: 'prd000000000002',
                name: 'Festive Birthday Candles Card',
                description: 'A great card',
                category: { name: 'Birthday', slug: 'birthday' },
                images: ['/card-birthday.webp'],
                status: 'active'
            },
            variants: [
                {
                    id: 'var000000000002',
                    sku: 'SKU-Bday-02',
                    price: 4.99,
                    compare_at_price: 0,
                    stock: 45,
                    attributes: { Format: 'Single Card' }
                }
            ],
            reviews: [
                { id: 'rev1', rating: 5, title: 'Loved it', body: 'Great card', isVerified: true, userName: 'Alice', created: 'Yesterday' },
                { id: 'rev2', rating: 4, title: 'Nice', body: 'Very cute', isVerified: true, userName: 'Bob', created: 'Today' }
            ],
            averageRating: 4.5,
            reviewError: null,
            reviewSuccess: null,
            user: null,
            userReview: null
        };

        const html = ejs.render(content, { data: mockData }, { root: path.resolve(__dirname, '../pb_hooks/pages') });
        expect(html).toContain('4.5 (2 reviews)');
        expect(html).toContain('Based on 2 reviews');
        expect(html).toContain('bg-amber-400');
    });
});
