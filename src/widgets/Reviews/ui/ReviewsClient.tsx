"use client";

import { useState, useRef } from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import Image from 'next/image'; // Используем next/image вместо img
import ReactPlayer from 'react-player';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './StyleReactPlayer.css'; // Обновленный путь к стилям
import { NEXT_PUBLIC_STATIC_URL } from "@/shared/config/api";
import { CameraOff, VideoOff } from 'lucide-react';
import AnimatedDiv from '@/shared/ui/AnimatedDiv'; // Импортируем AnimatedDiv

// Определяем более строгий тип для отзыва, если потребуется
interface ReviewMedia {
  images: string[];
  videos: string[];
}

interface ReviewsClientProps {
  reviews: ReviewMedia;
}

// Тип для стрелок остается без изменений
const CustomArrow = ({ direction, onClick }: { direction: 'left' | 'right'; onClick: () => void }) => (
  <button
      onClick={onClick}
      className={`
          absolute top-1/2 -translate-y-1/2 z-10
          w-8 h-8 rounded-full backdrop-blur-lg
          bg-white/70
          flex items-center justify-center
          transition-all duration-300 ease-in-out
          hover:bg-light
          focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue
          ${direction === 'left' ? 'left-2' : 'right-2'}
      `}
      aria-label={direction === 'left' ? 'Previous slide' : 'Next slide'}
  >
      {direction === 'left'
          ? <ChevronLeft className="w-6 h-6 text-gray" />
          : <ChevronRight className="w-6 h-6 text-gray" />
      }
  </button>
);

// Компонент ReviewsClient
export default function ReviewsClient({ reviews }: ReviewsClientProps) {
  const [open, setOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const sliderRef = useRef<Slider>(null);

  // --- Добавляем проверку на reviews и reviews.images --- 
  if (!reviews || !Array.isArray(reviews.images)) {
    // Можно вернуть null, заглушку или сообщение об ошибке
    console.warn("Нет данных об изображениях для отзывов");
    // Вернем заглушку, чтобы не ломать страницу полностью
    // (можно адаптировать заглушку или вернуть null)
     return (
      <div className="px-2 py-4">
        <h2 className="text-lg md:text-xl text-center font-semibold mb-4">Отзывы клиентов:</h2>
        <div className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center text-gray-500">
             Нет данных об отзывах
         </div>
      </div>
    );
  }
  // --- Конец проверки ---

  const slides = reviews.images.map((image, index) => ({
      src: `${NEXT_PUBLIC_STATIC_URL}${image}`,
      alt: `Отзыв ${index + 1}`,
      // Можно добавить width/height если изображения имеют фиксированный размер
      // Для lightbox они используются, но для Image в слайдере - необязательно
  }));

  const handleSlideClick = (index: number) => {
      setCurrentIndex(index);
      setOpen(true);
  };

  const settings = {
      dots: true,
      infinite: slides.length > 2, // Делаем бесконечным только если слайдов > 2
      speed: 500,
      slidesToShow: 2,
      slidesToScroll: 1,
      arrows: false,
      responsive: [
          {
              breakpoint: 768,
              settings: {
                  slidesToShow: 1,
                  slidesToScroll: 1,
                  infinite: slides.length > 1 // Бесконечный для мобильных если слайдов > 1
              }
          }
      ]
  };

  const goToPrev = () => {
      sliderRef.current?.slickPrev();
  };

  const goToNext = () => {
      sliderRef.current?.slickNext();
  };

  return (
      // Убираем px-2 py-4 отсюда, т.к. отступы заданы в Reviews.tsx
      <div>
          {/* Заголовок в стиле других секций */}
          <AnimatedDiv
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
              <div className="flex flex-col mb-12 text-center items-center">
                  <span className="text-xs font-medium tracking-widest uppercase text-gray-500 mb-3">
                      что говорят наши покупатели
                  </span>
                  <h2 className="text-5xl md:text-6xl font-normal tracking-tight">
                      отзывы клиентов
                  </h2>
              </div>
          </AnimatedDiv>

          <AnimatedDiv
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
                  {/* Видео плеер */}
                  <div className='md:w-5/12 w-full'>
                      {reviews.videos && reviews.videos.length > 0 ? (
                          // Используем rounded-2xl как в других секциях
                          <div className="react-player-wrapper rounded-2xl overflow-hidden">
                              <ReactPlayer
                                  url={`${NEXT_PUBLIC_STATIC_URL}${reviews.videos[0]}`}
                                  width="100%"
                                  height="100%"
                                  controls={true}
                                  light={false}
                                  pip={true}
                                  className="react-player"
                              />
                          </div>
                      ) : (
                         <div className="aspect-video bg-light rounded-2xl flex items-center justify-center text-gray-500">
                              {/* Заглушка */}
                              <VideoOff size={48} strokeWidth={1.5} />
                              <span className="ml-2">нет видео отзывов</span>
                         </div>
                      )}
                  </div>

                  {/* Слайдер изображений */}
                  <div className='md:w-7/12 w-full relative'>
                      {slides.length > 0 ? (
                        <>
                          <Slider ref={sliderRef} {...settings}>
                              {slides.map((slide, index) => (
                                  <div key={index} className="px-2">
                                      {/* Используем rounded-2xl */}
                                      <div className="aspect-square relative cursor-pointer rounded-2xl overflow-hidden" onClick={() => handleSlideClick(index)}>
                                          <Image
                                              src={slide.src}
                                              alt={slide.alt}
                                              fill
                                              sizes="(max-width: 768px) 90vw, 40vw"
                                              style={{ objectFit: 'cover' }}
                                              className="transition-transform duration-300 hover:scale-105"
                                              onError={(e) => {
                                                  console.error("Ошибка загрузки изображения отзыва:", slide.src);
                                                  e.currentTarget.src = '/img/catalog-img/no_image.png';
                                              }}
                                          />
                                      </div>
                                  </div>
                              ))}
                          </Slider>
                          {/* Показываем стрелки только если слайдов больше чем видно */}
                          {slides.length > settings.slidesToShow && (
                              <CustomArrow direction="left" onClick={goToPrev} />
                          )}
                           {slides.length > settings.slidesToShow && (
                              <CustomArrow direction="right" onClick={goToNext} />
                           )}
                        </>
                      ) : (
                        <div className="aspect-square bg-light rounded-2xl flex items-center justify-center text-gray-500">
                            {/* Заглушка */}
                            <CameraOff size={48} strokeWidth={1.5} />
                            <span className="ml-2">нет фото отзывов</span>
                        </div>
                      )}
                  </div>
              </div>
          </AnimatedDiv>

          {/* Lightbox */} 
          <Lightbox
              open={open}
              close={() => setOpen(false)}
              slides={slides.map(s => ({ src: s.src }))}
              index={currentIndex}
              styles={{ 
                  container: { backgroundColor: "rgba(0, 0, 0, .9)" },
              }}
          />
      </div>
  );
} 