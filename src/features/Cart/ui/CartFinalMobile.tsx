"use client";
import React, { useState, useEffect, useMemo } from "react";
import { Button, Input, useDisclosure } from "@heroui/react";
import { toast } from 'react-hot-toast';
import useCartStore from '../../../store/cartStore'; // Обновленный путь
import OrderModal from '../../Order/ui/OrderModal'; // Обновленный путь
import { motion, AnimatePresence } from 'framer-motion';
import { formatPrice } from '../../../shared/lib/formatPrice'; // Обновленный путь
import { X, Ticket } from 'lucide-react';

export default function CartFinalMobile({ onOrderSuccess }) {
    const { cartItems, getSelectedItems, getTotalPriceWithDiscount } = useCartStore();
    const { isOpen, onOpen, onOpenChange } = useDisclosure();
    const [promoCode, setPromoCode] = useState('');
    const [discountAmount, setDiscountAmount] = useState(0);
    const [appliedPromocode, setAppliedPromocode] = useState(null);
    const [showPromoInput, setShowPromoInput] = useState(false);
    const [showDiscountDetails, setShowDiscountDetails] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [itemDiscounts, setItemDiscounts] = useState({});
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (!isMounted) return;

        const savedDiscount = localStorage.getItem('discountAmount');
        const savedPromoCode = localStorage.getItem('promoCode');
        const savedPromoData = localStorage.getItem('promocodeData');
        const savedItemDiscounts = localStorage.getItem('itemDiscounts');

        if (savedDiscount) setDiscountAmount(parseFloat(savedDiscount));
        if (savedPromoCode) setPromoCode(savedPromoCode);
        if (savedPromoData) setAppliedPromocode(JSON.parse(savedPromoData));
        if (savedItemDiscounts) setItemDiscounts(JSON.parse(savedItemDiscounts));
    }, [isMounted]);

    const calculateItemDiscount = (item, promocode) => {
        if (!promocode) return 0;

        const isEligible =
            promocode.categories_slugs?.includes(item.category) ||
            promocode.products_slugs?.includes(item.slug);

        if (!isEligible) return 0;

        return promocode.discount * item.quantity;
    };

    const calculateTotalDiscount = (items, promocode) => {
        if (!promocode) return 0;

        const newItemDiscounts = {};
        let totalDiscount = 0;

        items.forEach(item => {
            const itemDiscount = calculateItemDiscount(item, promocode);
            if (itemDiscount > 0) {
                newItemDiscounts[item.uniqueId] = itemDiscount;
                totalDiscount += itemDiscount;
            }
        });

        setItemDiscounts(newItemDiscounts);
        localStorage.setItem('itemDiscounts', JSON.stringify(newItemDiscounts));

        return totalDiscount;
    };

    const handleApplyPromoCode = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_API_URL_CLIENT}${process.env.NEXT_PUBLIC_GET_PROMOCODE}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ key: promoCode.toUpperCase() }),
            });

            if (!response.ok) {
                throw new Error(`Ошибка при получении промокода: ${response.status}`);
            }

            const data = await response.json();

            if (data.promocode) {
                const selectedItems = getSelectedItems();
                const calculatedDiscount = calculateTotalDiscount(selectedItems, data.promocode);

                if (calculatedDiscount > 0) {
                    setDiscountAmount(calculatedDiscount);
                    setAppliedPromocode(data.promocode);
                    setShowDiscountDetails(true);
                    localStorage.setItem('discountAmount', calculatedDiscount.toString());
                    localStorage.setItem('promoCode', promoCode.toUpperCase());
                    localStorage.setItem('promocodeData', JSON.stringify(data.promocode));
                    toast.success(`промокод применен: скидка ${formatPrice(calculatedDiscount)}`);
                } else {
                    toast.error('промокод не может быть применен к выбранным товарам');
                    handleResetPromoCode();
                }
            } else {
                toast.error('промокод недействителен');
                handleResetPromoCode();
            }
        } catch (error) {
            console.error(error);
            toast.error('ошибка при проверке промокода');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPromoCode = () => {
        setPromoCode('');
        setDiscountAmount(0);
        setAppliedPromocode(null);
        setItemDiscounts({});
        setShowDiscountDetails(false);
        localStorage.removeItem('discountAmount');
        localStorage.removeItem('promoCode');
        localStorage.removeItem('promocodeData');
        localStorage.removeItem('itemDiscounts');
    };

    const selectedItems = useMemo(() => {
        if (!isMounted) return [];
        return cartItems.filter(item => item.isSelected && item.quantity > 0);
    }, [cartItems, isMounted]);

    const totalItems = selectedItems.reduce((total, item) => total + item.quantity, 0);
    const totalPrice = isMounted ? getTotalPriceWithDiscount() : 0;

    useEffect(() => {
        if (appliedPromocode && isMounted) {
            const newDiscount = calculateTotalDiscount(selectedItems, appliedPromocode);
            setDiscountAmount(newDiscount);
            localStorage.setItem('discountAmount', newDiscount.toString());
        }
    }, [selectedItems, appliedPromocode, isMounted]);

    const finalPrice = totalPrice - discountAmount;

    const handleOrderSuccessAndClose = () => {
        handleResetPromoCode();
        if (onOrderSuccess) {
             onOrderSuccess();
         }
    };

    const handleCheckout = () => {
        if (finalPrice <= 0 && discountAmount <= 0 ) {
            toast.error("Невозможно оформить заказ с нулевой стоимостью");
        } else {
            onOpen();
        }
    };

    return (
        <div className="bg-black text-white p-4 transition-all duration-300">
            <div className="text-base">
                <div className="flex flex-col space-y-3 pb-3 justify-between">
                    <motion.button
                        className="flex items-center space-x-2 text-sm"
                        onClick={() => {
                            setShowPromoInput(!showPromoInput);
                            if (discountAmount > 0) {
                                setShowDiscountDetails(!showDiscountDetails);
                            }
                        }}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                    >
                        <Ticket size={16} className="text-dark" />
                        <span className="text-light">{showPromoInput ? 'скрыть промокод' : 'ввести промокод'}</span>
                        
                        {discountAmount > 0 && (
                            <div className="ml-auto flex items-center text-sm">
                                <span className="text-dark">скидка:</span>
                                <span className="text-white font-medium ml-1">{formatPrice(discountAmount)}</span>
                            </div>
                        )}
                    </motion.button>

                    <AnimatePresence>
                        {showPromoInput && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                className="overflow-hidden"
                            >
                                <div className="flex space-x-2 mt-2">
                                    <Input
                                        className="bg-gray border-none text-white"
                                        placeholder="введите промокод"
                                        value={promoCode}
                                        onChange={(e) => setPromoCode(e.target.value)}
                                        isClearable
                                        onClear={handleResetPromoCode}
                                    />
                                    <Button
                                        className="bg-white text-black font-medium rounded-lg transition-all duration-200"
                                        onPress={handleApplyPromoCode}
                                        isLoading={isLoading}
                                        disabled={isLoading}
                                    >
                                        {isLoading ? 'проверка...' : 'применить'}
                                    </Button>
                                </div>

                                {showDiscountDetails && discountAmount > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="mt-3 space-y-1 text-sm"
                                    >
                                        {selectedItems.map(item => (
                                            itemDiscounts[item.uniqueId] > 0 && (
                                                <div key={item.uniqueId} className="flex justify-between">
                                                    <p className="text-dark truncate max-w-[60%]">скидка на {item.name.toLowerCase()}</p>
                                                    <p className="text-white">-{formatPrice(itemDiscounts[item.uniqueId])}</p>
                                                </div>
                                            )
                                        ))}
                                    </motion.div>
                                )}

                                <p className="text-dark text-xs mt-3">
                                    * промокоды на скидку ищите в нашем telegram канале:
                                    <a href="https://t.me/PandaWear_22" className="text-white ml-1 underline">pandawear_22</a>
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <Button
                className={`w-full text-sm py-6 rounded-lg transition-all duration-300 ${!isMounted || (finalPrice <= 0 && discountAmount <= 0) ? 'bg-gray text-light' : 'bg-white text-black hover:bg-light'}`}
                onPress={handleCheckout}
                isDisabled={!isMounted || (finalPrice <= 0 && discountAmount <= 0)}
            >
                {(!isMounted || (finalPrice <= 0 && discountAmount <= 0)) ? 'выберите товар' : (
                    <div className="flex justify-between w-full items-center">
                        <div className="flex flex-col items-start">
                            <span className="text-xs text-dark">итого</span>
                            <span className="text-sm">{totalItems} шт.</span>
                        </div>
                        <span className="font-medium">оформить заявку</span>
                        <span className="font-medium">{formatPrice(finalPrice)}</span>
                    </div>
                )}
            </Button>
            <OrderModal
                isOpen={isOpen}
                onOpenChange={onOpenChange}
                discountAmount={discountAmount}
                finalPrice={finalPrice}
                onOrderSuccess={handleOrderSuccessAndClose}
            />
        </div>
    );
} 