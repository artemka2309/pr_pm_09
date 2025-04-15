import React from 'react';
// Импортируем новую функцию API и типы из правильных мест
import { getGallery } from "@/shared/api/gallery"; 
import type { GalleryApiResponse, GalleryImage } from "@/shared/types/gallery"; // Импортируем оба типа
import { NEXT_PUBLIC_STATIC_URL } from "@/shared/config/api";
// Импортируем клиентский компонент, который будет создан/переименован
import GalleryClient from "./GalleryClient"; 

export const revalidate = 3600; // revalidate the data at most every hour

// Определяем тип для форматированного изображения
export interface FormattedGalleryImage {
  src: string;
  alt: string;
  width: number;
  height: number;
  caption?: string | null;
}

export default async function Gallery() {
  // Вызываем getGallery и ожидаем GalleryApiResponse
  const apiResponse: GalleryApiResponse = await getGallery(); 
  const images: GalleryImage[] = apiResponse?.images || []; // Получаем массив изображений из ответа

  // Форматируем данные с типами
  const formattedImages: FormattedGalleryImage[] = images.map((image, index) => ({
    src: `${NEXT_PUBLIC_STATIC_URL}${image.path}`,
    alt: `Фото покупателя ${index + 1}`,
    width: 1200, // Используем дефолтные или получаем из API, если есть
    height: 900, // Используем дефолтные или получаем из API, если есть
    caption: null // API сейчас не предоставляет caption
  }));

  // Добавляем стандартную обертку секции
  return (
    // Убираем py-8 отсюда, так как он будет в GalleryClient
    <section>
      {/* Контейнер уберем, так как он есть в GalleryClient */}
      <GalleryClient images={formattedImages} />
    </section>
  );
} 