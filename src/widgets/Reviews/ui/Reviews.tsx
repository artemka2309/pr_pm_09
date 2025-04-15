import { getReviews } from '@/shared/api/reviews'; // Обновленный импорт
import ReviewsClient from './ReviewsClient'; // Обновленный импорт
import type { ReviewsApiResponse } from '@/shared/types/review'; // Импортируем тип ответа

export const revalidate = 3600; // revalidate data at most every hour

export default async function Reviews() {
    // Вызываем getReviews и ожидаем ReviewsApiResponse
    const apiResponse: ReviewsApiResponse = await getReviews().catch(error => {
        console.error("Ошибка при загрузке отзывов:", error);
        return { reviews: null }; // Возвращаем null в случае ошибки загрузки
    });
    
    // Извлекаем данные
    const reviewsData = apiResponse?.reviews; 

    // Проверяем, есть ли данные и не пустые ли массивы images и videos
    const hasImages = reviewsData?.images && Array.isArray(reviewsData.images) && reviewsData.images.length > 0;
    const hasVideos = reviewsData?.videos && Array.isArray(reviewsData.videos) && reviewsData.videos.length > 0;

    // Если нет ни фото, ни видео отзывов, не рендерим компонент
    if (!hasImages && !hasVideos) {
        return null; 
    }

    // Передаем данные в клиентский компонент
    // Убедимся, что передаем { images: [], videos: [] } если какой-то массив null или undefined
    const safeReviewsData = {
        images: reviewsData?.images || [],
        videos: reviewsData?.videos || []
    };

    // Добавляем стандартную обертку секции
    return (
        <section className="">
            <div className="container mx-auto px-4 max-w-screen-xl">
                <ReviewsClient reviews={safeReviewsData} />
            </div>
        </section>
    );
} 