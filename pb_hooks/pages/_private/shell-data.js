/**
 * Shell Alpine.js component for navigation, theme management, and sidebar compact cart.
 * @returns {Object} The Alpine.js component data.
 */
module.exports = function shellData(initialCartCount, initialCartTotal, initialCartItems) {
    let parsedItems = [];
    if (Array.isArray(initialCartItems)) {
        parsedItems = initialCartItems;
    } else if (typeof initialCartItems === 'string' && initialCartItems.trim()) {
        try {
            parsedItems = JSON.parse(initialCartItems);
        } catch (_) {}
    }

    return {
        cartCount: typeof initialCartCount === 'number' ? initialCartCount : 0,
        cartTotalPrice: typeof initialCartTotal === 'number' ? initialCartTotal : 0.0,
        cartItems: parsedItems,
        navOpen: false,
        searchOpen: false,
        sideCartOpen: false,
        updatingItemId: null,
        darkMode: typeof localStorage !== 'undefined' ? localStorage.getItem('theme') === 'dark' : false,
        navigation: [
            { title: 'Shop', href: '/shop', desktop: false, mobile: true },
        ],
        headerVisible: true,
        bannerVisible: typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('banner_dismissed') !== 'true' : true,

        init() {
            window.addEventListener('cart-updated', (e) => {
                if (!e.detail) return;
                if (typeof e.detail.totalItems !== 'undefined') {
                    this.cartCount = e.detail.totalItems;
                }
                if (typeof e.detail.totalPrice !== 'undefined') {
                    this.cartTotalPrice = e.detail.totalPrice;
                }
                if (Array.isArray(e.detail.items)) {
                    this.cartItems = e.detail.items;
                } else if (e.detail.item) {
                    const existingIdx = this.cartItems.findIndex(it => it.variantId === e.detail.item.variantId);
                    if (existingIdx >= 0) {
                        this.cartItems[existingIdx].quantity += (e.detail.item.quantity || 1);
                        this.cartItems[existingIdx].total = this.cartItems[existingIdx].price * this.cartItems[existingIdx].quantity;
                    } else {
                        this.cartItems.unshift({
                            id: e.detail.item.id || ('temp_' + Date.now()),
                            quantity: e.detail.item.quantity || 1,
                            price: e.detail.item.price || 0,
                            total: (e.detail.item.price || 0) * (e.detail.item.quantity || 1),
                            variantId: e.detail.item.variantId,
                            sku: e.detail.item.sku || '',
                            attributes: e.detail.item.attributes || {},
                            productId: e.detail.item.productId || '',
                            productName: e.detail.item.name || 'Greeting Card',
                            productSlug: e.detail.item.productSlug || '',
                            image: e.detail.item.image || '/card-birthday.webp'
                        });
                    }
                }
                if (e.detail.openSideCart && this.cartCount > 0) {
                    this.sideCartOpen = true;
                }
            });
        },

        openSideCart() {
            if (this.cartCount > 0 && this.cartItems.length > 0) {
                this.sideCartOpen = true;
            }
        },

        closeSideCart() {
            this.sideCartOpen = false;
        },

        toggleSideCart() {
            if (this.cartCount > 0 && this.cartItems.length > 0) {
                this.sideCartOpen = !this.sideCartOpen;
            } else {
                this.sideCartOpen = false;
            }
        },

        async updateCartItem(item, newQuantity) {
            if (!item || this.updatingItemId) return;
            this.updatingItemId = item.id;
            try {
                const formData = new FormData();
                formData.append('json', '1');
                if (newQuantity <= 0) {
                    formData.append('action', 'delete');
                    formData.append('item_id', item.id);
                } else {
                    formData.append('action', 'update');
                    formData.append('item_id', item.id);
                    formData.append('quantity', String(newQuantity));
                }

                const res = await fetch('/cart', {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest'
                    },
                    body: formData
                });
                const result = await res.json();
                if (result && result.success) {
                    this.cartCount = result.totalItems;
                    this.cartTotalPrice = result.totalPrice;
                    if (Array.isArray(result.items)) {
                        this.cartItems = result.items;
                    } else if (newQuantity <= 0) {
                        this.cartItems = this.cartItems.filter(i => i.id !== item.id);
                    } else {
                        item.quantity = newQuantity;
                        item.total = item.price * newQuantity;
                    }
                    if (this.cartCount <= 0) {
                        this.sideCartOpen = false;
                    }
                }
            } catch (err) {
                console.error("Error updating cart item:", err);
            } finally {
                this.updatingItemId = null;
            }
        },

        dismissBanner() {
            this.bannerVisible = false;
            try {
                sessionStorage.setItem('banner_dismissed', 'true');
            } catch (_) {}
        },

        toggleTheme() {
            this.darkMode = !this.darkMode
            const theme = this.darkMode ? 'dark' : 'light'
            const themeToken = this.darkMode ? 'dark' : 'light'
            localStorage.setItem('theme', theme)
            document.documentElement.setAttribute('data-theme', themeToken)
            document.documentElement.classList.toggle('dark', this.darkMode)
        },

        scrollTo(target) {
            const el = document.getElementById(target)
            if (el) {
                const headerOffset = 80
                const elementPosition = el.getBoundingClientRect().top
                const offsetPosition =
                    elementPosition + window.pageYOffset - headerOffset

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth',
                })
                this.navOpen = false
            }
        },
    }
}

