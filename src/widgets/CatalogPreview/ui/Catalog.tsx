import React from 'react';
import Link from "next/link";
import Image from "next/image";
import { getCategories } from '@/shared/api/categories';
import AnimatedDiv from '@/shared/ui/AnimatedDiv';
import { NEXT_PUBLIC_STATIC_URL } from "@/shared/config/api";
import CategoryCard from '@/entities/Category/ui/CategoryCard';

interface Category {
    id?: string | number;
    slug: string;
    name: string;
    image: string;
}

interface CategoriesResponse {
    categories: Category[];
}

export default async function Catalog(): Promise<React.ReactElement> {
    const apiData: CategoriesResponse = await getCategories();
    
    return (
        <section className="">
            <div className="container mx-auto px-4 max-w-screen-xl">
                <AnimatedDiv
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                >
                    <div className="flex flex-col mb-12">
                        <span className="text-xs font-medium tracking-widest uppercase text-dark mb-3">
                            наш ассортимент
                        </span>
                        <h2 className="text-5xl md:text-6xl font-normal tracking-tight">
                            категории
                        </h2>
                    </div>
                </AnimatedDiv>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {apiData.categories.map((category: Category, key: number) => (
                        <CategoryCard 
                            key={category.id || key}
                            category={category}
                            linkHref={`/category/${category.slug}`}
                            animationDelay={key * 0.05}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
} 