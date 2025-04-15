// frontend/src/app/api/categories.js
import { NEXT_PUBLIC_BASE_API_URL_CLIENT, API_URL_CATEGORIES_ALL } from "@/shared/config/api";
import type { CategoriesApiResponse, Category } from "@/shared/types/category";

export async function getCategories(): Promise<CategoriesApiResponse> {
    const res = await fetch(NEXT_PUBLIC_BASE_API_URL_CLIENT + API_URL_CATEGORIES_ALL, {
        next: { revalidate: 30 }
    });
    if (!res.ok) {
        throw new Error('Failed to fetch data');
    }
    return res.json();
}

// Функция для получения категории по slug
export async function getCategoryBySlug(slug: string): Promise<Category | (Category & { parentCategory: Pick<Category, 'id' | 'name' | 'slug'> }) | null> {
    try {
        const data: CategoriesApiResponse = await getCategories();
        
        if (!data || !data.categories || !data.categories.length) {
            return null;
        }
        
        // Ищем категорию по slug
        const category = data.categories.find(cat => cat.slug === slug);
        
        if (category) {
            return category;
        }
        
        // Если не нашли в основных категориях, ищем в подкатегориях
        for (const parentCategory of data.categories) {
            if (parentCategory.children && parentCategory.children.length) {
                const childCategory = parentCategory.children.find(child => child.slug === slug);
                if (childCategory) {
                    return {
                        ...childCategory,
                        parentCategory: {
                            id: parentCategory.id,
                            name: parentCategory.name,
                            slug: parentCategory.slug
                        }
                    };
                }
            }
        }
        
        return null;
    } catch (error) {
        console.error('Ошибка при получении категории по slug:', error);
        return null;
    }
}

// Функция для получения подкатегорий родительской категории
export async function getSubcategoriesByParentSlug(parentSlug: string): Promise<Category[]> {
    try {
        const data: CategoriesApiResponse = await getCategories();
        
        if (!data || !data.categories || !data.categories.length) {
            return [];
        }
        
        const parentCategory = data.categories.find(cat => cat.slug === parentSlug);
        
        if (parentCategory && parentCategory.children && parentCategory.children.length) {
            return parentCategory.children;
        }
        
        return [];
    } catch (error) {
        console.error('Ошибка при получении подкатегорий:', error);
        return [];
    }
}