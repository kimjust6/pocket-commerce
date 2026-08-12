import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import ejs from 'pocketbase-ejs';
import shellData from '../pb_hooks/pages/_private/shell-data.js';

describe('Amazon EWC-Style Sidebar Cart Component & Shell Data', () => {
    it('renders side-cart.ejs with Amazon EWC elements without errors', () => {
        const filePath = path.resolve(__dirname, '../pb_hooks/pages/_private/side-cart.ejs');
        const content = fs.readFileSync(filePath, 'utf-8');

        const html = ejs.render(content, {}, { root: path.resolve(__dirname, '../pb_hooks/pages') });
        expect(html).toContain('ewc-compact');
        expect(html).toContain('Subtotal');
        expect(html).toContain('Go to cart');
        expect(html).toContain('sc-quantity-stepper');
    });

    it('initializes shellData with cart count, total price, and items list', () => {
        const sampleItems = [
            { id: 'item1', quantity: 2, price: 4.99, productName: 'Birthday Card', variantId: 'var1' }
        ];
        const shell = shellData(2, 9.98, JSON.stringify(sampleItems));
        expect(shell.cartCount).toBe(2);
        expect(shell.cartTotalPrice).toBe(9.98);
        expect(shell.cartItems.length).toBe(1);
        expect(shell.cartItems[0].productName).toBe('Birthday Card');
        expect(shell.sideCartOpen).toBe(false);
    });

    it('initializes shellData with base64 encoded items list', () => {
        const sampleItems = [
            { id: 'item1', quantity: 3, price: 4.99, productName: 'Birthday Card', variantId: 'var1' }
        ];
        const base64Str = Buffer.from(JSON.stringify(sampleItems)).toString('base64');
        const shell = shellData(3, 14.97, base64Str);
        expect(shell.cartCount).toBe(3);
        expect(shell.cartTotalPrice).toBe(14.97);
        expect(shell.cartItems.length).toBe(1);
        expect(shell.cartItems[0].productName).toBe('Birthday Card');
    });

    it('recalculates cartCount and cartTotalPrice if initial count is 0 but items are provided', () => {
        const sampleItems = [
            { id: 'item1', quantity: 2, price: 5.00, productName: 'Card 1', variantId: 'var1' },
            { id: 'item2', quantity: 1, price: 3.50, productName: 'Card 2', variantId: 'var2' }
        ];
        const shell = shellData(0, 0, sampleItems);
        expect(shell.cartCount).toBe(3);
        expect(shell.cartTotalPrice).toBe(13.50);
    });
});
