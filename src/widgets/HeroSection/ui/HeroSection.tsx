'use client'
import React, { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import Slider from 'react-slick';
import { motion, AnimatePresence } from 'framer-motion';
import "slick-carousel/slick/slick.css"; 
import "slick-carousel/slick/slick-theme.css";
import { NEXT_PUBLIC_STATIC_URL } from "@/shared/config/api";

// --- Типизация ---
interface SlideImage {
    path: string;
    // другие поля изображения, если есть
}

interface Slide {
    id?: string | number; // Добавим ID, если он есть
    title: string;
    desc: string;
    button: string; // URL кнопки
    button_text?: string;
    images: SlideImage[];
}

// Тип для рефа react-slick (установите @types/react-slick при необходимости)
type SliderRef = Slider | null;

// --- Добавляем пропсы --- 
interface HeroSectionProps {
    slides: Slide[]; // Делаем slides обязательным пропсом
}
// ----------------------

// Применяем HeroSectionProps
const HeroSection = ({ slides }: HeroSectionProps): React.ReactElement | null => {
    const sliderRef = useRef<SliderRef>(null);
    const [currentSlide, setCurrentSlide] = useState<number>(0);
    const [progress, setProgress] = useState<number>(0);
    // Убираем стейт для slides, так как они приходят из пропсов
    // const [slides, setSlides] = useState<Slide[]>([]); 
    // Загрузка теперь определяется наличием slides в пропсах
    const isSliderLoaded = slides && slides.length > 0; 

    const settings = {
        dots: false,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 1,
        autoplay: false, // Управляется через progress useEffect
        arrows: false,
        className: "relative",
        adaptiveHeight: true, // Добавляем adaptiveHeight
        beforeChange: (current: number, next: number) => {
            setCurrentSlide(next);
            setProgress(0);
        },
    };

    // Таймер для автопроигрывания и прогресс-бара
    useEffect(() => {
        let timer: NodeJS.Timeout;
        // Зависит от наличия slides
        if (slides && slides.length > 1) { 
            timer = setInterval(() => {
                setProgress((prevProgress) => {
                    const nextProgress = prevProgress + (100 / (5000 / 50));
                    if (nextProgress >= 100) {
                        sliderRef.current?.slickNext();
                        return 0;
                    }
                    return nextProgress;
                });
            }, 50);
        }
        return () => clearInterval(timer);
    }, [slides, currentSlide]); 

    const goToNext = () => {
        if (sliderRef.current) {
            sliderRef.current.slickNext();
            // setProgress(0); // Прогресс сбросится в useEffect
        }
    };

    const goToPrev = () => {
        if (sliderRef.current) {
            sliderRef.current.slickPrev();
            // setProgress(0); // Прогресс сбросится в useEffect
        }
    };

    // Если слайды еще не пришли (например, при серверной загрузке) или их нет
    if (!slides || slides.length === 0) { 
        // Можно вернуть скелетон или null
        // Пока оставим null, чтобы не показывать ничего, если данных нет
        // Если нужен скелетон, пока данные грузятся на сервере, 
        // его лучше делать через Suspense в родительском компоненте
        return null; 
    }

    return (
        <section 
            className="bg-white relative overflow-hidden" 
        >
            {slides.length > 0 && (
                <div className="max-w-screen-xl mx-auto relative px-4">
                    {/* Индикаторы прогресса */}
                    {slides.length > 1 && (
                        <div className="absolute top-0 left-0 right-0 z-10 flex px-4 py-1">
                            {slides.map((_, index) => (
                                <div
                                    key={index}
                                    className="flex-1 h-[4px] bg-light rounded-full mx-1 overflow-hidden"
                                >
                                    <div
                                        className="h-full bg-black transition-transform duration-100 ease-linear origin-left rounded-full"
                                        style={{
                                            // Используем scaleX для более плавной анимации
                                            transform: `scaleX(${currentSlide === index ? progress / 100 : (currentSlide > index ? 1 : 0)})`,
                                            transition: currentSlide === index ? 'transform 0.05s linear' : 'transform 0.3s ease'
                                        }}
                                    />
                                </div>
                            ))}
                        </div>
                    )}

                    <Slider ref={sliderRef} {...settings}>
                        {slides.map((slide, index) => (
                            <div key={slide.id || index} className="outline-none">
                                {/* Добавляем items-stretch для возможного выравнивания */}
                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 py-4 items-center">
                                    {/* Контейнер для анимации текста */}
                                    <div className="order-2 lg:order-1 w-full">
                                        <AnimatePresence initial={false}> {/* AnimatePresence для текста */}
                                            {currentSlide === index && (
                                                <motion.div 
                                                    key={`text-${slide.id || index}-inner`} // Уникальный ключ для внутреннего элемента
                                                    initial={{ opacity: 0, y: 20 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: -20 }}
                                                    transition={{ duration: 0.5, ease: "easeInOut" }}
                                                >
                                                    {/* Контент текста */}
                                                    <h2 className="text-5xl md:text-6xl font-normal mb-6 md:mb-8 tracking-tight !leading-tight">
                                                        {slide.title.toLowerCase()}
                                                    </h2>
                                                    <p className="text-dark text-lg md:text-xl max-w-xl leading-relaxed mb-10">
                                                        {slide.desc}
                                                    </p>
                                                    <a 
                                                        href={slide.button} 
                                                        className="inline-block px-12 py-4 bg-black text-white text-base font-normal hover:bg-gray transition-colors rounded-xl"
                                                        target="_blank" 
                                                        rel="noopener noreferrer"
                                                    >
                                                        {slide.button_text?.toLowerCase() || "подробнее"}
                                                    </a>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                    
                                    {/* Контейнер для анимации изображения */}
                                    <div className="order-1 lg:order-2 relative">
                                         <AnimatePresence initial={false}> {/* AnimatePresence для изображения */}
                                             {currentSlide === index && (
                                                <motion.div
                                                    key={`image-${slide.id || index}-inner`} // Уникальный ключ для внутреннего элемента
                                                    className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden"
                                                    initial={{ opacity: 0, scale: 0.98 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.98 }}
                                                    transition={{ duration: 0.5, ease: "easeInOut" }}
                                                >
                                                    {/* Контент изображения */}
                                                    {slide.images && slide.images.length > 0 && (
                                                        <Image
                                                            // Убедитесь, что NEXT_PUBLIC_STATIC_URL настроен правильно
                                                            src={`${NEXT_PUBLIC_STATIC_URL}${slide.images[0].path}`}
                                                            alt={slide.title}
                                                            fill
                                                            sizes="(max-width: 1024px) 100vw, 50vw" // Пример sizes, настройте под ваш дизайн
                                                            className="object-cover"
                                                            priority={index === 0} // Загружать первое изображение приоритетно
                                                            // loading="eager" // priority=true уже делает это
                                                        />
                                                    )}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </Slider>

                    {/* Кнопки переключения слайдов */} 
                    {slides.length > 1 && (
                        <div className="absolute bottom-4 right-4 md:bottom-8 md:right-8 flex space-x-3 z-20">
                            <button
                                onClick={goToPrev}
                                className="w-10 h-10 md:w-12 md:h-12 bg-light text-black flex items-center justify-center hover:bg-light active:bg-skeleton transition-colors rounded-xl disabled:opacity-50"
                                aria-label="Предыдущий слайд"
                                // disabled={currentSlide === 0} // Можно добавить, если не нужна бесконечная прокрутка
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M15 6L9 12L15 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </button>
                            <button
                                onClick={goToNext}
                                className="w-10 h-10 md:w-12 md:h-12 bg-black text-white flex items-center justify-center hover:bg-gray active:bg-gray transition-colors rounded-xl disabled:opacity-50"
                                aria-label="Следующий слайд"
                                // disabled={currentSlide === slides.length - 1} // Можно добавить, если не нужна бесконечная прокрутка
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </button>
                        </div>
                    )}
                </div>
            )}
        </section>
    );
};

export default HeroSection; // Экспортируем как HeroSection
