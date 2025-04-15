'use client';
import React, { useState } from 'react';
import Link from "next/link";
import Image from "next/image";
import AnimatedDiv from '@/shared/ui/AnimatedDiv';
import { NEXT_PUBLIC_STATIC_URL } from "@/shared/config/api";
import type { Category } from '@/shared/types/category';
import { ImageOff } from 'lucide-react';

interface CategoryCardProps {
    category: Pick<Category, 'slug' | 'name' | 'image'>;
    linkHref: string;
    animationDelay?: number;
    isAllProductsCard?: boolean;
    allProductsImage?: string;
}

const CategoryCard = ({
    category,
    linkHref,
    animationDelay = 0,
    isAllProductsCard = false,
    allProductsImage
}: CategoryCardProps): React.ReactElement => {

    const [imageError, setImageError] = useState(false);

    const imageUrl = isAllProductsCard && allProductsImage
        ? `${NEXT_PUBLIC_STATIC_URL}${allProductsImage}`
        : category.image
            ? `${NEXT_PUBLIC_STATIC_URL}${category.image}`
            : '/img/catalog-img/no_image.png';

    const title = isAllProductsCard ? "все товары" : category.name.toLowerCase();

    return (
        <Link href={linkHref} className="group bg-white block">
            <AnimatedDiv
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                    duration: 0.5,
                    delay: animationDelay,
                    ease: [0.34, 1.56, 0.64, 1]
                }}
                className="h-full"
            >
                <div className="flex flex-col h-full">
                    <div className="relative aspect-[4/3] overflow-hidden mb-4 rounded-2xl">
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:opacity-10 transition-opacity duration-500 z-10"></div>

                        <div className="relative h-full w-full overflow-hidden bg-light">
                            {!imageError ? (
                                <Image
                                    src={imageUrl}
                                    alt={title}
                                    fill
                                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                                    onError={() => setImageError(true)}
                                />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <ImageOff className="w-12 h-12 text-dark" strokeWidth={1.5} />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-between items-center p-2 flex-grow">
                        <h3 className="text-xl font-normal">
                            {title}
                        </h3>

                        <div className="w-10 h-10 flex items-center justify-center bg-white group-hover:bg-black transition-colors duration-300 rounded-xl z-20 border border-light group-hover:border-transparent">
                            <svg
                                className="w-4 h-4 text-black group-hover:text-white transition-colors duration-300"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth="2"
                                    d="M14 5l7 7-7 7"
                                ></path>
                            </svg>
                        </div>
                    </div>
                </div>
            </AnimatedDiv>
        </Link>
    );
};

export default CategoryCard;
