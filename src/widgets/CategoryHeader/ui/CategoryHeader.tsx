"use client";

import React from 'react';
import Breadcrumbs from '@/widgets/Breadcrumbs/ui/Breadcrumbs';
import { CategoryPath } from '@/shared/types/category';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

// Хелпер для склонения существительных (если не импортируется)
function getNounPluralForm(
  number: number,
  one: string,
  two: string,
  five: string
): string {
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

// Тип для пути хлебных крошек (импортируем или определяем локально, если нужно)
interface BreadcrumbItem {
  name: string;
  slug: string; // Или href, в зависимости от компонента Breadcrumbs
}

interface CategoryHeaderProps {
  path?: CategoryPath[];
  count?: number | null;
  isLoading?: boolean;
}

const CategoryHeader: React.FC<CategoryHeaderProps> = ({ path = [], count, isLoading }) => {
  // Возвращаем использование getNounPluralForm
  const currentCount = count ?? 0;
  const productWord = getNounPluralForm(currentCount, 'товар', 'товара', 'товаров');

  // Если нет пути, не рендерим хедер (хлебные крошки требуют хотя бы "Главная")
  // if (path.length === 0) {
  //   return null; 
  // }

  return (
    <div className="sticky top-0 z-10 bg-white py-4">
      <div className="flex flex-row items-center justify-between">
        <Breadcrumbs path={path} />
        <div className="hidden sm:flex text-sm text-gray-600 flex-shrink-0 ml-4 items-start">
          <span>найдено:&nbsp;</span>
          {isLoading ? (
            <Skeleton width={80} inline={true} /> 
          ) : (
            <span>{currentCount} {productWord}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryHeader; 