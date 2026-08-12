import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import ejs from 'pocketbase-ejs';

describe('Product Detail EJS Rendering', () => {
    it('renders product detail template with empty reviews and single variant', () => {
        const filePath = path.resolve(__dirname, '../pb_hooks/pages/(navbarlayout)/shop/card/[product_name]/[id]/index.ejs');
        const content = fs.readFileSync(filePath, 'utf-8');

        const mockData = {
            product: {
                id: 'prd000000000002',
                name: 'Festive Birthday Candles Card',
                description: 'A great card',
                category: { name: 'Birthday', slug: 'birthday' },
                images: ['/card-birthday.webp', 'https://images.pexels.com/photos/6800085/pexels-photo-6800085.jpeg'],
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
    });
});
