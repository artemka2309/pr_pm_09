import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { fetchProductBySlugClient } from '@/shared/api/products';

const useCartStore = create(
    persist(
        (set, get) => ({
            cartItems: [],
            addToCart: (item) => {
                const uniqueId = `${item.slug}-${item.colorSlug}`;
                set((state) => {
                    const existingItemIndex = state.cartItems.findIndex(cartItem => cartItem.uniqueId === uniqueId);
                    if (existingItemIndex !== -1) {
                        const updatedItems = [...state.cartItems];
                        updatedItems[existingItemIndex] = {
                            ...updatedItems[existingItemIndex],
                            quantity: updatedItems[existingItemIndex].quantity + 1
                        };
                        return { cartItems: updatedItems };
                    } else {
                        return {
                            cartItems: [...state.cartItems, { ...item, uniqueId, quantity: 1, isSelected: true }]
                        };
                    }
                });
            },
            removeFromCart: (uniqueId) => set((state) => ({
                cartItems: state.cartItems.filter(cartItem => cartItem.uniqueId !== uniqueId),
            })),
            updateQuantity: (uniqueId, quantity) => set((state) => ({
                cartItems: state.cartItems.map((item) =>
                    item.uniqueId === uniqueId ? { ...item, quantity } : item
                ),
            })),
            updateSelection: (uniqueId, isSelected) => set((state) => ({
                cartItems: state.cartItems.map((item) =>
                    item.uniqueId === uniqueId ? { ...item, isSelected } : item
                ),
            })),
            selectAllItems: (isSelected) => set((state) => ({
                cartItems: state.cartItems.map((item) => ({ ...item, isSelected })),
            })),
            getTotalItems: () => get().cartItems.reduce((total, item) => total + item.quantity, 0),
            getItemQuantity: (uniqueId) => {
                const item = get().cartItems.find(cartItem => cartItem.uniqueId === uniqueId);
                return item ? item.quantity : 0;
            },
            getSelectedItems: () => get().cartItems.filter(item => item.isSelected),
            getDiscountedPrice: (item) => {
                if (item.price_discount !== null && item.price_discount < item.price) {
                    return item.price_discount;
                } else {
                    return item.price;
                }
            },
            getTotalPriceWithDiscount: () => get().cartItems
                .filter(item => item.isSelected)
                .reduce((total, item) => total + (get().getDiscountedPrice(item) * item.quantity), 0),
            checkAndRemoveInactiveItems: async () => {
                const state = get();
                const updatedItems = await Promise.all(
                    state.cartItems.map(async (item) => {
                        try {
                            const fetchedProduct = await fetchProductBySlugClient(item.slug);
                            if (fetchedProduct && fetchedProduct.is_active) {
                                return { ...item, is_active: fetchedProduct.is_active };
                            }
                            return null;
                        } catch (error) {
                            console.error('Ошибка при проверке товара:', error);
                            return null;
                        }
                    })
                );
                set({ cartItems: updatedItems.filter(Boolean) });
            },
        }),
        {
            name: 'cart-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
);

export default useCartStore;