import React from 'react';
import { getProductBySlug } from '@/shared/api/products';
import { getCategories } from '@/shared/api/categories';
import { formatPrice } from '@/shared/lib/formatPrice';
import { ProductDetails } from '@/widgets/ProductDetails';
import { NEXT_PUBLIC_STATIC_URL } from "@/shared/config/api";
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import type { Category, CategoriesApiResponse } from '@/shared/types/category';
import type { ProductFull, ProductSpecEnum } from '@/shared/types/product';

interface TovarPageParams {
  categoryName: string;
  subcategoryName: string;
  tovar: string;
}

interface TovarPageProps {
  params: Promise<TovarPageParams>;
}

// --- Хелпер для получения основного изображения ---
function getPrimaryImageUrl(productData: ProductFull): string {
    if (!productData) return '';

    let imageUrl = '';
    if (productData.image_logo) {
        imageUrl = `${NEXT_PUBLIC_STATIC_URL}${productData.image_logo}`;
    } else if (productData.models && productData.models[0]?.specEnums) {
        // Сначала ищем изображение для модели по умолчанию
        const defaultModelSpec = productData.models[0].specEnums.find(
            (spec: ProductSpecEnum) => spec.name === productData.defaultModel && spec.images?.[0]
        );
        if (defaultModelSpec?.images?.[0]) {
            imageUrl = `${NEXT_PUBLIC_STATIC_URL}${defaultModelSpec.images[0]}`;
        } else {
            // Если у дефолтной модели нет, берем первое доступное изображение из specEnums
            const firstAvailableModelSpec = productData.models[0].specEnums.find(
                (spec: ProductSpecEnum) => spec.images?.[0]
            );
            if (firstAvailableModelSpec?.images?.[0]) {
                imageUrl = `${NEXT_PUBLIC_STATIC_URL}${firstAvailableModelSpec.images[0]}`;
            }
        }
    }
    // Можно добавить fallback на случай, если вообще нет изображений
    return imageUrl;
}

// --- Хелпер для поиска категорий ---
function findCategories(
    categories: Category[] | undefined,
    categoryName: string,
    subcategoryName: string
): { parentCategory?: Category; subcategory?: Category } {
    if (!categories) {
        return {};
    }
    const parentCategory = categories.find(cat => cat.slug === categoryName);
    const isAllProducts = subcategoryName === categoryName; // Проверка, если subcategoryName совпадает с categoryName
    const subcategory = !isAllProducts && parentCategory?.children
        ? parentCategory.children.find(sub => sub.slug === subcategoryName)
        : undefined;
    return { parentCategory, subcategory };
}

// Добавляем тип для пропсов generateMetadata, как рекомендовано в документации и SO
type MetadataProps = {
  params: Promise<TovarPageParams>;
  // searchParams?: Promise<{ [key: string]: string | string[] | undefined }>; // Если нужны searchParams
};

export async function generateMetadata(props: MetadataProps): Promise<Metadata> {
    const { params } = props; // Получаем Promise
    const awaitedParams = await params; // Ожидаем разрешения Promise
    const { categoryName, subcategoryName, tovar } = awaitedParams; // Деструктурируем разрешенное значение

    // Получаем данные параллельно
    const [productData, categoriesData] = await Promise.all([
        getProductBySlug(tovar),
        getCategories()
    ]);

    if (!productData) {
        return {
            title: 'Товар не найден',
            description: 'Запрашиваемый товар не существует'
        };
    }

    const { parentCategory, subcategory } = findCategories(categoriesData?.categories, categoryName, subcategoryName);

    const displayCategory = subcategory?.name ?? parentCategory?.name ?? 'магазине';
    const priceString = formatPrice(productData.price_discount || productData.price);
    const title = `купить ${productData.name.toLowerCase()} в ${displayCategory.toLowerCase()} panda wear | цена ${priceString}`;
    const description = `${(productData.desc_short || `купить ${productData.name}`).toLowerCase()} в интернет-магазине panda wear. ✅ доставка по всей россии. ⭐ гарантия качества. 💰 выгодные цены. заказывайте сейчас!`;

    const ogImageUrl = getPrimaryImageUrl(productData);

    const canonicalUrl = `/category/${categoryName}/${subcategoryName}/${tovar}`;

    return {
        metadataBase: new URL('https://pandawear.ru'), // Убедитесь, что URL корректный
        title,
        description,
        openGraph: {
            title,
            description,
            images: ogImageUrl ? [{ url: ogImageUrl }] : [],
            locale: 'ru_RU',
            type: 'website',
            url: canonicalUrl,
            siteName: 'panda wear', // Возможно, вынести в константу
        },
        other: {
            'og:price:amount': String(productData.price_discount ?? productData.price), // Используем ?? для большей надежности
            'og:price:currency': 'RUB',
            'og:availability': productData.in_stock > 0 ? 'in stock' : 'out of stock',
        },
        alternates: {
            canonical: canonicalUrl,
        },
    };
}

// Обновляем тип в TovarPage
export default async function TovarPage(props: TovarPageProps) {
    const { params } = props; // Получаем Promise
    const awaitedParams = await params; // Ожидаем разрешения Promise
    const { categoryName, subcategoryName, tovar } = awaitedParams; // Деструктурируем разрешенное значение

    // Получаем данные параллельно
    const [productData, categoriesData] = await Promise.all([
        getProductBySlug(tovar),
        getCategories()
    ]);

    // Обработка случая, когда товар не найден
    if (!productData) {
        console.error(`[TovarPage] Product not found, calling notFound(). Slug: ${tovar}`); // Оставим console.error для диагностики на сервере
        notFound(); // Вызов notFound() прервет рендеринг и покажет страницу 404
    }

    // Находим родительскую и дочернюю категории
    const { parentCategory, subcategory } = findCategories(categoriesData?.categories, categoryName, subcategoryName);

    // Получаем основное изображение для структурированных данных
    const primaryImageUrl = getPrimaryImageUrl(productData);

    // Подготовка структурированных данных JSON-LD
    const structuredData = {
        "@context": "https://schema.org/",
        "@type": "Product",
        name: productData.name.toLowerCase(),
        image: primaryImageUrl, // Используем найденное изображение
        description: productData.desc_short ? productData.desc_short.toLowerCase() : '',
        sku: productData.article ? String(productData.article) : undefined, // SKU обычно строка
        brand: {
            "@type": "Brand",
            name: "panda wear" // Можно вынести в константу
        },
        offers: {
            "@type": "Offer",
            url: `/category/${categoryName}/${subcategoryName}/${tovar}`, // Используем переменные
            priceCurrency: "RUB",
            price: String(productData.price_discount ?? productData.price), // Используем ??
            priceValidUntil: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0], // Дата валидности цены
            availability: productData.in_stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            seller: {
                "@type": "Organization",
                name: "panda wear" // Можно вынести в константу
            }
        }
    };

    return (
        <>
            {/* Внедрение структурированных данных JSON-LD */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
            />
            {/* Отображение деталей продукта */}
            <ProductDetails
                productData={productData}
                // Передаем слоги категорий, используя categoryName и subcategoryName из params
                parentCategorySlug={categoryName} 
                subcategorySlug={subcategoryName} 
            />
        </>
    );
}