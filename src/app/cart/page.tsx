"use client";
import React, { useState, useEffect, useMemo } from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import useCartStore from '@/store/cartStore';
import useViewedProductsStore from '../../store/viewedProductsStore';
import CartItem from '@/features/Cart/ui/CartItem';
import CartSummary from '@/features/Cart/ui/CartSummary';
import ViewedProducts from '@/widgets/ViewedProducts/ui/ViewedProducts';
import OrderList from '@/features/Order/ui/OrderList';
import { Checkbox } from "@heroui/react";
import { addToast } from '@heroui/react';
import { NEXT_PUBLIC_BASE_API_URL_CLIENT /*, API_URL_CLEAR_ORDERS */ } from "@/shared/config/api"; // Закомментировал API_URL_CLEAR_ORDERS, т.к. его нет
import CartFinalMobile from '@/features/Cart/ui/CartFinalMobile';

const getTovarWord = (count) => {
  if (count % 10 === 1 && count % 100 !== 11) {
    return 'товар';
  } else if ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100)) {
    return 'товара';
  } else {
    return 'товаров';
  }
};

export default function CartPageClient() {
  const { cartItems, updateQuantity, removeFromCart, updateSelection, selectAllItems, checkAndRemoveInactiveItems } = useCartStore();
  const [refresh, setRefresh] = useState(false);
  const [loading, setLoading] = useState(true);
  const viewedProducts = useViewedProductsStore((state) => state.viewedProducts);
  const clearViewedProducts = useViewedProductsStore((state) => state.clearViewedProducts);
  const removeViewedItem = useViewedProductsStore((state) => state.removeViewedProduct);
  const [refreshOrders, setRefreshOrders] = useState<boolean>(false);

  useEffect(() => {
    const initCart = async () => {
      await checkAndRemoveInactiveItems();
      setLoading(false);
    };
    initCart();
  }, [checkAndRemoveInactiveItems]);

  const handleSelectAll = (event) => {
    selectAllItems(event.target.checked);
  };

  const isAllSelected = cartItems.length > 0 && cartItems.every(item => item.isSelected);
  const isCheckboxDisabled = cartItems.length === 0;

  const handleOrderSuccess = () => {
    addToast({ title: "Успешно", description: "Заявка успешно создана!", color: 'success', timeout: 2000 });
    setRefreshOrders(prev => !prev);
  };

  const clearAllOrders = async () => {
    try {
      // TODO: Добавить константу API_URL_CLEAR_ORDERS в shared/config/api
      await fetch(`${NEXT_PUBLIC_BASE_API_URL_CLIENT}orders/clear`, { // Временный хардкод пути
        method: 'DELETE',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      setRefresh(!refresh);
    } catch (error) {
      console.error('Ошибка при очистке заказов:', error);
    }
  };

  return (
    <main className="max-w-screen-xl mx-auto px-0 lg:px-4 min-h-screen flex flex-col relative">
      <div className="flex-grow">
        <div className="flex flex-col lg:flex-row justify-between">
          <div className="lg:w-7/12 xl:w-8/12 flex flex-col lg:pr-16 h-full pt-8 px-4 lg:px-0">
            <div className="flex justify-between items-center mb-8">
              <div className="flex flex-col items-start lg:flex-row lg:items-baseline lg:space-x-3">
                <h1 className="text-4xl md:text-6xl font-normal tracking-tight">корзина</h1>
                <span className="text-sm md:text-base text-gray-600 mt-1 lg:mt-0">{cartItems.length} {getTovarWord(cartItems.length)}</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-base text-gray-600">выбрать все</span>
                <Checkbox
                  size="lg"
                  isSelected={isAllSelected}
                  onChange={handleSelectAll}
                  isDisabled={isCheckboxDisabled}
                  classNames={{ 
                      wrapper: "after:bg-black after:text-white text-white" 
                  }}
                />
              </div>
            </div>

            {loading ? (
              Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="flex items-center space-x-4 border-b border-light py-4">
                  <div className="w-24 h-24 bg-skeleton rounded-xl flex-shrink-0"></div>
                  <div className="flex-grow">
                    <div className="w-3/4 h-5 bg-skeleton rounded mb-2"></div>
                    <div className="w-1/2 h-4 bg-skeleton rounded mb-2"></div>
                    <div className="w-1/3 h-4 bg-skeleton rounded"></div>
                  </div>
                </div>
              ))
            ) : cartItems.length === 0 ? (
              <div className="text-center py-16 items-center bg-light rounded-xl">
                <h2 className="text-xl font-normal mb-2">корзина пуста</h2>
                <p className="text-gray-600">добавьте товары в корзину, чтобы они появились здесь</p>
              </div>
            ) : (
              cartItems.map((item) => (
                <div key={item.uniqueId}>
                  <CartItem item={item} />
                </div>
              ))
            )}
          </div>

          <div className="hidden lg:block lg:w-5/12 xl:w-4/12 lg:pl-6 sticky top-24">
            <CartSummary onOrderSuccess={handleOrderSuccess} />
          </div>
        </div>
      </div>
      <div className="lg:hidden sticky bottom-0 z-10 mt-8">
          <CartFinalMobile onOrderSuccess={handleOrderSuccess} />
      </div>
      <div className="px-4">
        <div className="mt-8">
          <ViewedProducts />
        </div>
        <div className="mt-8">
          <OrderList refresh={refreshOrders} />
        </div>
      </div>
    </main>
  );
}