import React from 'react';
import { getCategories, getCategoryBySlug } from '@/shared/api/categories';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { NEXT_PUBLIC_STATIC_URL } from "@/shared/config/api";
import type { Metadata, ResolvingMetadata } from 'next';
import type { Category, CategoriesApiResponse } from '@/shared/types/category';
import CategoryCard from '@/entities/Category/ui/CategoryCard';

interface CategoryPageParams {
  categoryName: string;
}

interface CategoryPageProps {
  params: CategoryPageParams;
}

type MetadataProps = {
  params: CategoryPageParams;
  searchParams: { [key: string]: string | string[] | undefined };
};

export async function generateMetadata(
  { params }: MetadataProps,
  parent: ResolvingMetadata
): Promise<Metadata> {
    const slug = params.categoryName;
    const currentCategory = await getCategoryBySlug(slug);
        
    if (!currentCategory) {
        return {
            title: 'Категория не найдена',
            description: 'Запрашиваемая категория не существует'
        };
    }

    const previousImages = (await parent).openGraph?.images || []

    return {
        title: currentCategory.name,
        description: currentCategory.description || `Каталог товаров в категории ${currentCategory.name} магазина PANDA WEAR.`,
        keywords: [currentCategory.name, 'каталог', 'товары', 'одежда', 'Барнаул'],
        openGraph: {
            title: `${currentCategory.name} - Каталог PANDA WEAR`,
            description: currentCategory.description || `Каталог товаров в категории ${currentCategory.name}.`,
            images: [
              {
                url: currentCategory.image ? `${NEXT_PUBLIC_STATIC_URL}${currentCategory.image}` : '/img/logo/logo-b.png',
                width: 800,
                height: 600,
                alt: currentCategory.name,
              },
              ...previousImages,
            ],
            url: `https://ваш-сайт.ру/category/${slug}`,
            type: 'website',
        },
    };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
    const categorySlug = params.categoryName;
    const currentCategory = await getCategoryBySlug(categorySlug);
    
    if (!currentCategory) {
        notFound();
    }

    if (!currentCategory.has_childs || currentCategory.children.length === 0) {
        return (
            <div className="max-w-screen-xl mx-auto px-4 pt-8 pb-8 md:pt-12">
                <div className="flex flex-col mb-8 text-left items-start">
                    <span className="text-xs font-medium tracking-widest uppercase text-gray-500 mb-3">
                        Категория без подкатегорий
                    </span>
                    <h1 className="text-5xl md:text-6xl font-normal tracking-tight">
                        {currentCategory.name.toLowerCase()}
                    </h1>
                </div>
                
                <p className="text-dark mb-8">
                    эта категория не имеет подкатегорий.
                </p>
                <Link 
                    href={`/category/${categorySlug}/all-products`}
                    className="inline-block bg-black text-white px-8 py-3 rounded-xl hover:bg-gray transition-colors"
                >
                    просмотреть все товары
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-screen-xl mx-auto px-4 pt-8 pb-8 md:pt-12">
            <div className="flex flex-col mb-12 text-left items-start">
                <span className="text-xs font-medium tracking-widest uppercase text-gray-500 mb-3">
                    Категория
                </span>
                <h1 className="text-5xl md:text-6xl font-normal tracking-tight">
                    {currentCategory.name.toLowerCase()}
                </h1>
                <p className="text-dark mt-4">
                    выберите подкатегорию, чтобы просмотреть товары
                </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                <CategoryCard 
                    category={currentCategory}
                    linkHref={`/category/${categorySlug}/all-products`}
                    isAllProductsCard={true}
                    allProductsImage={currentCategory.image}
                />
                
                {currentCategory.children.map((subcat: Category, index: number) => (
                     <CategoryCard 
                        key={subcat.id}
                        category={subcat}
                        linkHref={`/category/${categorySlug}/${subcat.slug}`}
                        animationDelay={(index + 1) * 0.04}
                    />
                ))}
            </div>
        </div>
    );
}