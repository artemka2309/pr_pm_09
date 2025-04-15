"use client";
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Checkbox, Button } from "@heroui/react";
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, AlertCircle, Plus, Minus } from 'lucide-react';
import { formatPrice } from '@/shared/lib/formatPrice';
import { fetchProductQuantityBySlugAndColor } from '@/shared/api/products';
import useCartStore from '@/store/cartStore';

// Интерфейс товара в корзине
export interface CartItemType {
  uniqueId: string;
  name?: string;
  description?: string;
  image?: string;
  price?: number;
  price_discount?: number | null;
  slug?: string;
  color?: string;
  colorSlug?: string;
  parentCategorySlug?: string;
  subcategorySlug?: string;
  quantity: number;
  isSelected: boolean;
  stock?: number | null;
}

interface CartItemProps {
  item: CartItemType;
}

// Компонент для отображения цены товара
const PriceDisplay = ({ regularPrice, discountPrice, quantity }: { 
  regularPrice: number, 
  discountPrice: number | null | undefined, 
  quantity: number 
}) => {
  const hasDiscount = discountPrice !== null && discountPrice !== undefined && discountPrice < regularPrice;
  
  return (
    <>
      {hasDiscount ? (
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-normal">{formatPrice(discountPrice! * quantity)}</span>
          <span className="line-through text-dark text-sm">{formatPrice(regularPrice * quantity)}</span>
        </div>
      ) : (
        <span className="text-lg font-normal">{formatPrice(regularPrice * quantity)}</span>
      )}
    </>
  );
};

// Компонент для управления количеством товара
const QuantityControl = ({ 
  quantity, 
  onDecrease, 
  onIncrease,
  canDecrease,
  canIncrease 
}: { 
  quantity: number, 
  onDecrease: () => void, 
  onIncrease: () => void,
  canDecrease: boolean,
  canIncrease: boolean
}) => (
  <div className="flex items-center bg-white rounded-xl p-0.5">
    <Button
      isIconOnly
      size="sm"
      onPress={onDecrease}
      isDisabled={!canDecrease}
      aria-label="Уменьшить количество"
      className="text-dark hover:bg-light disabled:opacity-50"
    >
      <Minus size={16} />
    </Button>
    <span className="mx-2 text-sm font-medium w-6 text-center text-black">{quantity}</span>
    <Button
      isIconOnly
      size="sm"
      onPress={onIncrease}
      isDisabled={!canIncrease}
      aria-label="Увеличить количество"
      className="text-dark hover:bg-light disabled:opacity-50"
    >
      <Plus size={16} />
    </Button>
  </div>
);

export default function CartItem({ item }: CartItemProps): React.ReactElement | null {
  // Состояние
  const [imageError, setImageError] = useState<boolean>(false);
  const [stockError, setStockError] = useState<boolean>(false);
  const [currentStock, setCurrentStock] = useState<number>(item.stock ?? 0);
  const [isLoadingStock, setIsLoadingStock] = useState<boolean>(!item.stock);

  const { updateQuantity, removeFromCart, updateSelection } = useCartStore();

  // Получение данных о наличии товара
  const fetchItemStock = useCallback(async () => {
    if (!item?.slug || !item?.colorSlug) {
      console.error("Ошибка: Отсутствует slug или colorSlug для получения стока");
      setStockError(true);
      setIsLoadingStock(false);
      return;
    }
    
    setIsLoadingStock(true);
    setStockError(false);
    
    try {
      const quantity = await fetchProductQuantityBySlugAndColor(item.slug, item.colorSlug);
      
      if (quantity !== null) {
        setCurrentStock(quantity);
        
        if (item.quantity > quantity) {
          updateQuantity(item.uniqueId, quantity);
        }
        
        if (quantity === 0 && item.isSelected) {
          updateSelection(item.uniqueId, false);
        }
      } else {
        throw new Error("API вернул null для количества товара");
      }
    } catch (error) {
      console.error(`Ошибка при получении данных о товаре (${item.slug}, ${item.colorSlug}):`, error);
      setStockError(true);
      setCurrentStock(0);
    } finally {
      setIsLoadingStock(false);
    }
  }, [item?.slug, item?.colorSlug, item?.uniqueId, item?.isSelected, item?.quantity, updateQuantity, updateSelection]);

  // Инициализация наличия товара
  useEffect(() => {
    if (item.stock === undefined || item.stock === null) {
      fetchItemStock();
    } else {
      setCurrentStock(item.stock);
      
      if (item.quantity > item.stock) {
        updateQuantity(item.uniqueId, item.stock);
      }
    }
  }, [item.slug, item.colorSlug, item.stock, fetchItemStock, item.quantity, item.uniqueId, updateQuantity]);

  // Обработчики действий
  const handleRemoveItem = useCallback(() => {
    removeFromCart(item.uniqueId);
  }, [removeFromCart, item.uniqueId]);

  const handleToggleSelection = useCallback(() => {
    if (currentStock > 0 || isLoadingStock) { 
      updateSelection(item.uniqueId, !item.isSelected);
    }
  }, [currentStock, isLoadingStock, updateSelection, item.uniqueId, item.isSelected]);

  const handleQuantityChange = useCallback((change: number) => {
    const newQuantity = item.quantity + change;
    if (newQuantity >= 1 && newQuantity <= currentStock) {
      updateQuantity(item.uniqueId, newQuantity);
    }
  }, [item.quantity, currentStock, updateQuantity, item.uniqueId]);

  // Мемоизированные значения
  const fallbackImageUrl = '/img/catalog-img/no_image.png';
  const imageUrl = useMemo(() => 
    (item?.image && !imageError) ? item.image : fallbackImageUrl, 
    [item?.image, imageError]
  );
  
  const productUrl = useMemo(() => 
    `/category/${item.parentCategorySlug || 'unknown'}/${item.subcategorySlug || 'unknown'}/${item.slug || 'unknown'}?color=${item.colorSlug || 'standard'}`, 
    [item.parentCategorySlug, item.subcategorySlug, item.slug, item.colorSlug]
  );
  
  const isOutOfStock = !isLoadingStock && currentStock === 0;
  const canDecrease = item.quantity > 1;
  const canIncrease = item.quantity < currentStock;
  const regularPrice = item.price ?? 0;
  const discountPrice = item.price_discount;

  // Состояния загрузки и ошибки
  if (isLoadingStock) {
    return (
      <div className="bg-light rounded-lg p-4 mb-3 flex items-center gap-4 animate-pulse">
        <div className="w-6 h-6 bg-skeleton rounded"></div>
        <div className="w-20 h-20 md:w-24 md:h-24 bg-skeleton rounded-md flex-shrink-0"></div>
        <div className="flex-grow space-y-2">
          <div className="h-4 bg-skeleton rounded w-3/4"></div>
          <div className="h-3 bg-skeleton rounded w-1/2"></div>
          <div className="h-3 bg-skeleton rounded w-1/3"></div>
        </div>
        <div className="w-24 h-8 bg-skeleton rounded-md"></div>
        <div className="w-20 h-5 bg-skeleton rounded"></div>
        <div className="w-8 h-8 bg-skeleton rounded-md"></div>
      </div>
    );
  }

  if (stockError) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-light rounded-lg p-4 mb-3 flex items-center justify-between gap-4 border border-red"
      >
        <div className='flex items-center gap-3'>
          <AlertCircle size={24} className="text-red flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-black">Не удалось проверить наличие</p>
            <p className="text-xs text-dark">Товар: {item.name}</p>
          </div>
        </div>
        <Button 
          isIconOnly 
          variant="light" 
          color="danger" 
          size="sm"
          onPress={handleRemoveItem}
          aria-label="Удалить товар"
        >
          <Trash2 size={18} />
        </Button>
      </motion.div>
    );
  }

  // Основной рендер карточки товара
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={`bg-light rounded-2xl p-3 pr-14 mb-3 relative border-l-4 overflow-hidden 
        ${isOutOfStock ? 'opacity-60' : ''} 
        ${item.isSelected ? 'border-black' : 'border-transparent'}`}
    >
      {/* Десктопная версия */}
      <div className="flex relative items-stretch gap-3">
        {/* Изображение */}
        <Link href={productUrl} className="flex-shrink-0 block w-24 sm:w-28 md:w-32 aspect-square">
          <div className="w-full h-full relative rounded-xl overflow-hidden bg-white">
            <Image
              src={imageUrl}
              alt={item.name || 'Изображение товара'}
              fill
              sizes="(max-width: 640px) 6rem, (max-width: 768px) 7rem, 8rem"
              style={{ objectFit: 'cover' }}
              onError={() => setImageError(true)}
              className={`transition-opacity duration-200 ${imageError ? 'opacity-50' : 'opacity-100'}`}
            />
          </div>
        </Link>
        
        {/* Информация и контролы */}
        <div className="flex flex-col sm:flex-row sm:justify-between w-full gap-3">
          {/* Основная информация */}
          <div className="flex flex-col pt-1">
            <Link href={productUrl} className="group">
              <h3 className="text-base font-normal line-clamp-2 group-hover:underline">
                {item.name?.toLowerCase()}
              </h3>
            </Link>
            <p className="text-xs text-dark mt-1 line-clamp-1">Модель: {item.color}</p>
            {isOutOfStock ? (
              <p className="text-xs text-red mt-1">Нет в наличии</p>
            ) : (
              <p className="text-xs text-dark mt-1">В наличии: {currentStock} шт.</p>
            )}
          </div>
          
          {/* Десктопные контролы количества и цена - видны только на sm+ */}
          <div className={`hidden sm:flex sm:flex-row sm:items-center sm:gap-5 sm:pr-10 sm:self-center ${isOutOfStock ? 'invisible' : ''}`}>
            <QuantityControl 
              quantity={item.quantity}
              onDecrease={() => handleQuantityChange(-1)}
              onIncrease={() => handleQuantityChange(1)}
              canDecrease={canDecrease}
              canIncrease={canIncrease}
            />
            
            <div className="text-right">
              <PriceDisplay 
                regularPrice={regularPrice} 
                discountPrice={discountPrice} 
                quantity={item.quantity}
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Мобильные контролы - видны только до sm */}
      {!isOutOfStock && (
        <div className="flex sm:hidden justify-between items-center pt-3 mt-2 border-t border-gray-100">
          <div className="text-left">
            <PriceDisplay 
              regularPrice={regularPrice} 
              discountPrice={discountPrice} 
              quantity={item.quantity}
            />
          </div>
          
          <div className="flex items-center gap-2">
            <QuantityControl 
              quantity={item.quantity}
              onDecrease={() => handleQuantityChange(-1)}
              onIncrease={() => handleQuantityChange(1)}
              canDecrease={canDecrease}
              canIncrease={canIncrease}
            />
          </div>
        </div>
      )}

      {/* Чекбокс выбора */}
      <div className="absolute top-3 right-2 z-10">
        <Checkbox
          isSelected={item.isSelected}
          onChange={handleToggleSelection}
          size="lg"
          isDisabled={isOutOfStock}
          aria-label={`Выбрать ${item.name}`}
          classNames={{ 
            wrapper: "after:bg-black after:text-white text-white" 
          }}
        />
      </div>
      
      {/* Кнопка удаления - теперь видна всегда */}
      <div className="absolute bottom-3 right-3 z-10">
        <Button 
          isIconOnly 
          variant="light" 
          color="danger" 
          size="sm"
          onPress={handleRemoveItem}
          aria-label="Удалить товар"
        >
          <Trash2 size={18} />
        </Button>
      </div>
    </motion.div>
  );
} 