import type { CategoryPath } from './category';

export interface ProductBase {
  article: number;
  name: string;
  slug: string;
  image_logo: string;
  price: number;
  price_discount: number | null;
}

export interface ProductWeekly extends ProductBase {
  category_path: CategoryPath[];
}

export interface ProductFilterResult extends ProductBase {
  desc_short: string;
  available_models: ProductModelVariant[];
  defaultModel: string;
  defaultModel_slug: string;
  category_slug: string;
  in_stock: number;
  article: number;
}

export interface ProductModelVariant {
  name: string;
  in_stock: number;
  slug: string;
}

export interface ProductSearchResult extends ProductBase {
  desc_short: string;
  category_slug: string;
}

export interface ProductFull extends ProductBase {
  article: number;
  desc_long: string;
  desc_short: string;
  models: ProductModel[];
  specs: ProductSpec[];
  telegramPost: string;
  matches: ProductWeekly[]; // Похоже на ProductWeekly по структуре
  defaultModel: string;
  defaultModel_slug: string; // Добавлено, используется в ProductCard
  gen_text: string;
  in_stock: number;
  category_path: CategoryPath[];
  is_active: boolean;
}

export interface ProductModel {
  name: string;
  specEnums: ProductSpecEnum[];
}

export interface ProductSpecEnum {
  name: string;
  slug: string;
  icon: string | null;
  images: string[];
  in_stock: number;
}

export interface ProductSpec {
  name: string;
  value: string;
}

// Типы для API ответов

export interface ProductsWeeklyApiResponse {
  products: ProductWeekly[];
}

export interface ProductsFilterApiResponse {
  products: ProductFilterResult[];
  max_page: number;
  total_count?: number;
}

export interface ProductsSearchApiResponse {
  products: ProductSearchResult[];
  max_page: number;
}

// Тип для ответа API фильтров категорий
export interface CategoryFiltersApiResponse {
  Spec: {
    name: string;
    spec_enums: string[];
  }[];
  range_price: {
    min: number;
    max: number;
  };
} 