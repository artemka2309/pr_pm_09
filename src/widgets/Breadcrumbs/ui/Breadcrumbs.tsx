"use client";
import React from 'react';
import Link from 'next/link';
import { Breadcrumbs as HeroBreadcrumbs, BreadcrumbItem } from "@heroui/react";
import { CategoryPath } from '@/shared/types/category';

interface BreadcrumbsProps {
    path?: CategoryPath[];
    currentProduct?: string;
}

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ path = [], currentProduct }) => {
    // Если нет пути и текущего продукта, не рендерим крошки
    if (path.length === 0 && !currentProduct) {
        return null;
    }

    return (
        <HeroBreadcrumbs 
            aria-label="Хлебные крошки" 
            itemClasses={{ item: "text-sm", separator: "text-dark" }}
            variant="light" // Используем светлый вариант без фона
            className="mb-4" // Добавим отступ снизу
        >
            <BreadcrumbItem href="/">Главная</BreadcrumbItem>

            {path.map((item, index) => {
                const isLastPathItem = index === path.length - 1;
                const currentPathSlugs = path.slice(0, index + 1).map(p => p.slug);
                const href = `/category/${currentPathSlugs.join('/')}`;

                // Последний элемент пути без currentProduct НЕ будет ссылкой
                if (isLastPathItem && !currentProduct) {
                    return (
                        <BreadcrumbItem key={item.slug || index}>
                            {item.name.toLowerCase()}
                        </BreadcrumbItem>
                    );
                } else {
                    // Все остальные элементы пути будут ссылками
                    return (
                        <BreadcrumbItem key={item.slug || index} href={href}>
                            {item.name.toLowerCase()}
                        </BreadcrumbItem>
                    );
                }
            })}

            {/* Текущий продукт всегда будет последним элементом и не будет ссылкой */}
            {currentProduct && (
                <BreadcrumbItem key="current-product">
                    {currentProduct.toLowerCase()}
                </BreadcrumbItem>
            )}
        </HeroBreadcrumbs>
    );
};

export default Breadcrumbs;