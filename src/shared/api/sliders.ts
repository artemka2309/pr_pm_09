// frontend/src/shared/api/sliders.ts
import { NEXT_PUBLIC_BASE_API_URL_CLIENT, API_URL_GET_SLIDERS_INDEX } from "@/shared/config/api";
import type { SlidersApiResponse } from "@/shared/types/slider";

// --- Типы для слайдера (можно вынести в shared/types/slider.ts) ---
// interface SlideImage { ... }
// interface Slide { ... }
// interface SliderApiResponse { ... }
// ---------------------------------------------------------------------

/**
 * Загружает данные для слайдера с бэкенда.
 * Использует серверные переменные окружения и кэширование Next.js.
 * @returns {Promise<Slide[]>} Массив объектов слайдов.
 */
// export async function fetchSliders(): Promise<Slide[]> { ... }

export async function getSliders(): Promise<SlidersApiResponse> {
    const res = await fetch(NEXT_PUBLIC_BASE_API_URL_CLIENT + API_URL_GET_SLIDERS_INDEX, {
        next: { revalidate: 30 }
    });

    if (!res.ok) {
        // Логируем ошибку на сервере
        console.error(`Failed to fetch sliders: ${res.status} ${res.statusText}`);
        const errorBody = await res.text().catch(() => 'Could not read error body');
        console.error("Error body:", errorBody);
        // Не выбрасываем ошибку, чтобы страница не падала, возвращаем пустой объект
        // В реальном приложении можно добавить более сложную обработку
        return { sliders: [] };
    }

    const data: SlidersApiResponse = await res.json();
    
    if (!data || !Array.isArray(data.sliders)) {
        console.error('Invalid slider API response structure:', data);
        return { sliders: [] }; // Возвращаем пустой объект при невалидной структуре
    }
    
    return { sliders: data.sliders };
} 