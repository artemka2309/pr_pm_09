// frontend/src/components/ui/index/CategoryPage.js
import React from 'react';
import { Suspense } from 'react';
import Link from "next/link";
// import Image from 'next/image'; // Скорее всего не используется
import ClientSubCategoryPage from './ClientSubCategoryPage';
// import Breadcrumbs from '@/widgets/Breadcrumbs/ui/Breadcrumbs'; // Больше не импортируем здесь
import {
    // fetchProducts, fetchFilters, // Удаляем старые
    getCategoryFilters, // Новая для фильтров
    getFilteredProducts // Новая для продуктов
} from '@/shared/api/products';
// import { getCategories } from '@/shared/api/categories'; // Импортируем конкретные функции ниже
// import { getCategoryBySlug, getSubcategoryBySlugs } from '@/shared/api/categories'; // Используем только getCategoryBySlug
import { getCategoryBySlug } from '@/shared/api/categories';
import { notFound } from 'next/navigation';
import ProductsLoading from './loading';
import type { Metadata, ResolvingMetadata } from 'next'; // Добавляем ResolvingMetadata
import type { Category, CategoriesApiResponse } from '@/shared/types/category';
import type { CategoryFiltersApiResponse, ProductsFilterApiResponse, ProductSpecEnum } from '@/shared/types/product';
import { NEXT_PUBLIC_STATIC_URL } from "@/shared/config/api"; // Добавляем импорт

// --- Типы, аналогичные ClientSubCategoryPage --- 
interface SubCategoryPageParams {
  categoryName: string;
  subcategoryName: string; // Может быть 'all-products'
}

interface FilterOption {
  label: string;
  value: string | number;
}
interface FiltersData {
  [key: string]: FilterOption[];
}
interface InitialFiltersProps {
   filters: FiltersData;
}
// Возвращаем Promise<SubCategoryPageParams> для params
interface SubCategoryPageProps {
  params: Promise<SubCategoryPageParams>;
}
// -----------------------------------------------

// --- Вспомогательная функция для трансформации фильтров --- 
const transformFiltersForClient = (apiFilters: CategoryFiltersApiResponse | null): FiltersData => {
    if (!apiFilters || !apiFilters.Spec) {
        return {};
    }
    const transformed: FiltersData = {};
    apiFilters.Spec.forEach(spec => {
        // spec_enums - это массив строк согласно CategoryFiltersApiResponse
        transformed[spec.name] = spec.spec_enums.map((enumValue: string) => ({
            label: enumValue, // Используем строку как label
            value: enumValue  // Используем строку как value
        }));
    });
    return transformed;
};
// ---------------------------------------------------------

// Возвращаем Promise<SubCategoryPageParams> для params
type MetadataProps = {
  params: Promise<SubCategoryPageParams>;
  searchParams: { [key: string]: string | string[] | undefined };
};

// Обновленная функция generateMetadata
export async function generateMetadata(
  { params }: MetadataProps,
  parent: ResolvingMetadata
): Promise<Metadata> { 
    // Дожидаемся разрешения params
    const resolvedParams = await params;
    const categorySlug = resolvedParams.categoryName;
    const subcategorySlug = resolvedParams.subcategoryName;
    const isAllProducts = subcategorySlug === 'all-products';

    let parentCategory: Category | null = null;
    let currentSubcategory: Category | null = null;
    let title = 'Страница не найдена';
    let description = 'Запрашиваемая страница не существует';
    let imageUrl = '/img/logo/logo-b.png'; // Дефолтное изображение

    parentCategory = await getCategoryBySlug(categorySlug); // Получаем родителя

    if (!parentCategory) {
         return {
            title: 'Категория не найдена',
            description: 'Запрашиваемая категория не существует'
        };
    }

    if (isAllProducts) {
        title = parentCategory.name;
        // Убираем .description, т.к. его нет в типе
        description = `Все товары в категории ${parentCategory.name} магазина PANDA WEAR.`; 
        if (parentCategory.image) imageUrl = `${NEXT_PUBLIC_STATIC_URL}${parentCategory.image}`;
    } else {
        // Ищем подкатегорию среди детей родительской
        currentSubcategory = parentCategory.children?.find(sub => sub.slug === subcategorySlug) || null;
        if (currentSubcategory) {
            title = currentSubcategory.name;
            // Убираем .description
            description = `Товары в подкатегории ${currentSubcategory.name} магазина PANDA WEAR.`; 
            if (currentSubcategory.image) imageUrl = `${NEXT_PUBLIC_STATIC_URL}${currentSubcategory.image}`;
        } else {
             // Если подкатегория не найдена у родителя
             return {
                title: 'Подкатегория не найдена',
                description: 'Запрашиваемая подкатегория не существует'
            };
        }
    }
            
    const previousImages = (await parent).openGraph?.images || []
            
    return {
        title: title, // titleTemplate из layout добавит "- PANDA WEAR"
        description: description,
        keywords: [title, parentCategory.name, 'каталог', 'товары', 'одежда', 'Барнаул'].filter(Boolean) as string[],
        openGraph: {
            title: `${title} - Каталог PANDA WEAR`,
            description: description,
            images: [
                {
                    url: imageUrl,
                    width: 800, // Примерные размеры
                    height: 600,
                    alt: title,
                },
                ...previousImages,
            ],
            url: `https://ваш-сайт.ру/category/${categorySlug}/${subcategorySlug}`,
            type: 'website',
        },
        // Можно добавить twitter метаданные аналогично
    };
}

// Используем SubCategoryPageProps с Promise и await
export default async function SubCategoryPage({ params }: SubCategoryPageProps) {
    // Дожидаемся разрешения params
    const resolvedParams = await params;
    const categorySlug = resolvedParams.categoryName;
    const subcategorySlug = resolvedParams.subcategoryName;
    const isAllProducts = subcategorySlug === 'all-products'; 
    
    try {
        // Получаем данные родительской категории
        const parentCategory = await getCategoryBySlug(categorySlug);
        
        if (!parentCategory) {
            notFound();
        }
        
        // Ищем подкатегорию для проверки существования и для хлебных крошек
        const currentSubCategoryForCheckAndBreadcrumb = isAllProducts 
            ? undefined 
            : parentCategory.children?.find(sub => sub.slug === subcategorySlug);

        // Если это не "все товары" и подкатегория не найдена, возвращаем 404
        if (!isAllProducts && !currentSubCategoryForCheckAndBreadcrumb) { 
            notFound();
        }
        
        // Формируем объект payload для начального POST запроса
        const initialPayload = {
            Slug: isAllProducts ? categorySlug : subcategorySlug,
            Page: 1,
        };
        
        // Запускаем параллельные запросы для товаров и фильтров
        const [initialProductsData, initialFiltersApiData] = await Promise.all([
            getFilteredProducts(initialPayload), 
            getCategoryFilters(isAllProducts ? categorySlug : subcategorySlug) 
        ]);
        
        // --- Логирование данных фильтров --- 
        // console.log("API Filters Data (page.tsx):", JSON.stringify(initialFiltersApiData, null, 2));
        // ----------------------------------

        // Трансформируем фильтры для клиента
        const initialFiltersForClient: InitialFiltersProps = {
            filters: transformFiltersForClient(initialFiltersApiData)
        };

        // --- Логирование трансформированных фильтров --- 
        // console.log("Transformed Filters for Client (page.tsx):", JSON.stringify(initialFiltersForClient, null, 2));
        // ---------------------------------------------
        
        // Формируем path для нового компонента Breadcrumbs
        const breadcrumbPath: { name: string; slug: string; }[] = [];
        if (parentCategory) {
            breadcrumbPath.push({ name: parentCategory.name, slug: parentCategory.slug });
        }
        // Используем найденную ранее подкатегорию
        if (currentSubCategoryForCheckAndBreadcrumb) { 
            breadcrumbPath.push({ name: currentSubCategoryForCheckAndBreadcrumb.name, slug: currentSubCategoryForCheckAndBreadcrumb.slug });
        }

        return (
            <main className="flex flex-col min-h-screen max-w-screen-xl mx-auto px-4">
                <Suspense fallback={<ProductsLoading />}>
                    <ClientSubCategoryPage
                        initialProducts={initialProductsData ?? { products: [], max_page: 1 }}
                        initialFilters={initialFiltersForClient}
                        params={resolvedParams}
                        isAllProducts={isAllProducts}
                        breadcrumbPath={breadcrumbPath}
                    />
                </Suspense>
            </main>
        );
    } catch (error) {
        console.error('ошибка загрузки страницы подкатегории:', error);
        notFound();
    }
}