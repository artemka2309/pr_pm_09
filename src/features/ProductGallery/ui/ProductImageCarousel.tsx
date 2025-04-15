"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Thumbs, FreeMode } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/thumbs';
import 'swiper/css/free-mode';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import Thumbnails from 'yet-another-react-lightbox/plugins/thumbnails';
import 'yet-another-react-lightbox/plugins/thumbnails.css';
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import Fullscreen from 'yet-another-react-lightbox/plugins/fullscreen';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import clsx from 'clsx';

import { NEXT_PUBLIC_STATIC_URL } from "@/shared/config/api";

// Базовые типы
interface SpecEnum {
    name?: string;
    slug?: string;
    images?: string[];
    in_stock: number;
}

interface ProductImageCarouselProps {
    selectedVariant: SpecEnum | null;
}

const placeholderImage = '/img/catalog-img/no_image.png';

// Определяем тип для CustomArrow Props
interface CustomArrowProps {
  direction: 'left' | 'right';
  onClick: () => void;
  disabled?: boolean; // Добавим disabled для крайних слайдов, если loop=false
}

// Компонент CustomArrow
const CustomArrow: React.FC<CustomArrowProps> = ({ direction, onClick, disabled }) => (
  <button
    type="button"
    onClick={onClick}
    disabled={disabled}
    className={clsx(
        "absolute top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-md bg-light/80 backdrop-blur-sm flex items-center justify-center transition-all duration-200 ease-in-out hover:bg-light focus:outline-none focus:ring-1 focus:ring-black/20 disabled:opacity-50 disabled:cursor-not-allowed",
        direction === 'left' ? 'left-4' : 'right-2' 
    )}
    aria-label={direction === 'left' ? 'предыдущий слайд' : 'следующий слайд'}
  >
    {direction === 'left'
      ? <ChevronLeft className="w-5 h-5 text-black" />
      : <ChevronRight className="w-5 h-5 text-black" />
    }
  </button>
);

const ProductImageCarousel: React.FC<ProductImageCarouselProps> = ({ selectedVariant }) => {
    const [thumbsSwiper, setThumbsSwiper] = useState<SwiperType | null>(null);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [lightboxOpen, setLightboxOpen] = useState(false);
    
    // Меняем тип ref, чтобы хранить сам инстанс Swiper
    const swiperRef = useRef<SwiperType | null>(null);
    
    // Подготавливаем массив изображений
    const imageUrls = React.useMemo(() => {
        if (!selectedVariant || !selectedVariant.images || selectedVariant.images.length === 0) {
            return [placeholderImage];
        }
        return selectedVariant.images.map(img => `${NEXT_PUBLIC_STATIC_URL}${img}`);
    }, [selectedVariant]);
    
    // Подготавливаем слайды для лайтбокса
    const lightboxSlides = React.useMemo(() => 
        imageUrls.map(src => ({ src })), 
    [imageUrls]);
    
    // Обработчики для кастомных стрелок
    const handlePrev = () => {
        if (swiperRef.current && typeof swiperRef.current.slidePrev === 'function') {
            swiperRef.current.slidePrev();
        } else {
            console.warn('Swiper instance or slidePrev method not available');
        }
    };
    const handleNext = () => {
        if (swiperRef.current && typeof swiperRef.current.slideNext === 'function') {
            swiperRef.current.slideNext();
        } else {
            console.warn('Swiper instance or slideNext method not available');
        }
    };

    // Сбрасываем состояние при изменении варианта
    useEffect(() => {
        if (swiperRef.current) {
            const isLoopActive = imageUrls.length > 1; // Проверяем, активен ли loop
            const targetIndex = 0; // Всегда сбрасываем на первый слайд

            // Используем slideTo или slideToLoop в зависимости от isLoopActive
            if (isLoopActive && typeof swiperRef.current.slideToLoop === 'function') {
                 // Задержка для slideToLoop может быть 0
                swiperRef.current.slideToLoop(targetIndex, 0);
            } else if (!isLoopActive && typeof swiperRef.current.slideTo === 'function') {
                // slideTo без loop
                swiperRef.current.slideTo(targetIndex, 0);
            } else {
                console.warn('Swiper instance or relevant slideTo/slideToLoop method not available in useEffect');
            }
            // Обновляем внутреннее состояние индекса
            setCurrentSlide(targetIndex); 
        }
        
        // Сбрасываем индекс слайдера миниатюр, если он есть
        thumbsSwiper?.slideTo(0, 0);

    }, [selectedVariant, thumbsSwiper, imageUrls.length]); // Добавляем imageUrls.length в зависимости
    
    // Если нет варианта или изображений, показываем заглушку
    if (!selectedVariant) {
        return (
            <div className="aspect-square bg-light-100 rounded-lg flex items-center justify-center text-light-400 border border-light-200">
                <div className="text-light-400">нет изображений</div>
            </div>
        );
    }
    
    return (
        <div className="relative product-gallery-container gap-2">
            {/* Основной слайдер */}
            <div className="relative product-main-slider-wrapper mb-2 lg:mb-0">
                <Swiper
                    onSwiper={(swiper) => { swiperRef.current = swiper; }}
                    modules={[Navigation, Thumbs]}
                    thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
                    slidesPerView={1}
                    onSlideChange={(swiper) => setCurrentSlide(swiper.realIndex)}
                    loop={imageUrls.length > 1}
                    className="product-main-slider h-full w-full rounded-2xl border border-light-100"
                >
                    {imageUrls.map((imgSrc, idx) => (
                        <SwiperSlide key={`slide-${idx}-${selectedVariant.slug || 'default'}`}>
                            <div 
                                className="aspect-square relative cursor-pointer bg-light-50"
                                onClick={() => setLightboxOpen(true)}
                            >
                                <img 
                                    src={imgSrc} 
                                    alt={`${selectedVariant.name || 'Товар'} - изображение ${idx + 1}`}
                                    className="w-full h-full object-cover rounded-2xl"
                                    loading={idx === 0 ? "eager" : "lazy"}
                                />
                                
                                <button 
                                    type="button"
                                    aria-label="Увеличить изображение" 
                                    className="absolute left-3 top-3 z-10 p-1.5 bg-light hover:bg-skeleton text-black rounded-md shadow-sm transition-colors"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setLightboxOpen(true);
                                    }}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                                    </svg>
                                </button>
                                
                                {imageUrls.length > 1 && (
                                    <div className="absolute right-3 bottom-3 bg-light text-black px-2.5 py-1 rounded-md shadow-sm text-xs font-medium">
                                        {currentSlide + 1} / {imageUrls.length}
                                    </div>
                                )}
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
                {/* Рендерим кастомные стрелки */}
                {imageUrls.length > 1 && (
                    <>
                        <CustomArrow direction="left" onClick={handlePrev} />
                        <CustomArrow direction="right" onClick={handleNext} />
                    </>
                )}
            </div>
            
            {/* Миниатюры */}
            {imageUrls.length > 1 && (
                <div className="mt-2 lg:mt-0 product-thumbs-container">
                    <Swiper
                        modules={[Thumbs, FreeMode]}
                        watchSlidesProgress
                        onSwiper={setThumbsSwiper}
                        className="thumbs-slider"
                        breakpoints={{
                            0: {
                                slidesPerView: 'auto',
                                spaceBetween: 8,
                                freeMode: true,
                                direction: 'horizontal',
                            },
                            1024: {
                                slidesPerView: 'auto',
                                spaceBetween: 8,
                                freeMode: true,
                                direction: 'vertical',
                            }
                        }}
                    >
                        {imageUrls.map((imgSrc, idx) => (
                            <SwiperSlide 
                                key={`thumb-${idx}-${selectedVariant.slug || 'default'}`}
                                className="product-thumb-slide cursor-pointer p-0.5"
                            >
                                <img 
                                    src={imgSrc}
                                    alt={`Миниатюра ${idx + 1}`}
                                    className={`w-full h-full object-cover rounded-lg transition-all duration-200 border-2 ${currentSlide === idx ? 'border-black' : 'border-transparent'}`}
                                    loading="lazy"
                                    onClick={() => {
                                        if (swiperRef.current) {
                                            const isLoopActive = imageUrls.length > 1;
                                            if (isLoopActive && typeof swiperRef.current.slideToLoop === 'function') {
                                                swiperRef.current.slideToLoop(idx);
                                            } else if (!isLoopActive && typeof swiperRef.current.slideTo === 'function') {
                                                swiperRef.current.slideTo(idx);
                                            } else {
                                                console.warn('Swiper instance or relevant slideTo/slideToLoop method not available on thumb click');
                                            }
                                        }
                                    }}
                                />
                            </SwiperSlide>
                        ))}
                    </Swiper>
                </div>
            )}
            
            {/* Лайтбокс для просмотра в полноэкранном режиме */}
            <Lightbox
                open={lightboxOpen}
                close={() => setLightboxOpen(false)}
                slides={lightboxSlides}
                plugins={[Thumbnails, Zoom, Fullscreen]}
                index={currentSlide}
                styles={{
                    container: { backgroundColor: 'rgba(10, 10, 10, 0.92)' },
                    thumbnailsContainer: { backgroundColor: 'rgba(0, 0, 0, 0.8)' },
                    thumbnail: { 
                        borderRadius: '6px',
                    },
                }}
                zoom={{ 
                    maxZoomPixelRatio: 2.5,
                    doubleTapDelay: 300,
                    doubleClickDelay: 500,
                }}
                thumbnails={{
                    position: 'bottom',
                    width: 80,
                    height: 80,
                    border: 0,
                    borderRadius: 6,
                    padding: 8,
                    gap: 12,
                }}
            />
            
            {/* Стили для навигации Swiper и АДАПТИВА */}
            <style jsx global>{`
                /* --- Общие стили для миниатюр --- */
                .product-thumbs-container .swiper-slide {
                    margin-left: 0 !important;
                    margin-right: 0 !important;
                }
                .product-thumbs-container .product-thumb-slide {
                    width: 64px !important;  /* Размер для мобильных */
                    height: 64px !important; /* Размер для мобильных */
                    flex-shrink: 0; /* Предотвращаем сжатие */
                }

                /* --- Адаптивное расположение для ДЕСКТОПА (lg и больше) --- */
                @media (min-width: 1024px) {
                    .product-gallery-container {
                        display: flex;
                        flex-direction: row;
                    }
                    
                    .product-main-slider-wrapper {
                        order: 2;
                        flex: 1;
                        min-width: 0;
                        margin-bottom: 0;
                    }
                    
                    .product-thumbs-container {
                        order: 1;
                        width: 88px;
                        height: auto;
                        max-height: 600px;
                        overflow: hidden;
                    }
                    
                    .product-thumbs-container .thumbs-slider {
                        height: 100%;
                    }

                    .product-thumbs-container .swiper-wrapper {
                        flex-direction: column;
                        height: auto !important;
                    }
                    
                    .product-thumbs-container .product-thumb-slide {
                        width: 88px !important; /* Размер для десктопа */
                        height: 88px !important; /* Размер для десктопа */
                        margin-bottom: 8px;
                        margin-right: 0 !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default ProductImageCarousel; 