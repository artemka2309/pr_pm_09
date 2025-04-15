"use client";
import React from 'react';
import { Button } from "@heroui/button";
import { addToast } from '@heroui/react';
import useCartStore from '@/store/cartStore'; 
// import useColorStore from '@/store/colorStore'; // Убираем, т.к. selectedVariant передается в пропсах
import Link from 'next/link';
import { ShoppingBag, ArrowRight } from 'lucide-react'; // Меняем иконку на ShoppingBag и добавляем ArrowRight для кнопки
import { NEXT_PUBLIC_STATIC_URL } from "@/shared/config/api";
import { formatPrice } from '@/shared/lib/formatPrice'; // Добавим форматирование цены для тоста
import type { ProductBase } from '@/shared/types/product'; // Используем базовый тип
import Image from 'next/image';
import { clsx } from 'clsx';

// Обновленный интерфейс для пропсов
interface AddToCartButtonProps {
    product: ProductBase & { 
      variant_slug?: string | null; 
      variant_name?: string | null;
      max_quantity?: number | null;
      image_logo?: string | null; // Добавим для ясности
      slug: string; // Добавим, чтобы точно было
      article: number | string; // Добавим
      price: number; // Добавим
      price_discount?: number | null; // Добавим
    };
    parentCategorySlug: string; // Обязательное поле
    subcategorySlug: string; // Обязательное поле
    className?: string; // Добавляем необязательный className
}

// Типы для стора (можно вынести в shared/types/cart)
interface CartItemInput {
  uniqueId: string;
  id: number | string;
  name: string;
  description?: string | null;
  price: number;
  price_discount?: number | null;
  image: string;
  color?: string | null;
  colorSlug?: string | null;
  parentCategorySlug?: string | null; // Добавляем слаг родителя
  subcategorySlug?: string | null;  // Добавляем слаг подкатегории
  slug: string; // Слаг товара
  quantity: number;
}

interface CartStoreState {
    addToCart: (item: CartItemInput) => void;
    getItemQuantity: (uniqueId: string) => number;
}

const AddToCartFromProductPageButton: React.FC<AddToCartButtonProps> = ({ 
    product, 
    parentCategorySlug, 
    subcategorySlug, 
    className // Получаем className из пропсов
}) => {
    
    const addToCart = useCartStore((state) => (state as CartStoreState).addToCart);
    const getItemQuantity = useCartStore((state) => (state as CartStoreState).getItemQuantity);

    const handleAddToCart = () => {
        if (!product.variant_slug) {
            addToast({ title: 'Ошибка', description: 'Пожалуйста, выберите вариант товара', color: 'danger' });
            return;
        }

        const currentStock = product.max_quantity ?? 0;
        if (currentStock <= 0) {
            addToast({ title: 'Ошибка', description: 'Выбранный вариант закончился', color: 'danger' });
            return;
        }

        const uniqueId = `${product.slug}-${product.variant_slug}`;
        const currentQuantityInCart = getItemQuantity(uniqueId);

        if (currentQuantityInCart < currentStock) {
            const cartItem: CartItemInput = {
                uniqueId,
                id: product.article,
                name: product.name,
                description: null,
                price: product.price,
                price_discount: product.price_discount,
                image: product.image_logo ? `${NEXT_PUBLIC_STATIC_URL}${product.image_logo}` : '/placeholder.png',
                color: product.variant_name,
                colorSlug: product.variant_slug,
                parentCategorySlug: parentCategorySlug,
                subcategorySlug: subcategorySlug,
                slug: product.slug,
                quantity: 1
            };
            addToCart(cartItem);

            addToast({
                title: product.name,
                description: `(${product.variant_name || 'Стандарт'}) добавлен в корзину!`,
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
                description: `Максимальное количество (${currentStock} шт.) уже в корзине`, 
                color: 'danger' 
            });
        }
    };

    const isAvailable = (product.max_quantity ?? 0) > 0;
    const buttonText = !product.variant_slug ? 'выберите вариант' : isAvailable ? 'в корзину' : 'нет в наличии';
    const isDisabled = !product.variant_slug || !isAvailable;

    return (
        <Button 
            size="lg" 
            className={clsx(
                className ? className : "bg-zinc-900 text-white hover:bg-zinc-800 active:bg-zinc-900",
                "w-full transition-colors duration-200 flex items-center justify-center py-3 text-sm font-normal",
                isDisabled && "bg-light-200 text-light-500 cursor-not-allowed"
            )}
            disabled={isDisabled}
            onPress={isDisabled ? undefined : handleAddToCart}
            aria-label={buttonText}
        >
            <ShoppingBag className="mr-2 h-5 w-5" /> 
            {buttonText}
        </Button>
    );
};

export default AddToCartFromProductPageButton; 