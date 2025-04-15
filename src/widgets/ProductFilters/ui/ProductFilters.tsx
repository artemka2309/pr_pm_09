"use client";

import React from 'react';
import Skeleton from 'react-loading-skeleton';
import SortOption from '@/shared/ui/SortOption';
import DropdownMenu from '@/shared/ui/DropdownMenu';
import CheckboxSort from '@/shared/ui/CheckboxSort';

// Хелпер для склонения существительных 
function getNounPluralForm(number: number, one: string, two: string, five: string): string {
  let n = Math.abs(number);
  n %= 100;
  if (n >= 5 && n <= 20) {
    return five;
  }
  n %= 10;
  if (n === 1) {
    return one;
  }
  if (n >= 2 && n <= 4) {
    return two;
  }
  return five;
}

// Типы из ClientSubCategoryPage
interface FilterOption {
  label: string;
  value: string | number;
}
interface FiltersData {
  [key: string]: FilterOption[];
}
interface PriceRangeState {
  min: number | null;
  max: number | null;
}

// Типы для пропсов ProductFilters
interface ProductFiltersProps {
  filters: FiltersData;
  onFilterChange: (filterType: string, values: (string | number)[]) => void;
  onSortChange: (value: string) => void;
  priceRange: PriceRangeState;
  totalProductsCount?: number | null;
  isLoading?: boolean;
}

export default function ProductFilters({ 
  filters, 
  onFilterChange, 
  onSortChange, 
  priceRange,
  totalProductsCount = null,
  isLoading = false
}: ProductFiltersProps) { // Применяем типы
  const { min: minPrice, max: maxPrice } = priceRange || { min: null, max: null };
  const productCount = totalProductsCount ?? 0;
  const productWord = getNounPluralForm(productCount, 'товар', 'товара', 'товаров');

  // Проверка на пустые фильтры
  const hasFilters = Object.keys(filters).length > 0;

  return (
    <div className="w-full sm:flex-none sm:w-auto">
      <div id="filterMenu" className="w-full pb-4 sm:py-0">
        <div className="pb-2">
          <div className="flex justify-between items-center sm:items-start sm:flex-col sm:space-y-4">
            <div className="w-40 sm:w-full">
              <SortOption
                onSortChange={onSortChange}
                aria-label="Сортировка товаров"
              />
            </div>

            <div className="ml-4 sm:ml-0 text-sm text-dark">
              <div className="flex flex-col items-end sm:items-start">
                <div className="sm:hidden mb-2">
                  {isLoading ? (
                    <Skeleton width={80} />
                  ) : (
                    <span>найдено: {productCount} {productWord}</span>
                  )}
                </div>
                <div className="flex space-x-2">
                  <span>от {minPrice !== null ? `${minPrice}` : <Skeleton width={30} />}</span>
                  <span> — </span>
                  <span>до {maxPrice !== null ? `${maxPrice} ₽` : <Skeleton width={30} />}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {hasFilters ? (
          <div className="pt-4">
            <div>
              <div className="grid grid-cols-1 gap-2 sm:hidden">
                <DropdownMenu
                  filters={filters}
                  onFilterChange={onFilterChange}
                />
              </div>

              <div className="hidden sm:block">
                <CheckboxSort
                  filters={filters}
                  onFilterChange={onFilterChange}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="pt-4">
            <Skeleton count={3} height={40} className="mb-4" />
          </div>
        )}
      </div>
    </div>
  );
} 