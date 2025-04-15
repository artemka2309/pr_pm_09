// frontend/src/app/api/fetchWeeklyProducts.ts
import { NEXT_PUBLIC_BASE_API_URL_SERVER, API_URL_GET_PRODUCTS_WEEKLY } from "@/shared/config/api";

export async function fetchWeeklyProducts() {
    const res = await fetch(`${NEXT_PUBLIC_BASE_API_URL_SERVER}${API_URL_GET_PRODUCTS_WEEKLY}`, {
        next: { revalidate: 30 }
    });

    if (!res.ok) {
        throw new Error('Failed to fetch weekly products');
    }

    return res.json();
}