// frontend/src/shared/api/gallery.ts
import { NEXT_PUBLIC_BASE_API_URL_CLIENT, API_URL_GALLERY } from "@/shared/config/api";
import type { GalleryApiResponse } from "@/shared/types/gallery";

export async function getGallery(): Promise<GalleryApiResponse> {
    const res = await fetch(NEXT_PUBLIC_BASE_API_URL_CLIENT + API_URL_GALLERY, {
        next: { revalidate: 30 }
    });

    if (!res.ok) {
        console.error(`Failed to fetch gallery images: ${res.status} ${res.statusText}`);
        // Попытаться прочитать тело ответа для дополнительной информации
        try {
            const errorBody = await res.text();
            console.error("Error body:", errorBody);
        } catch (e) {
            console.error("Could not read error body:", e);
        }
        return { images: [] };
    }

    // Добавляем парсинг JSON и возврат данных
    try {
        const data: GalleryApiResponse = await res.json();
        if (!data || !Array.isArray(data.images)) {
            console.error('Invalid gallery API response structure:', data);
            return { images: [] }; // Возвращаем пустой объект при невалидной структуре
        }
        return data; // Возвращаем полный объект
    } catch (error) {
        console.error("Error parsing gallery JSON:", error);
        return { images: [] }; // Возвращаем пустой объект при ошибке парсинга
    }
} 