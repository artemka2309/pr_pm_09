"use client"; // Вероятно, клиентский из-за взаимодействия
import React from 'react';
// Убираем импорты RadioGroup
// import { RadioGroup, Radio } from "@heroui/radio"; 
import clsx from 'clsx'; // Для условных классов

// Базовые типы для пропсов
interface SpecEnum {
    name?: string;
    slug?: string;
    value?: string; // Для цвета
    images?: string[];
    in_stock: number;
}

interface ProductVariantSelectorProps {
    colors: SpecEnum[];
    characteristicName?: string;
    onVariantSelect: (slug: string) => void; // Колбэк обязателен
    selectedVariantSlug?: string | null; // Слаг текущего выбранного варианта
}

const ProductVariantSelector: React.FC<ProductVariantSelectorProps> = ({ 
    colors, 
    characteristicName = "вариант", 
    onVariantSelect,
    selectedVariantSlug 
}) => {

    // console.log("[Selector] Rendered. Selected Slug:", selectedVariantSlug);

    if (!colors || colors.length <= 1) { // Не показываем, если 0 или 1 вариант
        return null;
    }

    return (
        <div>
            <p className="text-sm font-medium mb-3 text-light-700 capitalize block">{characteristicName.toLowerCase()}:</p>
            <div className="flex flex-wrap gap-2">
                {colors.map((color) => {
                    const isDisabled = color.in_stock <= 0;
                    const slug = color.slug ?? color.name;
                    if (!slug) return null; 
                    const isSelected = selectedVariantSlug === slug;
                    
                    return (
                        <button 
                            key={slug}
                            type="button"
                            onClick={() => !isDisabled && onVariantSelect(slug)}
                            disabled={isDisabled}
                            className={clsx(
                                // --- Общие стили кнопки ---
                                "relative flex cursor-pointer items-center justify-center rounded-lg border px-4 py-2 text-sm font-medium uppercase transition-colors duration-150 focus:outline-none",
                                
                                // --- Стили для НЕДОСТУПНОГО варианта ---
                                isDisabled && 'cursor-not-allowed border-light-200 bg-light-50 text-light-400 opacity-70',
                                
                                // --- Стили для ДОСТУПНОГО варианта ---
                                !isDisabled && 
                                    // --- Стили для ВЫБРАННОГО и доступного варианта ---
                                    (isSelected 
                                        ? 'border-transparent bg-black text-white shadow-sm'
                                        // --- Стили для НЕВЫБРАННОГО и доступного варианта ---
                                        : 'border-light-300 bg-white text-light-700 hover:bg-light-100'
                                    )
                            )}
                            aria-pressed={isSelected}
                            title={isDisabled ? `${color.name?.toLowerCase()} (нет в наличии)` : color.name?.toLowerCase()}
                        >
                            <span className={clsx(isDisabled && 'line-through')}>{color.name?.toLowerCase()}</span>
                         </button>
                    );
                })}
            </div>
        </div>
    );
};

export default ProductVariantSelector; 