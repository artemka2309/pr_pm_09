import { create } from 'zustand';
import { persist, StateStorage, createJSONStorage } from 'zustand/middleware';
// Импортируем интерфейс для моделей
import { ProductModel } from '@/shared/types/product';

// Интерфейс для объекта просмотренного продукта
export interface ViewedProduct {
  id: number | string; // ID нужен для key в React (обычно article)
  slug: string;
  // Заменяем category на два слага
  parentCategorySlug: string | null; 
  subcategorySlug: string | null;
  name: string;
  image_logo: string | null;
  price: number;
  price_discount?: number | null;
  is_active: boolean;
  // Добавляем недостающие поля
  stock: number; // Общий сток товара
  models: ProductModel[]; // Массив моделей (цвета/размеры и т.д.)
  // Добавляем слаг модели по умолчанию
  defaultModel_slug: string | null;
}

// Интерфейс для состояния стора
interface ViewedProductsStoreState {
  viewedProducts: ViewedProduct[];
  addViewedProduct: (product: ViewedProduct) => void; 
  removeViewedProduct: (productId: number | string) => void;
  clearViewedProducts: () => void;
}

// Функция для получения безопасного хранилища
const getSafeStorage = (): StateStorage => {
  if (typeof window !== 'undefined') {
    return localStorage;
  }
  // Возвращаем заглушку, если localStorage недоступен (SSR)
  return {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
  };
};

const useViewedProductsStore = create<ViewedProductsStoreState>()(
    persist(
        (set, get) => ({
            viewedProducts: [],
            addViewedProduct: (product) => set((state) => { 
                const isProductViewed = state.viewedProducts.some((item) => item.id === product.id);
                if (!isProductViewed && product.is_active) { 
                    const updatedProducts = [product, ...state.viewedProducts].slice(0, 10);
                    return { viewedProducts: updatedProducts };
                }
                if (isProductViewed) {
                    const otherProducts = state.viewedProducts.filter(p => p.id !== product.id);
                    const existingProductIndex = state.viewedProducts.findIndex(p => p.id === product.id);
                    const existingProduct = state.viewedProducts[existingProductIndex];
                    return { viewedProducts: [existingProduct, ...otherProducts].slice(0, 10) }; 
                }
                return state;
            }),
            removeViewedProduct: (productId) => set((state) => ({
                viewedProducts: state.viewedProducts.filter((item) => item.id !== productId),
            })),
            clearViewedProducts: () => set({ viewedProducts: [] }),
        }),
        {
            name: 'viewed-products-storage',
            storage: createJSONStorage(() => getSafeStorage()),
        }
    )
);

export default useViewedProductsStore; 