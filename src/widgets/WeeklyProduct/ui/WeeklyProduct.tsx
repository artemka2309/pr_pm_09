"use client";

import React, { useState, useEffect, useRef } from "react";
import ProductCard from '@/entities/Product/ui/ProductCard';
import AnimatedDiv from '@/shared/ui/AnimatedDiv';
import { X } from 'lucide-react';

// Типизируем объект товара, ожидаемый от API
interface CategoryPathItem {
    name: string;
    slug: string;
}

interface WeeklyItem {
    // Добавляем основные поля, которые использует ProductCard
    name: string;
    slug: string;
    image_logo?: string | null;
    price: number;
    price_discount?: number | null;
    category_path: CategoryPathItem[];
    available_models?: { name: string; slug: string; in_stock: number }[];
    defaultModel?: string | null;
    defaultModel_slug?: string | null;
    in_stock?: number | null;
    desc_short?: string | null;
    // ... другие поля, если есть
}

export interface WeeklyProductProps {
  products: WeeklyItem[]; // Используем типизированный массив
}

export default function WeeklyProduct({ products }: WeeklyProductProps) {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [canScrollPrev, setCanScrollPrev] = useState(false);
    const [canScrollNext, setCanScrollNext] = useState(false);
    const [showArrows, setShowArrows] = useState(false);
    
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
    }, [products]);

    // Обработчики для стрелок навигации
    const handleScroll = (direction: 'prev' | 'next') => {
        const container = scrollContainerRef.current;
        if (!container) return;
        
        // Определяем размер элемента для скролла
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

    if (!products || products.length === 0) {
        return null;
    }

    return (
        <section className="">
            <div className="container mx-auto px-4 max-w-screen-xl">
                <div className="flex flex-col sm:flex-row justify-between items-start mb-6">
                    <AnimatedDiv
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <div className="flex flex-col mb-4 sm:mb-0">
                            <span className="text-xs font-medium tracking-widest uppercase text-dark mb-3">
                                специальное предложение
                            </span>
                            <h2 className="text-5xl md:text-6xl font-normal tracking-tight">
                                товары недели
                            </h2>
                        </div>
                    </AnimatedDiv>
                    
                    {/* Кнопки навигации */}
                    {showArrows && (
                        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-end">
                            <span className="text-sm text-dark mr-1 sm:mr-2">
                                {products.length} шт.
                            </span>
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
                                className="w-10 h-10 sm:w-12 sm:h-12 bg-black text-white flex items-center justify-center hover:bg-gray active:bg-gray transition-colors rounded-xl disabled:opacity-50"
                                aria-label="Следующий товар"
                                disabled={!canScrollNext}
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </button>
                        </div>
                    )}
                </div>

                <div className="relative">
                    <div 
                        ref={scrollContainerRef}
                        className="overflow-x-auto pb-4 -mb-4 scroll-smooth scrollbar-hide"
                        onScroll={checkScrollButtons}
                    >
                        <div className="flex flex-nowrap gap-2">
                            {products.map((item, index) => {
                                // Извлекаем ОБА слага из category_path
                                const parentSlugFromPath = item.category_path?.[0]?.slug || null;
                                const subSlugFromPath = item.category_path?.[1]?.slug || null;
                                
                                return (
                                    <AnimatedDiv
                                        key={item.slug}
                                        className="product-item w-[calc(50%-4px)] sm:w-[calc(33.333%-6px)] md:w-[calc(25%-6px)] lg:w-[calc(20%-8px)] flex-shrink-0"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ 
                                            duration: 0.5, 
                                            delay: index * 0.05,
                                            ease: [0.22, 1, 0.36, 1] 
                                        }}
                                    >
                                        <ProductCard
                                            product={item}
                                            parentCategorySlug={parentSlugFromPath} 
                                            subcategorySlug={subSlugFromPath}
                                            isWeeklyProduct={true}
                                        />
                                    </AnimatedDiv>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Стили для скрытия скроллбара */}
                <style jsx global>{`
                    .scrollbar-hide {
                        scrollbar-width: none;
                        -ms-overflow-style: none;
                    }
                    .scrollbar-hide::-webkit-scrollbar {
                        display: none;
                    }
                `}</style>
            </div>
        </section>
    );
}