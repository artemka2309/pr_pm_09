"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Pagination } from "@heroui/react";
import { motion } from 'framer-motion';
import Skeleton from 'react-loading-skeleton';
import ProductCard from '@/entities/Product/ui/ProductCard';
import { getFilteredProducts } from '@/shared/api/products';
import type { ProductFilterResult, ProductsFilterApiResponse } from '@/shared/types/product';
import type { CategoryFiltersApiResponse } from '@/shared/types/product';
import CategoryHeader from '@/widgets/CategoryHeader/ui/CategoryHeader';

// Тип для опции фильтра (используется в DropdownMenu)
interface FilterOption {
  label: string;
  value: string | number;
}
// Тип для данных фильтров, передаваемых в DropdownMenu
interface FiltersData {
  [key: string]: FilterOption[];
}

// Тип для параметров страницы
interface SubCategoryPageParams {
  categoryName: string;
  subcategoryName: string;
}

// Тип для начальных данных фильтров (предполагаем, что они приходят с сервера уже в нужном формате)
// В идеале, это должно быть результатом getCategoryFilters, трансформированным на сервере
interface InitialFiltersProps {
   filters: FiltersData;
   // Можно добавить другие свойства фильтров, если они есть
}

// Тип для пути хлебных крошек (дублируем или импортируем из CategoryHeader, если там экспортирован)
interface BreadcrumbItem {
  name: string;
  slug: string;
}

// Тип для пропсов компонента
interface ClientSubCategoryPageProps {
  initialProducts: ProductsFilterApiResponse; // Используем тип ответа API
  initialFilters: InitialFiltersProps; // Используем определенный выше тип
  params: SubCategoryPageParams;
  isAllProducts: boolean; // ДОБАВЛЕНО: Флаг для страницы "Все товары"
  breadcrumbPath: BreadcrumbItem[]; // Добавляем breadcrumbPath
}

// Тип для состояния выбранных фильтров
interface SelectedFiltersState {
  [key: string]: (string | number)[];
}

// Тип для состояния диапазона цен
interface PriceRangeState {
  min: number | null;
  max: number | null;
}

// Компонент фильтрации и сортировки
import ProductFilters from '@/widgets/ProductFilters/ui/ProductFilters';

// Обновленный компонент для отображения скелетона товара
const ProductCardSkeletonSingle = ({ index }: { index: number }) => (
    <div 
      className="h-full flex flex-col bg-white rounded-2xl overflow-hidden"
      style={{ animation: `pulse 1.8s ease-in-out ${index % 4 * 0.1}s infinite` }}
    >
      <div className="flex-grow">
        <div className="bg-skeleton aspect-square rounded-xl w-full mb-2"></div>
        
        <div className="px-1 mb-2">
            <div className="space-y-1.5 mb-1">
              <div className="h-4 bg-skeleton rounded-md w-full"></div>
              <div className="h-4 bg-skeleton rounded-md w-3/4"></div>
            </div>
            <div className="h-6 bg-skeleton rounded-md w-1/2"></div>
        </div>
      </div>
      
      <div className="mt-auto px-1 pb-1">
        <div className="h-10 bg-skeleton rounded-xl w-full"></div>
      </div>
    </div>
);

// Компонент для сетки скелетонов
const ProductSkeleton = ({ count = 8 }: { count?: number }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2"
    >
      {Array(count).fill(0).map((_, index) => (
         <ProductCardSkeletonSingle key={index} index={index} />
      ))}
    </motion.div>
  );
};

// Компонент для отображения продуктов
interface ProductGridProps {
  products: ProductFilterResult[];
  categoryName: string;
  subcategoryName: string;
}
const ProductGrid = ({ products, categoryName, subcategoryName }: ProductGridProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-2"
    >
      {products.map((product: ProductFilterResult) => (
        <ProductCard 
          key={product.slug} 
          product={product} 
          parentCategorySlug={categoryName} 
          subcategorySlug={subcategoryName}
          isLoading={false} 
        />
      ))}
    </motion.div>
  );
};

// Компонент для отображения сообщения "Товары не найдены"
const EmptyResults = () => (
  <div className="flex flex-col items-center justify-center text-center text-gray-500 py-12">
    <p className="mt-4 text-sm md:text-md font-semibold">товары не найдены</p>
    <p className="mt-2 text-xs md:text-sm">попробуйте изменить параметры фильтрации или сортировки.</p>
  </div>
);

export default function ClientSubCategoryPage({ initialProducts, initialFilters, params, isAllProducts, breadcrumbPath }: ClientSubCategoryPageProps) {
  // --- Логирование начальных фильтров --- 
  console.log("ClientSubCategoryPage received initialFilters:", JSON.stringify(initialFilters, null, 2));
  // -------------------------------------

  // Проверяем и логируем начальные данные
  const initialProductsArray = useMemo(() => {
    if (!initialProducts) {
      console.warn('отсутствуют начальные данные о товарах');
      return [];
    }
    
    // Проверяем формат данных
    if (Array.isArray(initialProducts)) {
      console.log('initialProducts получен в виде массива:', initialProducts.length);
      return initialProducts;
    }
    
    if (initialProducts.products && Array.isArray(initialProducts.products)) {
      console.log('initialProducts получен в виде объекта с массивом products:', initialProducts.products.length);
      return initialProducts.products;
    }
    
    console.warn('неожиданный формат initialProducts:', initialProducts);
    return [];
  }, [initialProducts]);
  
  // Состояния
  const [selectedFilters, setSelectedFilters] = useState<SelectedFiltersState>({});
  const [products, setProducts] = useState<ProductFilterResult[]>(initialProducts?.products || []);
  const [sort, setSort] = useState<string>('default');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [filters, setFilters] = useState<FiltersData>(initialFilters?.filters || {});
  const [noProductsFound, setNoProductsFound] = useState<boolean>((initialProducts?.products || []).length === 0);
  const [totalPages, setTotalPages] = useState<number>(initialProducts?.max_page || 1);
  const [totalProductsCount, setTotalProductsCount] = useState<number | null>(
    initialProducts?.total_count ?? (initialProducts?.products?.length || 0)
  );
  const [priceRange, setPriceRange] = useState<PriceRangeState>({
    min: null,
    max: null
  });

  // Дебаунс фильтров и сортировки
  const [debouncedFilters, setDebouncedFilters] = useState<SelectedFiltersState>(selectedFilters);
  const [debouncedSort, setDebouncedSort] = useState<string>(sort);

  // --- Логирование начального количества товаров --- 
  useEffect(() => {
    console.log("Initial total products count:", totalProductsCount);
  }, [totalProductsCount]);
  // -------------------------------------------

  // --- Логирование состояния filters --- 
  useEffect(() => {
    console.log("ClientSubCategoryPage filters state:", JSON.stringify(filters, null, 2));
  }, [filters]);
  // -----------------------------------

  // Обработчики пользовательских действий
  const handleFilterChange = useCallback((filterType: string, values: (string | number)[]) => {
    setIsLoading(true);
    setSelectedFilters((prevFilters: SelectedFiltersState) => {
      if (values.length === 0) {
        const { [filterType]: _, ...rest } = prevFilters;
        return rest;
      }
      return {
        ...prevFilters,
        [filterType]: values,
      };
    });
  }, []);

  const handleSortChange = useCallback((value: string) => {
    setIsLoading(true);
    setSort(value);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setIsLoading(true);
    setCurrentPage(page);
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, []);

  // Эффект для применения дебаунса к фильтрам
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedFilters(selectedFilters);
    }, 400);
    return () => clearTimeout(timeoutId);
  }, [selectedFilters]);
  
  // Эффект для применения дебаунса к сортировке
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSort(sort);
    }, 400);
    return () => clearTimeout(timeoutId);
  }, [sort]);

  // Эффект для расчета ценового диапазона при изменении продуктов
  useEffect(() => {
    if (products && products.length > 0) {
      const prices = products.map(product => product.price).filter((price): price is number => typeof price === 'number');
      if (prices.length > 0) {
        setPriceRange({
          min: Math.min(...prices),
          max: Math.max(...prices)
        });
      }
    }
  }, [products]);

  // Эффект для загрузки продуктов
  useEffect(() => {
    let isActive = true;
    setIsLoading(true); // Устанавливаем isLoading в начале эффекта
    setNoProductsFound(false); // Сбрасываем флаг "не найдено" при каждом новом запросе
    
    const loadProducts = async () => {
      // Добавляем проверку, что params существуют, перед формированием payload
      if (!isActive || !params || !params.categoryName || !params.subcategoryName) {
          console.warn("Недостаточно параметров для загрузки продуктов");
          setIsLoading(false);
          return;
      }
      
      // Формируем объект payload для POST запроса
      const payload = {
          Slug: isAllProducts ? params.categoryName : params.subcategoryName,
          Page: currentPage,
          ...(debouncedSort !== 'default' && { OrderBy: debouncedSort }), // Добавляем OrderBy если не default
          ...debouncedFilters // Добавляем все активные фильтры
      };
      console.log("Запрос продуктов (POST) с payload:", payload);

      try {
        // Используем новую функцию getFilteredProducts с объектом payload
        const result: ProductsFilterApiResponse | null = await getFilteredProducts(payload);
        
        if (!isActive) return;
        
        console.log('получены товары после запроса:', result);
        
        // Добавляем явную проверку на null перед доступом к свойствам
        if (result === null) {
            console.error('API вернуло null (возможно, ошибка сервера или 400)');
            setNoProductsFound(true);
            setProducts([]);
            setTotalProductsCount(0);
            setTotalPages(1);
        } else if (!Array.isArray(result.products)) { // Проверяем, что products - это массив
          console.error('неверный формат данных от API (products не массив):', result);
          setNoProductsFound(true);
          setProducts([]);
          setTotalProductsCount(0);
          setTotalPages(1);
        } else {
          // Сюда попадаем, только если result не null и result.products - массив
          const productsArray: ProductFilterResult[] = result.products;
          setTotalProductsCount(result.total_count ?? productsArray.length);
          setTotalPages(result.max_page || 1);

          if (productsArray.length === 0) {
            setNoProductsFound(true);
            setProducts([]);
          } else {
            setNoProductsFound(false);
            setProducts(productsArray);
            
            const prices = productsArray.map(product => product.price).filter((price): price is number => typeof price === 'number');
            if (prices.length > 0) {
              setPriceRange({
                min: Math.min(...prices),
                max: Math.max(...prices)
              });
            }
          }
        }
      } catch (error) { // Этот catch сработает, если getFilteredProducts выбросит ошибку (не 404 и не null)
        if (!isActive) return;
        console.error('ошибка при выполнении getFilteredProducts:', error);
        setProducts([]);
        setNoProductsFound(true);
        setTotalProductsCount(0);
        setTotalPages(1);
      } finally {
        if (isActive) {
          setIsLoading(false); // Сбрасываем isLoading в finally
        }
      }
    };

    loadProducts();
    
    return () => {
      isActive = false;
    };
  }, [debouncedSort, debouncedFilters, currentPage, params, isAllProducts]);

  // Эффект для создания анимации скелетона
  useEffect(() => {
    if (isLoading) {
      const style = document.createElement('style');
      style.id = 'skeleton-animation';
      style.innerHTML = `
        @keyframes pulse {
          0% { opacity: 0.6; }
          50% { opacity: 1; }
          100% { opacity: 0.6; }
        }
      `;
      document.head.appendChild(style);
      
      return () => {
        const existingStyle = document.getElementById('skeleton-animation');
        if (existingStyle) {
          existingStyle.remove();
        }
      };
    }
  }, [isLoading]);

  // Определяем количество скелетонов в зависимости от размера экрана
  const skeletonCount = useMemo(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 768 ? 6 : window.innerWidth < 1280 ? 9 : 12;
    }
    return 12;
  }, []);

  return (
    <div className="flex flex-col">
      <CategoryHeader path={breadcrumbPath} count={totalProductsCount} isLoading={isLoading} />

      <div className="flex flex-col sm:flex-row flex-grow">
        <div className="w-full sm:w-44 sm:sticky sm:top-24 self-start sm:max-h-[calc(100vh-96px)] overflow-y-auto mb-4 sm:mb-0 flex-shrink-0">
          <ProductFilters 
            filters={filters}
            onFilterChange={handleFilterChange}
            onSortChange={handleSortChange}
            priceRange={priceRange}
            totalProductsCount={totalProductsCount}
            isLoading={isLoading}
          />
        </div>
        
        <div className="max-w-screen-xl sm:px-3 sm:pl-4 h-fit mx-auto pb-5 flex-grow" id="products-list">
          {noProductsFound ? (
            <EmptyResults />
          ) : isLoading ? (
            <ProductSkeleton count={skeletonCount} />
          ) : (
            <ProductGrid 
              products={products} 
              categoryName={params.categoryName} 
              subcategoryName={params.subcategoryName} 
            />
          )}
        </div>
      </div>

      {totalPages > 1 && (
        <nav className="flex mt-auto justify-center pb-5" aria-label="Пагинация">
          <Pagination
            total={totalPages}
            initialPage={1}
            onChange={handlePageChange}
            classNames={{
              item: "text-black",
              cursor: "bg-black text-white"
            }}
          />
        </nav>
      )}
    </div>
  );
}