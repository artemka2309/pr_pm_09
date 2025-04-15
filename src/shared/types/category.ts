export interface Category {
  id: number;
  name: string;
  image: string;
  slug: string;
  parent: number | null;
  has_childs: boolean;
  children: Category[];
}

export interface CategoriesApiResponse {
  categories: Category[];
}

export interface CategoryPath {
  name: string;
  slug: string;
} 