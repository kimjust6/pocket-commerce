/**
 * Shell Alpine.js component for navigation, theme management, and sidebar compact cart.
 * Implements a Stale-While-Revalidate caching pattern: loads immediately from initial/local cache,
 * but continuously fetches the latest cart from the server in the background.
 * @returns {Object} The Alpine.js component data.
 */
module.exports = function shellData(initialCartCount, initialCartTotal, initialCartItems, isCartPage) {
    let parsedItems = [];
    if (Array.isArray(initialCartItems)) {
        parsedItems = initialCartItems;
    } else if (typeof initialCartItems === 'string' && initialCartItems.trim()) {
        try {
            if (typeof atob === 'function') {
                try {
                    parsedItems = JSON.parse(decodeURIComponent(escape(atob(initialCartItems))));
                } catch (_) {
                    try {
                        parsedItems = JSON.parse(atob(initialCartItems));
                    } catch (__) {
                        parsedItems = JSON.parse(initialCartItems);
                    }
                }
            } else {
                parsedItems = JSON.parse(initialCartItems);
            }
        } catch (_) {}
    }

    let count = typeof initialCartCount === 'number' ? initialCartCount : (parseInt(initialCartCount, 10) || 0);
    let total = typeof initialCartTotal === 'number' ? initialCartTotal : (parseFloat(initialCartTotal) || 0.0);

    // If SSR provided items but count/total were 0, derive from items
    if (Array.isArray(parsedItems) && parsedItems.length > 0) {
        if (count <= 0) {
            count = parsedItems.reduce((acc, it) => acc + (it.quantity || 1), 0);
        }
        if (total <= 0) {
            total = parsedItems.reduce((acc, it) => acc + (Number(it.price || 0) * (it.quantity || 1)), 0);
        }
    }

    // Client-side cache fallback: if SSR values are empty, read from localStorage
    if (typeof localStorage !== 'undefined' && count <= 0 && parsedItems.length === 0) {
        try {
            const cachedStr = localStorage.getItem('pocket_cart_cache');
            if (cachedStr) {
                const cached = JSON.parse(cachedStr);
                if (cached && Array.isArray(cached.items) && cached.items.length > 0) {
                    parsedItems = cached.items;
                    count = typeof cached.totalItems === 'number' ? cached.totalItems : (typeof cached.count === 'number' ? cached.count : parsedItems.reduce((acc, it) => acc + (it.quantity || 1), 0));
                    total = typeof cached.totalPrice === 'number' ? cached.totalPrice : (typeof cached.total === 'number' ? cached.total : parsedItems.reduce((acc, it) => acc + (Number(it.price || 0) * (it.quantity || 1)), 0));
                }
            }
        } catch (_) {}
    }

    const isCart = Boolean(isCartPage);
    const hasItems = count > 0 || (Array.isArray(parsedItems) && parsedItems.length > 0);

    return {
        isCartPage: isCart,
        cartCount: count,
        cartTotalPrice: total,
        cartItems: parsedItems,
        navOpen: false,
        searchOpen: false,
        sideCartOpen: !isCart && hasItems,
        updatingItemId: null,
        isFetchingCart: false,
        cartPulsing: false,
        recentlyAddedId: null,
        recentlyAddedTimer: null,
        darkMode: typeof localStorage !== 'undefined' ? localStorage.getItem('theme') === 'dark' : false,
        navigation: [
            { title: 'Shop', href: '/shop', desktop: false, mobile: true },
        ],
        headerVisible: true,
        bannerVisible: typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('banner_dismissed') !== 'true' : true,

        init() {
            // 1. Listen for cart-updated events from cards, PDPs, and modals
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
                if (this.cartItems && this.cartItems.length > 0) {
                    if (typeof this.cartCount !== 'number' || this.cartCount <= 0) {
                        this.cartCount = this.cartItems.reduce((acc, it) => acc + (it.quantity || 1), 0);
                    }
                    if (typeof this.cartTotalPrice !== 'number' || this.cartTotalPrice <= 0) {
                        this.cartTotalPrice = this.cartItems.reduce((acc, it) => acc + (Number(it.price || 0) * (it.quantity || 1)), 0);
                    }
                }
                this.saveCartToCache();
                this.cartPulsing = true;
                setTimeout(() => { this.cartPulsing = false; }, 800);

                // Set recentlyAddedId to trigger the slide-in animation on the newly added item
                if (e.detail.item) {
                    const targetId = e.detail.item.variantId || e.detail.item.productId || (this.cartItems[0] ? this.cartItems[0].id : null);
                    this.recentlyAddedId = targetId;
                    if (this.recentlyAddedTimer) clearTimeout(this.recentlyAddedTimer);
                    this.recentlyAddedTimer = setTimeout(() => {
                        if (this.recentlyAddedId === targetId) {
                            this.recentlyAddedId = null;
                        }
                    }, 2500);
                }

                if (e.detail.openSideCart && !this.isCartPage && (this.cartCount > 0 || this.cartItems.length > 0)) {
                    this.sideCartOpen = true;
                    // Auto-scroll the sidebar scroller to top so the new item is front and center
                    setTimeout(() => {
                        if (typeof document !== 'undefined') {
                            const scroller = document.getElementById('ewc-compact-body');
                            if (scroller) scroller.scrollTo({ top: 0, behavior: 'smooth' });
                        }
                    }, 100);
                }
            });

            // 2. Fetch latest cart from server immediately on initialization
            this.fetchLatestCart();

            // 3. Keep cart fresh when window gains focus or becomes visible
            if (typeof window !== 'undefined') {
                window.addEventListener('focus', () => {
                    this.fetchLatestCart();
                });
                if (typeof document !== 'undefined') {
                    document.addEventListener('visibilitychange', () => {
                        if (document.visibilityState === 'visible') {
                            this.fetchLatestCart();
                        }
                    });
                }
                // 4. Cross-tab synchronization via localStorage
                window.addEventListener('storage', (e) => {
                    if (e.key === 'pocket_cart_cache' && e.newValue) {
                        try {
                            const cached = JSON.parse(e.newValue);
                            if (cached) {
                                this.cartCount = typeof cached.totalItems === 'number' ? cached.totalItems : 0;
                                this.cartTotalPrice = typeof cached.totalPrice === 'number' ? cached.totalPrice : 0;
                                this.cartItems = Array.isArray(cached.items) ? cached.items : [];
                                if (this.cartCount <= 0 && this.cartItems.length === 0) {
                                    this.sideCartOpen = false;
                                }
                            }
                        } catch (_) {}
                    }
                });
            }
        },

        saveCartToCache() {
            if (typeof localStorage === 'undefined') return;
            try {
                localStorage.setItem('pocket_cart_cache', JSON.stringify({
                    totalItems: this.cartCount,
                    totalPrice: this.cartTotalPrice,
                    items: this.cartItems,
                    updatedAt: Date.now()
                }));
            } catch (_) {}
        },

        async fetchLatestCart() {
            if (typeof fetch !== 'function' || this.isFetchingCart) return;
            this.isFetchingCart = true;
            try {
                const res = await fetch('/cart?json=1', {
                    method: 'GET',
                    cache: 'no-store',
                    headers: {
                        'Accept': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                });
                if (!res.ok) return;
                const data = await res.json();
                if (data && data.success) {
                    const latestCount = typeof data.totalItems === 'number' ? data.totalItems : 0;
                    const latestTotal = typeof data.totalPrice === 'number' ? data.totalPrice : 0.0;
                    const latestItems = Array.isArray(data.items) ? data.items : (Array.isArray(data.cartItems) ? data.cartItems : []);

                    this.cartCount = latestCount;
                    this.cartTotalPrice = latestTotal;
                    this.cartItems = latestItems;
                    this.saveCartToCache();

                    if (latestCount <= 0 && latestItems.length === 0) {
                        this.sideCartOpen = false;
                    }
                }
            } catch (err) {
                // Silently fallback to current/cached state
            } finally {
                this.isFetchingCart = false;
            }
        },

        openSideCart() {
            if (this.cartCount > 0 || this.cartItems.length > 0) {
                this.sideCartOpen = true;
            }
        },

        closeSideCart() {
            this.sideCartOpen = false;
        },

        toggleSideCart() {
            if (this.sideCartOpen) {
                this.sideCartOpen = false;
            } else if (this.cartCount > 0 || this.cartItems.length > 0) {
                this.sideCartOpen = true;
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

                const res = await fetch('/cart?json=1', {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest'
                    },
                    body: formData
                });
                let result = null;
                const rawText = await res.text();
                try {
                    result = JSON.parse(rawText);
                } catch (_) {
                    result = { success: res.ok };
                }
                if (result && result.success) {
                    if (typeof result.totalItems === 'number') {
                        this.cartCount = result.totalItems;
                    }
                    if (typeof result.totalPrice === 'number') {
                        this.cartTotalPrice = result.totalPrice;
                    }
                    if (Array.isArray(result.items)) {
                        this.cartItems = result.items;
                    } else if (newQuantity <= 0) {
                        this.cartItems = this.cartItems.filter(i => i.id !== item.id);
                    } else {
                        item.quantity = newQuantity;
                        item.total = item.price * newQuantity;
                    }
                    this.saveCartToCache();
                    if (this.cartCount <= 0 && this.cartItems.length === 0) {
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
            this.darkMode = !this.darkMode;
            const theme = this.darkMode ? 'dark' : 'light';
            const themeToken = this.darkMode ? 'dark' : 'light';
            try {
                localStorage.setItem('theme', theme);
            } catch (_) {}
            if (typeof document !== 'undefined') {
                document.documentElement.setAttribute('data-theme', themeToken);
                document.documentElement.classList.toggle('dark', this.darkMode);
            }
        },

        scrollTo(target) {
            if (typeof document === 'undefined') return;
            const el = document.getElementById(target);
            if (el) {
                const headerOffset = 80;
                const elementPosition = el.getBoundingClientRect().top;
                const offsetPosition =
                    elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth',
                });
                this.navOpen = false;
            }
        },
    };
};
