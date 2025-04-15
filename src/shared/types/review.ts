// API для отзывов пока возвращает null, определим базовую структуру
export interface ReviewMedia {
  images: string[] | null;
  videos: string[] | null;
}

export interface ReviewsApiResponse {
  reviews: ReviewMedia;
} 