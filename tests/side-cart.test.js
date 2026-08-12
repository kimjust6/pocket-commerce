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

    it('only opens or toggles sidebar cart when cartCount > 0 and items are present', () => {
        const emptyShell = shellData(0, 0, []);
        emptyShell.openSideCart();
        expect(emptyShell.sideCartOpen).toBe(false);

        emptyShell.toggleSideCart();
        expect(emptyShell.sideCartOpen).toBe(false);

        const loadedShell = shellData(1, 4.99, [{ id: 'item1', quantity: 1, price: 4.99 }]);
        loadedShell.openSideCart();
        expect(loadedShell.sideCartOpen).toBe(true);

        loadedShell.toggleSideCart();
        expect(loadedShell.sideCartOpen).toBe(false);

        loadedShell.toggleSideCart();
        expect(loadedShell.sideCartOpen).toBe(true);

        loadedShell.closeSideCart();
        expect(loadedShell.sideCartOpen).toBe(false);
    });
});
