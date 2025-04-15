// Base URLs
export const NEXT_PUBLIC_BASE_API_URL_CLIENT = process.env.NEXT_PUBLIC_BASE_API_URL_CLIENT || 'http://localhost:8085/client/';
export const NEXT_PUBLIC_BASE_API_URL_SERVER = process.env.NEXT_PUBLIC_BASE_API_URL_SERVER || 'http://localhost:8085/client/';
export const NEXT_PUBLIC_STATIC_URL = process.env.NEXT_PUBLIC_STATIC_URL || 'http://localhost:8085/static/';

// --- Route Segments --- 

// Categories
export const API_URL_CATEGORIES_ALL = process.env.NEXT_PUBLIC_API_URL_CATEGORIES_ALL || 'categories/all';

// Filters
export const API_URL_PRODUCTS_BY_FILTERS = process.env.NEXT_PUBLIC_PRODUCTS_BY_FILTERS || 'products/filters';
export const API_URL_FILTERS_ALL = process.env.NEXT_PUBLIC_FILTERS_ALL || 'categories/filters/all';
export const API_URL_CATEGORY_FILTERS_BASE = process.env.NEXT_PUBLIC_CATEGORY_FILTERS_BASE || 'categories/filters/'; // Requires slug appended

// Products
export const API_URL_PRODUCT_BY_SLUG = process.env.NEXT_PUBLIC_PRODUCT_BY_SLUG || 'products/'; // Requires slug appended
export const API_URL_PRODUCT_SEARCH = process.env.NEXT_PUBLIC_PRODUCT_SEARCH || 'products/search';

// Orders
export const API_URL_GET_ORDERS = process.env.NEXT_PUBLIC_GET_ORDERS || 'orders';

// Site Settings
export const API_URL_GALLERY = process.env.NEXT_PUBLIC_GALLERY || 'site-settings/gallery/all';
export const API_URL_REVIEWS = process.env.NEXT_PUBLIC_REVIEWS || 'site-settings/reviews/all';
export const API_URL_GET_PRODUCTS_WEEKLY = process.env.NEXT_PUBLIC_GET_PRODUCTS_WEEKLY || 'site-settings/products-weekly';
export const API_URL_GET_SLIDERS_INDEX = process.env.NEXT_PUBLIC_GET_SLIDERS_INDEX || 'sliders/index';

// Promocodes
export const API_URL_GET_PROMOCODE = process.env.NEXT_PUBLIC_GET_PROMOCODE || 'promocodes';

// --- Full URLs (Client-side usage, combines base URL and segments) ---

export const getClientApiUrl = (segment: string) => `${NEXT_PUBLIC_BASE_API_URL_CLIENT}${segment}`;

// --- Next.js Route Segments --- 
export const NEXT_PUBLIC_URL_CATEGORY_PAGE = process.env.NEXT_PUBLIC_URL_CATEGORY_PAGE || 'category/'; 