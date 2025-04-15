// frontend/src/app/page.tsx

import React from 'react';
import HeroSection from '@/widgets/HeroSection/ui/HeroSection';
import Catalog from '@/widgets/CatalogPreview/ui/Catalog';
// import Info from '@/components/ui/index/Info';
import SocialMediaBlock from '@/widgets/SocialMediaBlock/ui/SocialMediaBlock';
import Gallery from '@/widgets/Gallery/ui/Gallery';
import Reviews from '@/widgets/Reviews/ui/Reviews';
// Импортируем компонент и его тип Product
// import WeeklyProduct, { type Product } from '@/widgets/WeeklyProduct/ui/WeeklyProduct'; 
import WeeklyProduct from '@/widgets/WeeklyProduct/ui/WeeklyProduct'; // Импортируем только компонент
import type { Metadata } from 'next'; // Импорт Metadata

// --- Импорт API функций --- 
// TODO: Перенести fetchWeeklyProducts, fetchGalleryImages, fetchReviews в shared/api
import { getWeeklyProducts } from '@/shared/api/products'; 
// Убираем импорты Gallery и Reviews, так как они загружают данные сами
// import { fetchGalleryImages } from '@/shared/api/gallery'; 
// import { fetchReviews } from '@/shared/api/reviews'; // TODO: Создать файл и функцию
import { getSliders } from '@/shared/api/sliders'; // Импортируем новую функцию
// -------------------------

// Удаляем локальное определение Product
/*
interface Product {
  id: string | number;
  // ... другие поля продукта
}
*/

// Используем импортированный тип Product - ВРЕМЕННО any[]
interface WeeklyProductsData {
  products: any[]; 
  // ... возможно, другие поля ответа API
}

// --- Типы для данных, получаемых из API --- 
// (Используем импортированные типы)
import type { ProductWeekly, ProductsWeeklyApiResponse } from '@/shared/types/product';
import type { GalleryApiResponse } from '@/shared/types/gallery';
import type { ReviewsApiResponse } from '@/shared/types/review';
import type { Slide, SlidersApiResponse } from '@/shared/types/slider';
// -----------------------------------------

// Добавляем метаданные для главной страницы
export const metadata: Metadata = {
  title: 'PANDA WEAR - Магазин модной одежды в Барнауле', // title.default из layout.tsx здесь будет основным
  description: 'Откройте для себя PANDA WEAR - ваш магазин современной и стильной одежды в Барнауле. Широкий ассортимент, уникальный стиль. г. Барнаул, ул. Попова, 82 (ТЦ Малина).',
  // Можно добавить Open Graph метаданные специально для главной
  openGraph: {
    title: 'PANDA WEAR - Магазин модной одежды в Барнауле',
    description: 'Откройте для себя PANDA WEAR - ваш магазин современной и стильной одежды в Барнауле.',
    images: [
      {
        url: '/img/logo/logo-b.png', // Путь к вашему основному лого или hero-изображению для главной
        width: 800, // Укажите размеры
        height: 600,
        alt: 'PANDA WEAR Logo',
      },
    ],
  },
};

export default async function App(): Promise<React.ReactElement> {
    // Используем Promise.all для параллельной загрузки данных
    const [ weeklyProductsData, slidersData /*, galleryData, reviewsData */ ] = await Promise.all([
        getWeeklyProducts(),
        getSliders(), // Используем новую функцию
        // getGallery(), // Пока не используем галерею и отзывы на главной
        // getReviews(), 
    ]).catch(error => {
        // Обработка ошибок загрузки данных
        console.error("Ошибка загрузки данных для главной страницы:", error);
        // Возвращаем пустые массивы или null, чтобы страница не падала
        return [{ products: [] }, { sliders: [] } /*, { images: [] }, { reviews: null } */ ];
    });

    // Извлекаем данные из ответов API, проверяя на null/undefined
    const weeklyProducts: ProductWeekly[] = weeklyProductsData?.products || [];
    const slides: Slide[] = slidersData?.sliders || [];
    // const galleryImages = galleryData?.images || []; // Пока не используем
    // const reviews = reviewsData?.reviews || { images: null, videos: null }; // Пока не используем

    return (
        <main className='mx-auto space-y-16 pb-6'>
            {/* Передаем данные слайдера в HeroSection */}
            <HeroSection slides={slides} /> 
            
            {/* <Info /> */}
            <Catalog />
            
            <WeeklyProduct products={weeklyProducts} /> 
            <SocialMediaBlock />
            {/* Вызываем Gallery и Reviews без пропсов */} 
            <Gallery /> 
            <Reviews /> 
        </main>
    );
}