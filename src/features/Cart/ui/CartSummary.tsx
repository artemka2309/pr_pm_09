"use client";
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Button, Input, Tooltip } from "@heroui/react"; // Добавил Tooltip
// import { toast } from 'react-hot-toast'; // Убираем старый импорт
import { addToast } from '@heroui/react'; // Импортируем addToast
import useCartStore from '@/store/cartStore';
import { NEXT_PUBLIC_BASE_API_URL_CLIENT, API_URL_GET_PROMOCODE } from "@/shared/config/api";
import OrderModal from '@/features/Order/ui/OrderModal'; // Раскомментируем и проверяем путь
import { motion, AnimatePresence } from 'framer-motion';
import { formatPrice } from '@/shared/lib/formatPrice';
import { Ticket, Info, X, Trash2 } from 'lucide-react'; // Добавил X, Trash2
import type { CartItemType } from './CartItem';

// TODO: Уточнить структуру промокода по API
interface PromocodeData {
  key: string;
  discount: number; // Процент (0.1) или сумма?
  discount_type?: 'percentage' | 'fixed'; // Добавить тип скидки?
  categories_slugs?: string[];
  products_slugs?: string[];
}

interface CartSummaryProps {
  onOrderSuccess?: () => void;
}

// TODO: Вынести логику промокода в кастомный хук usePromoCode()

export default function CartSummary({ onOrderSuccess }: CartSummaryProps): React.ReactElement {
    // --- Состояния (оставляем пока здесь) ---
    const { cartItems, getSelectedItems, /* TODO: Добавить методы в стор */ getTotalPriceBeforeDiscounts, getTotalItemDiscounts } = useCartStore();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [promoCodeInput, setPromoCodeInput] = useState<string>(''); // Отдельное состояние для инпута
    const [appliedPromocode, setAppliedPromocode] = useState<PromocodeData | null>(null);
    const [promoDiscountAmount, setPromoDiscountAmount] = useState<number>(0); // Скидка ТОЛЬКО от промокода
    const [isLoadingPromo, setIsLoadingPromo] = useState<boolean>(false);
    const [itemDiscountsMap, setItemDiscountsMap] = useState<Record<string, number>>({}); // Для детализации
    const [showDiscountDetails, setShowDiscountDetails] = useState<boolean>(false);

    // --- Загрузка промокода из localStorage ---
    useEffect(() => {
        const savedPromoData = localStorage.getItem('promocodeData');
        if (savedPromoData) {
             try {
                 const parsedData = JSON.parse(savedPromoData) as PromocodeData;
                 setAppliedPromocode(parsedData);
                 // Сразу пересчитываем скидку при загрузке
                 // recalculatePromoDiscount(getSelectedItems(), parsedData); 
                 // TODO: Вызвать пересчет после инициализации selectedItems
             } catch (e) { 
                 console.error("Ошибка парсинга promocodeData из localStorage", e); 
                 localStorage.removeItem('promocodeData'); 
             }
        }
        // TODO: Загружать itemDiscountsMap если нужно
    }, []); // Зависимость от getSelectedItems нужна, но вызовет цикл, нужна инициализация

    // --- Пересчет скидки промокода при изменении выбранных товаров или промокода ---
    // TODO: Перенести эту логику в стор или кастомный хук
    const recalculatePromoDiscountCallback = useCallback((items: CartItemType[], promocode: PromocodeData | null) => {
        if (!promocode || !items || items.length === 0) {
            setPromoDiscountAmount(0);
            setItemDiscountsMap({});
            // Не сбрасываем appliedPromocode здесь, даем пользователю удалить вручную
            return 0;
        }

        let totalDiscount = 0;
        const newItemDiscounts: Record<string, number> = {};

        items.forEach(item => {
            if (!item) return; 
            
            const priceToUse = (item.price_discount !== null && item.price_discount < (item.price ?? 0))
                ? item.price_discount
                : (item.price ?? 0);
            let itemPriceBeforePromo = priceToUse * item.quantity;
            let discountForItem = 0;

            // Используем subcategorySlug вместо category
            const isCategoryMatch = promocode.categories_slugs?.includes(item.subcategorySlug || '') ?? true;
            const isProductMatch = promocode.products_slugs?.includes(item.slug || '') ?? true;
            const isApplicable = isCategoryMatch && isProductMatch; // Уточнить логику И/ИЛИ

            if (isApplicable) {
                 // TODO: Уточнить расчет - процент или фикс?
                 if (promocode.discount_type === 'fixed') { 
                      // Если фикс, как распределять по товарам? Пока применяем как процент.
                      discountForItem = itemPriceBeforePromo * (promocode.discount || 0);
                 } else { // По умолчанию процент
                      discountForItem = itemPriceBeforePromo * (promocode.discount || 0);
                 }
                 discountForItem = Math.max(0, discountForItem); // Скидка не может быть < 0
            }

            if (discountForItem > 0) {
                newItemDiscounts[item.uniqueId] = discountForItem;
                totalDiscount += discountForItem;
            }
        });
        
        setPromoDiscountAmount(totalDiscount);
        setItemDiscountsMap(newItemDiscounts);
        // Сохраняем только если скидка > 0?
        // localStorage.setItem('itemDiscountsMap', JSON.stringify(newItemDiscounts));
        return totalDiscount;
    }, [setPromoDiscountAmount, setItemDiscountsMap]);

    // Мемоизируем selectedItems
    const selectedItems = useMemo(() => {
        return cartItems.filter(item => item.isSelected && item.quantity > 0);
        // Или, если getSelectedItems делает что-то сложнее:
        // return getSelectedItems(); // Нужно убедиться, что getSelectedItems стабильна
    }, [cartItems]); // Зависимость от cartItems

    // Вызываем пересчет, когда меняются selectedItems или appliedPromocode
    // const selectedItems = getSelectedItems(); // <-- Убираем старое объявление

    useEffect(() => {
        // Пересчитываем скидку, используя мемоизированный selectedItems
        recalculatePromoDiscountCallback(selectedItems, appliedPromocode);
        // Зависим от selectedItems и примененного промокода
    }, [selectedItems, appliedPromocode, recalculatePromoDiscountCallback]);

    // --- Обработчики промокода ---
    const handleApplyPromoCode = useCallback(async () => {
        const codeToApply = promoCodeInput.trim().toUpperCase();
        if (!codeToApply) {
            // Используем addToast
            addToast({ title: 'Ошибка', description: "Введите промокод", color: 'danger', timeout: 2000 });
            return;
        }
        setIsLoadingPromo(true);
        try {
            const apiUrl = `${NEXT_PUBLIC_BASE_API_URL_CLIENT}${API_URL_GET_PROMOCODE}`;
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key: codeToApply }),
            });

            if (!response.ok) {
                let errorMsg = `Промокод не найден или недействителен (${response.status})`;
                try { const errorData = await response.json(); errorMsg = errorData.message || errorData.error || errorMsg; } catch (e) { /* ignore */ }
                // Используем addToast
                addToast({ title: 'Ошибка', description: errorMsg, color: 'danger', timeout: 2000 });
                setAppliedPromocode(null);
                setPromoDiscountAmount(0);
                localStorage.removeItem('promocodeData');
                return;
            }

            const data = await response.json();
            if (data.promocode) {
                const promocodeData = data.promocode as PromocodeData;
                const calculatedDiscount = recalculatePromoDiscountCallback(selectedItems, promocodeData);

                if (calculatedDiscount > 0) {
                    setAppliedPromocode(promocodeData);
                    setPromoCodeInput('');
                    localStorage.setItem('promocodeData', JSON.stringify(promocodeData));
                    // Используем addToast
                    addToast({ title: 'Успешно', description: `Промокод ${promocodeData.key} применен`, color: 'success', timeout: 2000 });
                } else {
                    // Используем addToast
                    addToast({ title: 'Ошибка', description: 'Промокод не применим к выбранным товарам', color: 'danger', timeout: 2000 });
                    setAppliedPromocode(null);
                    localStorage.removeItem('promocodeData');
                }
            } else {
                // Используем addToast
                addToast({ title: 'Ошибка', description: 'Некорректный ответ сервера', color: 'danger', timeout: 2000 });
                setAppliedPromocode(null);
                localStorage.removeItem('promocodeData');
            }
        } catch (error) {
            console.error("Ошибка при проверке промокода:", error);
            // Используем addToast
            addToast({ title: 'Ошибка', description: 'Не удалось проверить промокод.', color: 'danger', timeout: 2000 });
        } finally {
            setIsLoadingPromo(false);
        }
    }, [promoCodeInput, selectedItems, recalculatePromoDiscountCallback]);

    const handleResetPromoCode = useCallback(() => {
        setPromoCodeInput('');
        setAppliedPromocode(null);
        setPromoDiscountAmount(0);
        setItemDiscountsMap({});
        localStorage.removeItem('promocodeData');
        // Используем addToast
        addToast({ title: 'Промокод удален', color: 'default', timeout: 2000 }); // Используем цвет default
    }, []);

    // --- Расчет итоговых сумм --- 
    // TODO: Получать эти значения из стора, который учтет и скидки на товары, и промокод
    const totalPriceBeforeDiscounts = useMemo(() => {
        // Временный расчет, пока нет в сторе
        return selectedItems.reduce((total, item) => total + (item?.price ?? 0) * (item?.quantity ?? 0), 0);
    }, [selectedItems]);
    
    const totalItemDiscounts = useMemo(() => {
         // Временный расчет, пока нет в сторе
         return selectedItems.reduce((total, item) => {
             const price = item?.price ?? 0;
             const discountPrice = item?.price_discount;
             const quantity = item?.quantity ?? 0;
             if (discountPrice !== null && discountPrice < price) {
                 return total + (price - discountPrice) * quantity;
             }
             return total;
         }, 0);
    }, [selectedItems]);

    const finalPrice = Math.max(0, totalPriceBeforeDiscounts - totalItemDiscounts - promoDiscountAmount);
    const totalItems = selectedItems.reduce((total, item) => total + (item?.quantity || 0), 0);

    // --- Обработчик кнопки оформления ---
    const handleCheckout = () => {
        if (selectedItems.length === 0) {
             addToast({ title: 'Ошибка', description: "Выберите товары для оформления", color: 'danger', timeout: 2000 });
             return;
        }
        setIsModalOpen(true);
    };

    // --- Обработчик успешного заказа из модалки ---
    const handleOrderSuccessAndClose = () => {
         setIsModalOpen(false);
         handleResetPromoCode();
         if (onOrderSuccess) {
             onOrderSuccess(); 
         }
    };

    return (
        <div className="bg-black rounded-2xl p-6 text-light sticky top-24"> {/* Добавил sticky */} 
            <h3 className="text-xl font-medium mb-6">Итог заказа</h3>

            <div className="space-y-3 mb-5 text-sm">
                <div className="flex justify-between">
                    <span>Товары ({totalItems} шт.)</span>
                    <span>{formatPrice(totalPriceBeforeDiscounts)}</span>
                </div>
                {/* Добавляем анимацию и text-light */} 
                <AnimatePresence>
                    {totalItemDiscounts > 0 && (
                        <motion.div
                            key="item-discount"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="flex justify-between text-light overflow-hidden"
                        >
                            <span>Скидка на товары</span>
                            <span>- {formatPrice(totalItemDiscounts)}</span>
                        </motion.div>
                    )}
                </AnimatePresence>
                <AnimatePresence>
                    {appliedPromocode && promoDiscountAmount > 0 && (
                        <motion.div
                            key="promo-discount"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="flex justify-between text-light items-center overflow-hidden"
                        >
                            <span className="flex items-center">
                                Промокод <code className="bg-gray text-light text-xs px-1 py-0.5 rounded mx-1.5">{appliedPromocode.key}</code>
                            </span>
                            <span>- {formatPrice(promoDiscountAmount)}</span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div> {/* Закрывающий div для space-y-3 */} 

            {/* Разделитель (отступ) */} 
            <div className="h-px bg-gray my-5"></div> 

            <div className="flex justify-between items-center mb-6">
                <span className="text-lg font-medium">Итого:</span>
                <span className="text-xl font-bold">{formatPrice(finalPrice)}</span>
            </div>

            {/* Секция Промокода */} 
            <div className="mb-6">
                {!appliedPromocode ? (
                    <div className="flex gap-2 items-start">
                        <Input
                            label="Промокод"
                            placeholder="Введите промокод"
                            variant="bordered"
                            value={promoCodeInput}
                            onValueChange={setPromoCodeInput}
                            disabled={isLoadingPromo}
                            className="flex-grow"
                            classNames={{ 
                                inputWrapper: "bg-light focus-within:border-blue border-transparent",
                                label: "text-light", 
                                input: "text-black"
                            }}
                        />
                        <Button 
                            onPress={handleApplyPromoCode}
                            isLoading={isLoadingPromo}
                            variant="solid"
                            className="mt-0.5 bg-light text-black hover:opacity-90 px-6"
                        >
                            Применить
                        </Button>
                    </div>
                ) : (
                    <div className="flex justify-between items-center bg-gray p-2 rounded-lg">
                        {/* Используем text-light */} 
                        <p className="text-sm text-light flex items-center gap-1">
                            <Ticket size={16} />
                            <span>Промокод &quot;{appliedPromocode.key}&quot; применен</span>
                        </p>
                        {/* Убираем Tooltip */} 
                         <Button 
                            isIconOnly 
                            size="sm" 
                            variant="light"
                            color="danger"
                            onPress={handleResetPromoCode}
                            aria-label="Удалить промокод"
                        >
                            <X size={18} />
                        </Button>
                    </div>
                )}
            </div>

            <Button 
                fullWidth 
                size="lg" 
                onPress={handleCheckout}
                isDisabled={selectedItems.length === 0}
                className="bg-white text-black hover:opacity-90 disabled:bg-light disabled:text-dark disabled:cursor-not-allowed"
            >
                Оформить заказ
            </Button>

            {/* Раскомментируем и настраиваем модальное окно */} 
             <OrderModal 
                 isOpen={isModalOpen}
                 onOpenChange={setIsModalOpen} // Передаем сеттер состояния
                 discountAmount={promoDiscountAmount} // Используем скидку от промокода
                 finalPrice={finalPrice} // Передаем финальную цену
                 onOrderSuccess={handleOrderSuccessAndClose} // Передаем наш обработчик
             />
        </div>
    );
}