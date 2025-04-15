"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from "next/link";
import Image from 'next/image';
import { Button } from "@heroui/react";
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatPrice } from '@/shared/lib/formatPrice';
import useViewedProductsStore from '@/store/viewedProductsStore';
import { VIEWED_PRODUCTS_STORAGE_KEY } from '@/shared/config/constants';
import ProductCard from '@/entities/Product/ui/ProductCard';

// Интерфейс для пропсов компонента
interface ViewedProductsProps {
    currentProductId?: number | string; // ID текущего товара, чтобы его не показывать
}

const ViewedProducts: React.FC<ViewedProductsProps> = ({ currentProductId }) => {
    const { viewedProducts, clearViewedProducts } = useViewedProductsStore(); 
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [canScrollPrev, setCanScrollPrev] = useState(false);
    const [canScrollNext, setCanScrollNext] = useState(false);
    const [showArrows, setShowArrows] = useState(false);
    
    // Фильтруем товары, исключая текущий
    const filteredProducts = viewedProducts
        .filter(product => product.id !== currentProductId); 

    // Функция для проверки возможности скролла
    const checkScrollButtons = () => {
        const container = scrollContainerRef.current;
        if (!container) return;
        const maxScrollLeft = container.scrollWidth - container.clientWidth;
        setCanScrollPrev(container.scrollLeft > 5);
        setCanScrollNext(container.scrollLeft < maxScrollLeft - 5);
        
        // Показываем стрелки, если есть возможность скролла
        setShowArrows(maxScrollLeft > 5);
    };

    // Проверяем кнопки при монтировании и изменении товаров
    useEffect(() => {
        const timer = setTimeout(checkScrollButtons, 100);
        return () => clearTimeout(timer);
    }, [filteredProducts]);

    // Обработчики для стрелок навигации
    const handleScroll = (direction: 'prev' | 'next') => {
        const container = scrollContainerRef.current;
        if (!container) return;
        
        // Определяем размер элемента для скролла, основываясь на ширине первого элемента
        const items = container.querySelectorAll('.product-item');
        let scrollAmount = 0;
        
        if (items.length > 0) {
            // Если есть элементы, используем ширину + margin первого элемента
            const firstItem = items[0] as HTMLElement;
            const itemWidth = firstItem.offsetWidth;
            const itemMargin = 8; // Соответствует gap-2 (8px)
            scrollAmount = (itemWidth + itemMargin) * (direction === 'next' ? 1 : -1);
        } else {
            // Запасной вариант - скролл на 80% ширины контейнера
            scrollAmount = container.clientWidth * 0.8 * (direction === 'next' ? 1 : -1);
        }
        
        container.scrollBy({
            left: scrollAmount,
            behavior: 'smooth'
        });
        
        // Проверяем состояние кнопок после анимации
        setTimeout(checkScrollButtons, 350);
    };

    // Возвращаем null, если нет товаров для отображения
    if (filteredProducts.length === 0) {
        return null;
    }

    return (
        <section className="py-16">
            <div className="container mx-auto max-w-screen-xl relative">
                {/* Заголовок и кнопка очистки */}
                <div className="flex flex-col sm:flex-row justify-between items-start mb-6"> 
                    <div className="flex flex-col text-left items-start mb-4 sm:mb-0">
                        <span className="text-xs font-medium tracking-widest uppercase text-dark mb-3">
                            вы недавно смотрели
                        </span>
                        <h2 className="text-4xl md:text-5xl font-normal tracking-tight">
                            просмотренные товары
                        </h2>
                    </div>
                    
                    <div className="flex-shrink-0 w-full sm:w-auto flex justify-between">
                        <div className="flex items-center">
                            {showArrows && (
                                <div className="flex items-center">
                                    <button
                                        onClick={() => handleScroll('prev')}
                                        className="w-10 h-10 sm:w-12 sm:h-12 bg-light text-black flex items-center justify-center hover:bg-light active:bg-skeleton transition-colors rounded-xl disabled:opacity-50"
                                        aria-label="Предыдущий товар"
                                        disabled={!canScrollPrev}
                                    >
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M15 6L9 12L15 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                    </button>
                                    <button
                                        onClick={() => handleScroll('next')}
                                        className="w-10 h-10 sm:w-12 sm:h-12 bg-black text-white flex items-center justify-center hover:bg-gray active:bg-gray transition-colors rounded-xl ml-2 sm:ml-3 disabled:opacity-50"
                                        aria-label="Следующий товар"
                                        disabled={!canScrollNext}
                                    >
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                        </svg>
                                    </button>
                                    <span className="text-sm text-dark ml-3 mr-3">
                                        {filteredProducts.length} шт.
                                    </span>
                                </div>
                            )}
                        </div>
                        
                        {filteredProducts.length > 0 && (
                            <button
                                onClick={clearViewedProducts}
                                className="h-10 sm:h-12 px-3 text-black flex items-center gap-1 bg-light hover:bg-skeleton active:bg-skeleton transition-colors rounded-xl"
                                aria-label="Очистить просмотренные товары"
                            >
                                <X size={16} />
                                <span className="text-sm">очистить</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Контейнер для скролла */}
                <div className="relative">
                    <div 
                        ref={scrollContainerRef}
                        className="overflow-x-auto pb-4 -mb-4 scroll-smooth scrollbar-hide"
                        onScroll={checkScrollButtons}
                    >
                        <div className="flex flex-nowrap gap-2">
                            {filteredProducts.map((product, index) => (
                                <div 
                                    key={`${product.id}-${index}`}
                                    className="product-item w-[calc(50%-4px)] sm:w-[calc(33.333%-6px)] md:w-[calc(25%-6px)] lg:w-[calc(20%-8px)] flex-shrink-0 opacity-0 animate-fadeIn"
                                    style={{animationDelay: `${index * 50}ms`}}
                                >
                                    <ProductCard 
                                        product={product}
                                        parentCategorySlug={product.parentCategorySlug}
                                        subcategorySlug={product.subcategorySlug}
                                        isWeeklyProduct={false}
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Стили для скрытия скроллбара и анимации появления */}
                <style jsx global>{`
                    .scrollbar-hide {
                        scrollbar-width: none;
                        -ms-overflow-style: none;
                    }
                    .scrollbar-hide::-webkit-scrollbar {
                        display: none;
                    }
                    @keyframes fadeIn {
                        from { opacity: 0; transform: translateY(10px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                    .animate-fadeIn {
                        animation: fadeIn 0.3s ease-out forwards;
                    }
                `}</style>
            </div>
        </section>
    );
};

export default ViewedProducts; 