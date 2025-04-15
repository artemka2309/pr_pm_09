"use client"; // Клиентский, т.к. использует ProductCard
import React, { useState, useEffect, useRef } from 'react';
import ProductCard from '@/entities/Product/ui/ProductCard';
import AnimatedDiv from '@/shared/ui/AnimatedDiv';

// Добавляем CategoryPath в тип Match
interface CategoryPathItem {
    name: string;
    slug: string;
}

// Переименовываем category_slug в category_path - ВОЗВРАЩАЕМ ОБРАТНО!
interface Match {
    name: string;
    image_logo: string;
    price: number;
    price_discount?: number | null;
    slug: string;
    // Используем category_path вместо category_slug - ВОЗВРАЩАЕМ ОБРАТНО!
    // category_path: CategoryPathItem[]; 
    category_slug: CategoryPathItem[]; // Возвращаем category_slug
    // Добавляем остальные поля, которые теперь приходят
    available_models?: { name: string; slug: string; in_stock: number }[];
    defaultModel?: string | null;
    defaultModel_slug?: string | null;
    in_stock?: number | null;
    desc_short?: string | null;
}

// Типы для пропсов
interface RelatedProductsProps {
    matches: Match[]; // Тип остается Match[], т.к. мы изменили сам Match
    // category больше не нужен, т.к. берем из item.category_path
    // category?: string | null;
    currentProductSlug?: string | null;
}

const RelatedProducts: React.FC<RelatedProductsProps> = ({ matches, currentProductSlug }) => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const [canScrollPrev, setCanScrollPrev] = useState(false);
    const [canScrollNext, setCanScrollNext] = useState(false);
    const [showArrows, setShowArrows] = useState(false);
    
    // Фильтруем похожие товары, исключая текущий
    const filteredMatches = matches.filter(match => match.slug !== currentProductSlug);

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
    }, [filteredMatches]);

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

    // Если после фильтрации ничего не осталось, не рендерим блок
    if (!filteredMatches || filteredMatches.length === 0) {
        return null;
    }

    return (
        <section className="">
            <div className="container mx-auto max-w-screen-xl">
                <div className="flex flex-col sm:flex-row justify-between items-start mb-6">
                    <AnimatedDiv
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    >
                        <div className="flex flex-col text-left items-start mb-4 sm:mb-0">
                            <span className="text-xs font-medium tracking-widest uppercase text-dark mb-3">
                                вам также может понравиться
                            </span>
                            <h2 className="text-5xl md:text-6xl font-normal tracking-tight">
                                похожие товары
                            </h2>
                        </div>
                    </AnimatedDiv>

                    {/* Кнопки навигации */}
                    {showArrows && (
                        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-end">
                            <span className="text-sm text-dark mr-1 sm:mr-2">
                                {filteredMatches.length} шт.
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
                            {filteredMatches.map((item, index) => {
                                // Извлекаем слоги из item.category_path - ИСПРАВЛЯЕМ НА category_slug
                                const parentSlug = item.category_slug?.[0]?.slug || null; 
                                const subSlug = item.category_slug?.[1]?.slug || null;
                                
                                return (
                                    <AnimatedDiv
                                        key={item.slug}
                                        className="product-item w-[calc(50%-4px)] sm:w-[calc(33.333%-6px)] md:w-[calc(25%-6px)] lg:w-[calc(20%-8px)] flex-shrink-0"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ 
                                            duration: 0.4,
                                            delay: index * 0.05,
                                            ease: [0.22, 1, 0.36, 1]
                                        }}
                                    >
                                        <ProductCard
                                            product={item}
                                            parentCategorySlug={parentSlug} 
                                            subcategorySlug={subSlug} 
                                            isWeeklyProduct={false}
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
};

export default RelatedProducts; 