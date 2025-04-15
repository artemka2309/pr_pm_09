"use client";

import React, { useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import Link from "next/link";
import Image from 'next/image'; // Используем Image
import { useInView } from 'react-intersection-observer';
import clsx from 'clsx'; // Для динамических классов

// Компоненты Hero UI (индивидуальные импорты)
// import { Button, Card, /* Heading, Text, */ Badge } from '@heroui/react'; // Убираем общий импорт
import { Button } from "@heroui/button";
import { Badge } from "@heroui/badge";
// Card не используется пока

// Импорты дочерних компонентов (обновленные пути FSD)
import ProductImageCarousel from '@/features/ProductGallery/ui/ProductImageCarousel';
import ProductVariantSelector from '@/features/ProductGallery/ui/ProductVariantSelector';
import RelatedProducts from '@/widgets/RelatedProducts/ui/RelatedProducts';
import TelegramDisplay from '@/features/TelegramDisplay/ui/TelegramDisplay';
import CopyLink from '@/features/CopyLink/ui/CopyLink';
// import ProductInfoAccordion from './ProductInfoAccordion'; // Убираем аккордион

// Импорты из других слоев (обновленные пути FSD)
import Breadcrumbs from '@/widgets/Breadcrumbs/ui/Breadcrumbs';

import AddToCartFromProductPageButton from '@/features/Cart/ui/AddToCartFromProductPageButton';
// Импортируем тип ViewedProduct вместе с хуком
import useViewedProductsStore, { ViewedProduct } from '@/store/viewedProductsStore'; 

// Утилиты и иконки
import { formatPrice } from '@/shared/lib/formatPrice';
import { ShoppingBag } from 'lucide-react'; // Убираем Inbox

// Импортируем Category и ProductFull
import type { Category } from '@/shared/types/category';
import type { ProductFull, ProductModel, ProductSpecEnum, ProductSpec } from '@/shared/types/product';

// --- Типы --- 

// Убираем локальные типы SpecEnum, Spec, ProductModel, Match, ProductDataType, CategoryType
// т.к. мы импортируем их из shared/types

interface ProductDetailsProps {
  productData: ProductFull; // Используем импортированный ProductFull
  parentCategorySlug: string; // Добавляем проп
  subcategorySlug: string;  // Добавляем проп
  // Убираем categories, parentCategory, subcategory из пропсов, т.к. path берется из productData
  // categories?: Category[]; // Используем импортированный Category
  // parentCategory?: Category; // Используем импортированный Category
  // subcategory?: Category; // Используем импортированный Category
  // Убираем лишние пропсы category, subcategoryName, tovar, firstImage
}

// --- Компонент --- 
const ProductDetails: React.FC<ProductDetailsProps> = ({
    productData,
    parentCategorySlug, // Получаем проп
    subcategorySlug,     // Получаем проп
    // Убираем categories, parentCategory, subcategory из пропсов, т.к. path берется из productData
    // categories,
    // parentCategory,
    // subcategory,
}) => {
    const { addViewedProduct } = useViewedProductsStore(); // Получаем функцию из стора

    // Фильтруем доступные цвета/модели
    const availableColors = productData.models?.[0]?.specEnums?.filter(color => color.in_stock > 0) ?? [];
    const [selectedVariant, setSelectedVariant] = React.useState<ProductSpecEnum | null>(() => {
        const defaultVariant = productData.models?.[0]?.specEnums?.find(v => v.slug === productData.defaultModel_slug);
        const initialVariant = (defaultVariant && defaultVariant.in_stock > 0)
            ? defaultVariant
            : productData.models?.[0]?.specEnums?.find(v => v.in_stock > 0) ?? null;
        console.log("[Details] Initial variant set to:", initialVariant);
        return initialVariant;
    });

    const handleVariantSelect = (variantSlug: string) => {
        console.log(`[Details] handleVariantSelect called with slug: ${variantSlug}`);
        const newVariant = productData.models?.[0]?.specEnums?.find(v => v.slug === variantSlug);
        console.log("[Details] Found new variant:", newVariant);
        
        if (newVariant && newVariant.in_stock > 0) {
            console.log("[Details] Setting selected variant to:", newVariant);
            setSelectedVariant(newVariant);
        } else {
            console.warn("[Details] New variant not found or out of stock:", newVariant);
        }
    };

    const [infoRef, infoInView] = useInView({ triggerOnce: true, threshold: 0.1 });
    const [descRef, descInView] = useInView({ triggerOnce: true, threshold: 0.1 });

    // Теперь productData уже имеет тип ProductFull
    // Убираем viewedProductData, логика добавления в просмотренные уходит
    // const viewedProductData = { ... };

    // --- Добавляем товар в просмотренные при загрузке --- 
    useEffect(() => {
        if (productData) {
            // Создаем объект, соответствующий обновленному интерфейсу ViewedProduct
            const viewedProductToAdd: ViewedProduct = { // Добавляем явное указание типа для проверки
                id: productData.article, // Используем article как ID
                slug: productData.slug,
                parentCategorySlug: parentCategorySlug, // Берем из пропсов
                subcategorySlug: subcategorySlug,     // Берем из пропсов
                name: productData.name,
                image_logo: productData.image_logo, // Используем основное лого
                price: productData.price,
                price_discount: productData.price_discount,
                is_active: productData.is_active,
                stock: productData.in_stock ?? 0, // Исправляем имя поля на in_stock
                models: productData.models ?? [], // Добавляем models (с проверкой на null/undefined)
                // Добавляем слаг модели по умолчанию
                defaultModel_slug: productData.defaultModel_slug ?? null, 
            };
            addViewedProduct(viewedProductToAdd);
        }
    }, [productData, parentCategorySlug, subcategorySlug, addViewedProduct]); // Добавляем зависимости
    // -----------------------------------------------------

    // --- Подготовка данных для кнопок --- 
    // Предполагаем, что кнопки ожидают объект типа ProductType 
    // (с id, category и другими базовыми полями)
    const productForButtons = {
        article: productData.article,
        name: productData.name,
        slug: productData.slug,
        price: productData.price,
        price_discount: productData.price_discount,
        image_logo: selectedVariant?.images?.[0] ?? productData.image_logo, // Используем картинку варианта или дефолтную
        // Доп. инфо для корзины
        variant_slug: selectedVariant?.slug,
        variant_name: selectedVariant?.name,
        max_quantity: selectedVariant?.in_stock ?? 0,
        // parentCategorySlug и subcategorySlug теперь передаются как пропсы компонента ProductDetails
        // и будут переданы в AddToCartFromProductPageButton
    };
    // -----------------------------------

    // Формируем путь для хлебных крошек
    const breadcrumbPath = productData.category_path?.map(p => ({ name: p.name, slug: p.slug })) ?? [];

    const hasMultipleVariants = (productData.models?.[0]?.specEnums?.length ?? 0) > 1;
    const currentPrice = productData.price_discount ?? productData.price;
    const oldPrice = productData.price_discount ? productData.price : null;
    const isAvailable = selectedVariant ? selectedVariant.in_stock > 0 : (productData.models?.[0]?.specEnums?.some(v => v.in_stock > 0) ?? false);
    const selectedVariantName = selectedVariant?.name?.toLowerCase();
    const characteristicName = productData.models?.[0]?.name.toLowerCase();

    console.log("[Details] Rendering with selectedVariant:", selectedVariant);

    return (
        <main className="bg-white">
            <div className="mx-auto px-4 max-w-screen-xl py-4">
                 {/* Верхняя строка */}
                <div className="mb-6 flex flex-wrap justify-between items-start gap-x-4 gap-y-2"> 
                    {/* Левая часть: Хлебные крошки */}
                    <div>
                        <Breadcrumbs
                            path={breadcrumbPath}
                            currentProduct={productData.name}
                        />
                    </div>
                    {/* Правая часть (ДЕСКТОП): Артикул, Наличие, Поделиться */} 
                    <div className="hidden sm:flex items-center flex-wrap gap-x-4 gap-y-1 text-sm text-light-500"> {/* Скрыто до sm */} 
                        <span>артикул: {productData.article}</span>
                        <Badge 
                            className={clsx(
                                "capitalize text-xs font-medium px-2.5 py-0.5 rounded-full",
                                isAvailable 
                                    ? "bg-green-100 text-green-800" 
                                    : "bg-red-100 text-red-700" 
                            )}
                        >
                            {isAvailable ? `в наличии ${selectedVariant ? `(${selectedVariant.in_stock} шт)` : ''}` : 'нет в наличии'}
                        </Badge>
                        <CopyLink className="bg-light text-black rounded-md px-2 py-0.5" />
                    </div>
                </div>
                
                {/* Основной блок товара */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 xl:gap-16">
                    {/* Галерея товара - делаем sticky */}
                    <div className="lg:sticky lg:top-24 h-max overflow-hidden rounded-2xl">
                        <ProductImageCarousel
                            selectedVariant={selectedVariant}
                        />
                    </div>

                    {/* Информация о товаре */}
                    <div 
                        ref={infoRef}
                        className="flex flex-col"
                    >
                        {/* Заголовок (без копирования) */}
                        <div className="mb-3">
                            <h1 className="text-4xl lg:text-5xl font-normal tracking-tight text-black !leading-tight">
                                {productData.name.toLowerCase()}
                            </h1>
                        </div>

                        {/* Цена */}
                        <div className="flex items-baseline space-x-3 mb-6">
                            <p className="text-4xl lg:text-5xl font-normal text-black">
                                {formatPrice(currentPrice)}
                            </p>
                            {oldPrice && (
                                <span className="line-through text-light-400 text-2xl">
                                    {formatPrice(oldPrice)}
                                </span>
                            )}
                        </div>

                        {/* МОБИЛЬНЫЙ блок: Артикул, Наличие, Поделиться */} 
                        <div className="flex sm:hidden items-center flex-wrap justify-between gap-x-4 gap-y-1 text-sm text-light-500 mb-4"> {/* Видно только до sm */} 
                            <span>артикул: {productData.article}</span>
                            <Badge 
                                className={clsx(
                                    "capitalize text-xs font-medium px-2.5 py-0.5 rounded-full",
                                    isAvailable 
                                        ? "bg-green-100 text-green-800" 
                                        : "bg-red-100 text-red-700" 
                                )}
                            >
                                {isAvailable ? `в наличии ${selectedVariant ? `(${selectedVariant.in_stock} шт)` : ''}` : 'нет в наличии'}
                            </Badge>
                            <CopyLink className="bg-light text-black rounded-md px-2 py-0.5" />
                        </div>

                        {/* Выбор варианта */}
                        {hasMultipleVariants && (
                            <div className="mb-8 bg-light p-4 rounded-2xl"> {/* Добавляем фон, отступ, скругление */} 
                                <ProductVariantSelector
                                    colors={productData.models[0].specEnums}
                                    characteristicName={characteristicName}
                                    onVariantSelect={handleVariantSelect}
                                    selectedVariantSlug={selectedVariant?.slug}
                                />
                            </div>
                        )}
                        
                        {/* Блок кнопок - всегда в строку */}
                        <div className="mt-auto mb-8 flex flex-row gap-2"> 
                            {/* Кнопка "Купить сейчас" */}
                            <Button 
                                className="w-full h-11 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors text-sm font-normal"
                                onClick={() => { /* TODO: Логика немедленной покупки */ console.log('Buy Now clicked'); }}
                            >
                                купить сейчас
                            </Button>
                            
                            {/* Кнопка "В корзину" */}
                            <AddToCartFromProductPageButton 
                                product={productForButtons} 
                                parentCategorySlug={parentCategorySlug} 
                                subcategorySlug={subcategorySlug} 
                                className="w-full h-11 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors text-sm font-normal"
                            />
                        </div>
                        
                        {/* Описание - Обновляем стили */}
                        {productData.desc_long && (
                            <div className="bg-light p-4 rounded-2xl mb-8"> {/* Убрали border-t, pt-8, добавили фон, отступ, скругление */} 
                                 <h3 className="text-lg font-medium text-gray-900 mb-3">описание</h3>
                                <div className="prose prose-sm max-w-none text-light-600">
                                    <ReactMarkdown>{productData.desc_long.toLowerCase()}</ReactMarkdown>
                                </div>
                            </div>
                        )}

                        {/* Характеристики - Обновляем стили */} 
                        <div className="bg-light p-4 rounded-2xl mb-8"> {/* Убрали border-t, pt-8, добавили фон, отступ, скругление */} 
                             {/* Показываем выбранный размер/цвет */}
                            {selectedVariant && characteristicName && (
                                <div className="space-y-3 mb-6">
                                    <h3 className="text-lg font-medium text-gray-900">выбранный {characteristicName}</h3>
                                     <div className="flex justify-between items-center pb-1.5 border-b border-light-100 text-sm">
                                        <span className="text-light-500">{characteristicName}:</span>
                                        <span className="text-gray-800 font-medium text-right">{selectedVariantName}</span>
                                    </div>
                                </div>
                            )}
                            {/* Общие характеристики */}
                            <ProductSpecsList specs={productData.specs} />
                        </div>

                        {/* Телеграм виджет */}
                        {productData.telegramPost && (
                            <div className="mt-8">
                                <TelegramDisplay />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Нижняя секция: Похожие */}
            <div className="mx-auto px-4 max-w-screen-xl mt-24 pb-16">
                {/* Похожие товары */}
                {productData.matches && productData.matches.length > 0 && (
                    <div className="">
                        
                        <RelatedProducts 
                            matches={productData.matches} 
                        />
                    </div>
                )}
            </div>
        </main>
    );
};

// Компонент для отображения характеристик
interface ProductSpecsListProps {
    specs: ProductSpec[]; 
    className?: string;
}
const ProductSpecsList: React.FC<ProductSpecsListProps> = ({ specs, className }) => {
    if (!specs || specs.length === 0) return null;
    return (
        <div className={clsx("space-y-3", className)}>
            <h3 className="text-lg font-medium text-gray-900">характеристики</h3>
            <ul className="space-y-2 text-sm">
                {specs.map((spec) => (
                    <li key={spec.name} className="flex justify-between items-center pb-1.5 border-b border-gray-100">
                        <span className="text-gray-500">{spec.name.toLowerCase()}:</span>
                        <span className="text-gray-800 font-medium text-right">{spec.value.toLowerCase()}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default ProductDetails; 