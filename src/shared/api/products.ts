// frontend/src/app/api/products.ts

import {
    NEXT_PUBLIC_BASE_API_URL_CLIENT,
    API_URL_GET_PRODUCTS_WEEKLY,
    API_URL_PRODUCTS_BY_FILTERS,
    API_URL_PRODUCT_SEARCH,
    API_URL_PRODUCT_BY_SLUG,
    API_URL_FILTERS_ALL
} from "@/shared/config/api";
import type {
    ProductsWeeklyApiResponse,
    ProductsFilterApiResponse,
    ProductsSearchApiResponse,
    ProductFull,
    CategoryFiltersApiResponse
} from "@/shared/types/product"; // Импортируем типы

// Функция для получения продуктов с сервера
export const fetchProducts = async (params, currentPage, sort, selectedFilters) => {
    const requestBody = {
        Page: currentPage,
        Slug: params.subcategoryName || params.categoryName,
        OrderBy: sort,
        ...selectedFilters,
    };

    const response = await fetch(process.env.NEXT_PUBLIC_BASE_API_URL_CLIENT + process.env.NEXT_PUBLIC_PRODUCTS_BY_FILTERS, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        next: { revalidate: 30 } // Ревалидация данных каждые 3600 секунд (1 час)
    });

    if (!response.ok) {
        throw new Error('Failed to fetch data');
    }

    const data = await response.json();
    console.log('fetchProducts response:', data);
    return { products: data.products || [], max_page: data.max_page || 1 };
};

// Функция для получения фильтров с сервера
export const fetchFilters = async (categoryName) => {
    const response = await fetch(process.env.NEXT_PUBLIC_BASE_API_URL_CLIENT + process.env.NEXT_PUBLIC_FILTERS_ALL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ category: categoryName }),
        next: { revalidate: 30 } // Ревалидация данных каждые 3600 секунд (1 час)
    });

    if (!response.ok) {
        throw new Error('Failed to fetch data');
    }

    const data = await response.json();
    if (data && data.Spec) {
        const updatedFilters = {};
        data.Spec.forEach(spec => {
            updatedFilters[spec.name] = spec.spec_enums.map(value => ({ label: `${value}`, value }));
        });
        return updatedFilters;
    }
    return {};
};

// Функция для получения категорий с сервера
export const fetchCategories = async () => {
    const response = await fetch(process.env.NEXT_PUBLIC_BASE_API_URL_SERVER + process.env.NEXT_PUBLIC_API_URL_CATEGORIES_ALL, {
        next: { revalidate: 30 } // Ревалидация данных каждые 3600 секунд (1 час)
    });

    if (!response.ok) {
        throw new Error('Failed to fetch data');
    }

    const data = await response.json();
    return data.categories;
};

// Функция для получения товара по slug с сервера
export const fetchProductBySlug = async (slug) => {
    const response = await fetch(process.env.NEXT_PUBLIC_BASE_API_URL_SERVER + process.env.NEXT_PUBLIC_PRODUCT_BY_SLUG + slug, {
        next: { revalidate: 30 } // Ревалидация данных каждые 3600 секунд (1 час)
    });

    if (!response.ok) {
        throw new Error('Failed to fetch data');
    }

    const data = await response.json();
    return data;
};
// Функция для получения товара по slug с сервера
export const fetchProductBySlugClient = async (slug) => {
    const response = await fetch(process.env.NEXT_PUBLIC_BASE_API_URL_CLIENT + process.env.NEXT_PUBLIC_PRODUCT_BY_SLUG + slug, {
        next: { revalidate: 30 } // Ревалидация данных каждые 3600 секунд (1 час)
    });

    if (!response.ok) {
        throw new Error('Failed to fetch data');
    }

    const data = await response.json();
    return data;
};
// Функция для получения количества товара по слагу и цвету
export const fetchProductQuantityBySlugAndColor = async (slug, colorSlug) => {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL_CLIENT}${process.env.NEXT_PUBLIC_PRODUCT_BY_SLUG}${slug}`, {
        next: { revalidate: 30 },
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    });

    if (!response.ok) {
        throw new Error('Failed to fetch product quantity');
    }

    const data = await response.json();
    const model = data.models.find(model => model.specEnums.some(specEnum => specEnum.slug === colorSlug));
    const color = model ? model.specEnums.find(specEnum => specEnum.slug === colorSlug) : null;

    return color ? color.in_stock : 0;
};

export async function getWeeklyProducts(): Promise<ProductsWeeklyApiResponse> { // Добавляем тип
    const url = NEXT_PUBLIC_BASE_API_URL_CLIENT + API_URL_GET_PRODUCTS_WEEKLY; // Исправлено использование
    console.log("Fetching weekly products from:", url);
    const response = await fetch(url, { // Восстанавливаем fetch
        next: { revalidate: 30 }
    });

    if (!response.ok) { // Восстанавливаем проверку
        throw new Error('Failed to fetch weekly products');
    }

    return response.json(); // Восстанавливаем возврат JSON
}

// Тип для объекта параметров POST запроса
interface FilterProductsPayload {
  Slug: string;
  Page: number;
  OrderBy?: string;
  [key: string]: any; // Для остальных фильтров
}

// Обновляем getFilteredProducts для использования POST
export async function getFilteredProducts(payload: FilterProductsPayload): Promise<ProductsFilterApiResponse | null> { 
    const url = `${NEXT_PUBLIC_BASE_API_URL_CLIENT}${API_URL_PRODUCTS_BY_FILTERS}`;
    console.log("Fetching filtered products (POST) from:", url, "with payload:", payload);
    try {
        const response = await fetch(url, { 
            method: 'POST', // Меняем на POST
            headers: {
                'Content-Type': 'application/json', // Добавляем заголовок
            },
            body: JSON.stringify(payload), // Передаем параметры в теле
            next: { revalidate: 30 } // Оставляем ревалидацию
        });

        if (!response.ok) { 
             if (response.status === 404) {
                console.log(`Products not found for payload:`, payload);
                return null;
            }
            // Логируем тело ошибки для диагностики
            const errorBody = await response.text().catch(() => 'Could not read error body');
            console.error(`Failed to fetch filtered products. Status: ${response.status}. Body:`, errorBody);
            throw new Error(`Failed to fetch filtered products. Status: ${response.status}`);
        }

        return response.json(); 
    } catch (error) {
         console.error('Error in getFilteredProducts:', error);
         // Можно вернуть null или пробросить ошибку дальше
         // throw error;
         return null;
    }
}

// Возвращаем POST-запрос для поиска
export async function searchProducts(searchTerm: string, page: number = 1): Promise<ProductsSearchApiResponse | null> {
    const url = `${NEXT_PUBLIC_BASE_API_URL_CLIENT}${API_URL_PRODUCT_SEARCH}`;
    // Формируем тело запроса
    const payload = {
        search: searchTerm,
        page: page
    };
    console.log("Searching products (POST) with payload:", payload, "at URL:", url);

    try {
        const response = await fetch(url, {
            method: 'POST', // Используем POST
            headers: {
                'Content-Type': 'application/json', // Обязательно для POST с JSON
            },
            body: JSON.stringify(payload), // Передаем данные в теле
            // cache: 'no-store'
             next: { revalidate: 10 } // Короткая ревалидация
        });

        if (!response.ok) {
            const errorBody = await response.text().catch(() => 'Could not read error body');
            console.error(`Search API request failed! Status: ${response.status}, URL: ${url}, Payload: ${JSON.stringify(payload)}, Body:`, errorBody);

            if (response.status === 404) {
                console.log(`Products not found for search term: ${searchTerm}`);
                return { products: [], max_page: 0 }; // Возвращаем пустой результат
            }
            throw new Error(`Failed to search products. Status: ${response.status}`);
        }

        const data: ProductsSearchApiResponse = await response.json();
        return data;

    } catch (error) {
         if (!(error instanceof Error && error.message.includes('Failed to search products'))) {
             console.error('Error during searchProducts fetch:', error);
        }
        // return { products: [], max_page: 0 };
        return null;
    }
}

export async function getProductBySlug(slug: string): Promise<ProductFull | null> { 
    const url = `${NEXT_PUBLIC_BASE_API_URL_CLIENT}${API_URL_PRODUCT_BY_SLUG}${slug}`;
    console.log("Fetching product by slug:", slug, "at URL:", url);
    try {
        const response = await fetch(url, { 
            next: { revalidate: 30 }
        });

        if (!response.ok) {
            if (response.status === 404) {
                console.log(`Product with slug ${slug} not found.`);
                return null;
            }
            const errorBody = await response.text().catch(() => 'Could not read error body');
            console.error(`Failed to fetch product by slug. Status: ${response.status}. Body:`, errorBody);
            throw new Error(`Failed to fetch product by slug. Status: ${response.status}`);
        }
        return response.json(); 
    } catch (error) {
        console.error('Error fetching product by slug:', error);
        return null;
    }
}

export async function getCategoryFilters(categorySlug: string): Promise<CategoryFiltersApiResponse | null> { 
    const url = `${NEXT_PUBLIC_BASE_API_URL_CLIENT}${API_URL_FILTERS_ALL}`; // Используем правильный URL
    console.log("Fetching filters (POST) for category:", categorySlug, "at URL:", url);
    try {
        const response = await fetch(url, { 
            method: 'POST', // Меняем на POST
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ category: categorySlug }), // Передаем слаг в теле
            next: { revalidate: 30 } // Оставляем ревалидацию
        });

        if (!response.ok) {
             if (response.status === 404) { 
                console.log(`Filters for category ${categorySlug} not found.`);
                return null;
            }
            // Логируем тело ошибки
            const errorBody = await response.text().catch(() => 'Could not read error body');
            console.error(`Failed to fetch category filters. Status: ${response.status}. Body:`, errorBody);
            throw new Error(`Failed to fetch category filters. Status: ${response.status}`);
        }
        return response.json(); 
    } catch (error) {
        console.error('Error in getCategoryFilters:', error);
        return null;
    }
}