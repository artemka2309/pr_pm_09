"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image"; // Используем next/image
import { formatPrice } from '@/shared/lib/formatPrice'; // Обновляем путь
import { truncateText } from '@/shared/lib/truncateText'; // Обновляем путь
import { Inbox, ImageOff, ArrowRight } from 'lucide-react';
import { Button } from "@heroui/react";
import { addToast } from '@heroui/react'; // Импортируем addToast
import useCartStore from '@/store/cartStore'; // Обновляем путь
// import type { Product } from '@/shared/types/product'; // Предполагаемый путь к общему типу Product - ВРЕМЕННО ОТКЛЮЧЕНО
import type { PressEvent } from '@react-types/shared'; // Импортируем PressEvent
import { NEXT_PUBLIC_STATIC_URL } from "@/shared/config/api";

interface ProductCardProps {
  product?: any; // TODO: Заменить any на конкретный тип ProductCardData?
  // category?: string | null; // Убираем старые, передаем слоги
  // subcategory?: string | null;
  parentCategorySlug?: string | null; // Новый проп
  subcategorySlug?: string | null;  // Новый проп
  isLoading?: boolean;
  isWeeklyProduct?: boolean;
}

export default function ProductCard({
  product,
  // category,
  // subcategory,
  parentCategorySlug, // Получаем новые пропсы
  subcategorySlug,
  isLoading = false,
  isWeeklyProduct = false,
}: ProductCardProps) {
  // Типизируем деструктуризацию, добавляем проверку на product
  const {
    image_logo,
    price,
    price_discount,
    name,
    desc_short,
    slug,
    defaultModel,
    defaultModel_slug,
    available_models,
    in_stock,
    category_path // Добавляем новое имя поля из Matches
  } = product || {};

  const [isImageLoaded, setIsImageLoaded] = useState<boolean>(false);
  const [imageError, setImageError] = useState<boolean>(false);
  const addToCart = useCartStore((state) => state.addToCart);
  const getItemQuantity = useCartStore((state) => state.getItemQuantity);

  // Формирование URL изображения
  const imageUrl = image_logo
    ? `${NEXT_PUBLIC_STATIC_URL}${image_logo}`
    : '/img/catalog-img/no_image.png';

  // Предзагрузка изображения (остается без изменений)
  useEffect(() => {
    if (image_logo && !isImageLoaded && !imageError) {
      const img = new window.Image(); // Используем window.Image в браузере
      img.src = imageUrl;
      img.onload = () => setIsImageLoaded(true);
      img.onerror = () => {
        console.error(`ошибка загрузки изображения: ${imageUrl}`);
        setImageError(true);
        setIsImageLoaded(true);
      };
    }
  }, [image_logo, imageUrl, isImageLoaded, imageError]);

  // Скелетон при загрузке
  if (isLoading) {
    return (
      <div className="flex flex-col h-full justify-between space-y-2 mb-2 overflow-hidden animate-pulse">
        <div className="rounded-2xl bg-light aspect-square w-full"></div>
        <div className="h-6 bg-light rounded w-3/4"></div>
        <div className="h-4 bg-light rounded w-1/2"></div>
        <div className="h-10 bg-light rounded w-full"></div>
      </div>
    );
  }
  
  // Если нет данных о продукте после загрузки - рендерим null или сообщение
  if (!product) {
      return (
          <div className="flex flex-col h-full items-center justify-center text-dark">
              Не удалось загрузить товар
          </div>
      );
  }

  // --- Адаптированная логика определения модели --- 
  let selectedModel = defaultModel || '';
  let selectedModelSlug = defaultModel_slug || '';
  let selectedModelStock = 0;
  let availableVariants: { name: string; slug: string; in_stock: number }[] = [];
  let isSimpleProduct = true;

  // Пытаемся получить варианты из available_models (старая структура)
  if (product.available_models && Array.isArray(product.available_models) && product.available_models.length > 0) {
      availableVariants = product.available_models;
      isSimpleProduct = false;
  } 
  // Иначе пытаемся получить из models[0].specEnums (структура из ViewedProduct / ProductFull)
  else if (product.models && Array.isArray(product.models) && product.models[0]?.specEnums && Array.isArray(product.models[0].specEnums) && product.models[0].specEnums.length > 0) {
      availableVariants = product.models[0].specEnums;
      isSimpleProduct = false;
  }

  // Фильтруем доступные варианты (in_stock > 0)
  const filteredVariants = availableVariants.filter(variant => variant.in_stock > 0);

  if (!isSimpleProduct) {
      // Пытаемся найти модель по умолчанию среди ВСЕХ вариантов (не только доступных)
      const defaultVariant = availableVariants.find(v => v.slug === defaultModel_slug);
      
      // Если модель по умолчанию существует и ДОСТУПНА
      if (defaultVariant && defaultVariant.in_stock > 0) {
          selectedModel = defaultVariant.name;
          selectedModelSlug = defaultVariant.slug;
          selectedModelStock = defaultVariant.in_stock;
      } 
      // Если модель по умолчанию НЕдоступна, но есть ДРУГИЕ доступные варианты
      else if (filteredVariants.length > 0) {
          selectedModel = filteredVariants[0].name;
          selectedModelSlug = filteredVariants[0].slug;
          selectedModelStock = filteredVariants[0].in_stock;
      } 
      // Если доступных вариантов нет (ни по умолчанию, ни других)
      else {
          // Оставляем имя/слаг модели по умолчанию (если они были), но сток 0
          selectedModel = defaultVariant?.name || ''; 
          selectedModelSlug = defaultVariant?.slug || '';
          selectedModelStock = 0;
      }
  } else {
      // Для простых продуктов используем общий in_stock
      selectedModelStock = product.in_stock ?? 0;
      // У простого товара нет модели
      selectedModel = '';
      selectedModelSlug = ''; // Или какой-то стандартный слаг?
  }
  // --------------------------------------------------

  // Формирование URL
  const getProductUrl = (): string => {
    if (!slug) return '#'; // Нужен слаг товара
    const modelSlugParam = selectedModelSlug ? `?color=${selectedModelSlug}` : '';

    // Приоритет: Используем переданные слоги, если они есть
    if (parentCategorySlug && subcategorySlug) {
      return `/category/${parentCategorySlug}/${subcategorySlug}/${slug}${modelSlugParam}`;
    } 
    // Если есть только родительский слаг (например, товар напрямую в категории)
    if (parentCategorySlug) {
        return `/category/${parentCategorySlug}/${slug}${modelSlugParam}`; 
    }
    // Если слоги не переданы (например, товар недели), пытаемся извлечь из category_path
    if (isWeeklyProduct && category_path && Array.isArray(category_path)) {
      const pCatSlug = category_path[0]?.slug;
      const sCatSlug = category_path[1]?.slug; 
      if (!pCatSlug) return '#';
      if (sCatSlug) {
        return `/category/${pCatSlug}/${sCatSlug}/${slug}${modelSlugParam}`;
      } else {
        return `/category/${pCatSlug}/${slug}${modelSlugParam}`;
      }
    }
    // Если ничего не найдено, возвращаем заглушку
    return '#';
  };

  const productUrl = getProductUrl();

  // Добавление в корзину
  const handleAddToCart = (e: PressEvent) => {
    const productStock = selectedModelStock;
    const productModel = isSimpleProduct ? 'стандарт' : selectedModel;
    const productModelSlug = (isSimpleProduct ? 'standard' : selectedModelSlug)?.toLowerCase();

    if (!productModelSlug) {
        addToast({ title: 'Ошибка', description: 'Не удалось определить вариант товара.', color: 'danger', timeout: 2000 });
        return;
    }

    if (productStock <= 0) {
      addToast({ title: 'Ошибка', description: 'Товара нет в наличии.', color: 'danger', timeout: 2000 });
      return;
    }

    const uniqueId = `${slug}-${productModelSlug}`;
    const currentQuantity = getItemQuantity(uniqueId);

    if (currentQuantity < productStock) {
      const cartItem = {
        uniqueId,
        name: name ?? 'Без названия',
        description: desc_short || '',
        price: price ?? 0,
        price_discount: price_discount,
        image: imageUrl,
        color: productModel,
        colorSlug: productModelSlug,
        parentCategorySlug: parentCategorySlug,
        subcategorySlug: subcategorySlug,
        slug: slug ?? '',
        id: product?.article, 
        quantity: 1,
        stock: productStock
      };
      addToCart(cartItem);

      addToast({
        title: name ?? 'Товар',
        description: `(${productModel}) добавлен в корзину!`,
        color: 'success',
        endContent: (
          <Link href="/cart" passHref legacyBehavior>
            <Button size="sm" className="bg-white text-black text-xs px-3 py-1.5 rounded-lg">
              В корзину <ArrowRight size={14} className="ml-1" />
            </Button>
          </Link>
        )
      });

    } else {
      addToast({ 
        title: 'Ошибка', 
        description: `Максимальное количество (${productStock} шт.) уже в корзине`, 
        color: 'danger', 
        timeout: 2000
      });
    }
  };

  return (
    <div className="group h-full flex flex-col">
      <div className="flex-grow">
        <Link href={productUrl} className="block h-full">
          <div className="flex flex-col h-full">
            {/* Изображение */}
            <div className="relative aspect-square bg-light mb-2 overflow-hidden rounded-2xl">
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-5 transition-opacity duration-500 z-10"></div>
              <div className="relative h-full w-full overflow-hidden">
                {/* Placeholder пока изображение не загружено */}
                {!isImageLoaded && !imageError && (
                  <div className="absolute inset-0 bg-light animate-pulse"></div>
                )}

                {/* Изображение или fallback при ошибке */}
                {!imageError ? (
                  <Image // Используем Next.js Image
                    src={imageUrl}
                    alt={name || 'товар'}
                    fill // Используем fill для заполнения контейнера
                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw" // Примерные размеры для оптимизации
                    style={{ objectFit: 'cover' }} // Аналог object-cover
                    className={`transition-transform duration-700 ease-out group-hover:scale-105 ${isImageLoaded ? 'opacity-100' : 'opacity-0'}`}
                    onLoad={() => setIsImageLoaded(true)}
                    onError={() => {
                      console.error(`ошибка отображения изображения: ${imageUrl}`);
                      setImageError(true);
                      setIsImageLoaded(true); // Помечаем как загруженное, чтобы показать fallback
                    }}
                    priority={false} // Не приоритетная загрузка для карточек
                  />
                ) : (
                  // Плейсхолдер при ошибке
                  <div className="absolute inset-0 bg-light flex items-center justify-center">
                    <ImageOff size={48} className="text-dark" strokeWidth={1.5} />
                  </div>
                )}

                {/* Скидка */}
                {price_discount && price && price_discount < price && (
                  <div className="absolute top-2 right-2 bg-white text-black text-xs font-normal p-2 rounded-lg z-10">
                    скидка {Math.round((1 - price_discount / price) * 100)}%
                  </div>
                )}

                {/* Модели */}
                {!isSimpleProduct && filteredVariants.length > 0 && (
                  <div className="absolute bottom-2 left-2 bg-white text-black text-xs font-normal p-2 rounded-lg z-10">
                    {filteredVariants.length} {filteredVariants.length === 1 ? 'вид' : filteredVariants.length <= 4 ? 'вида' : 'видов'}
                  </div>
                )}

                {/* Наличие */}
                {/* {!isSimpleProduct && ( */} 
                {/*    // Пока скроем, т.к. stock отображается на кнопке и может быть 0 */}
                {/*    <div className="absolute top-2 left-2 bg-white text-black text-xs font-normal p-2 rounded-lg flex items-center z-10"> */} 
                {/*        <Inbox className="mr-1" size={16} /> */} 
                {/*        {selectedModelStock > 0 ? selectedModelStock : 'нет в наличии'} */} 
                {/*    </div> */} 
                {/* )} */} 
              </div>
            </div>

            {/* Информация о товаре */}
            <div className="space-y-1 px-2 flex-grow flex flex-col justify-between">
              <div>
                <h3 className="text-base font-normal line-clamp-2 group-hover:underline mb-1">
                  {truncateText(name?.toLowerCase() || '', 40)}
                </h3>
                {!isWeeklyProduct && desc_short && (
                  <p className="text-xs text-dark line-clamp-2 mb-1">
                    {truncateText(desc_short, 70)}
                  </p>
                )}
              </div>
              <div className="pb-1">
                {price_discount && price && price_discount < price ? (
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-normal">{formatPrice(price_discount)}</span>
                    <span className="line-through text-dark text-sm">{formatPrice(price)}</span>
                  </div>
                ) : (
                  <span className="text-lg font-normal">{formatPrice(price ?? 0)}</span>
                )}
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* Кнопка добавления в корзину */}
      <div className="px-2 pb-2 mt-auto">
        <Button
          onPress={handleAddToCart} // Тип теперь совпадает
          disabled={selectedModelStock <= 0}
          className={`w-full text-white font-normal text-sm py-2.5 rounded-xl transition-all duration-300 ${selectedModelStock > 0 ? 'bg-black hover:bg-gray-800' : 'bg-dark cursor-not-allowed'}`}
        >
          {selectedModelStock > 0 ? 'в корзину' : 'нет в наличии'}
        </Button>
      </div>
    </div>
  );
} 