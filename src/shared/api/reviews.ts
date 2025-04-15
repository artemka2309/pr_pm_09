// frontend/src/app/api/reviews.ts
import { NEXT_PUBLIC_BASE_API_URL_CLIENT, API_URL_REVIEWS } from "@/shared/config/api";
import type { ReviewsApiResponse } from "@/shared/types/review";

export async function getReviews(): Promise<ReviewsApiResponse> {
    const res = await fetch(NEXT_PUBLIC_BASE_API_URL_CLIENT + API_URL_REVIEWS, {
        next: { revalidate: 30 }
    });

    if (!res.ok) {
        console.error(`Failed to fetch reviews: ${res.status} ${res.statusText}`);
        try {
            const errorBody = await res.text();
            console.error("Error body:", errorBody);
        } catch (e) {
            console.error("Could not read error body:", e);
        }
        return { reviews: { images: null, videos: null } };
    }

    return { reviews: { images: null, videos: null } };
}
