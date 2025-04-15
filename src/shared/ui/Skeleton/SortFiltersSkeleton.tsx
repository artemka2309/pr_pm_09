"use client";
import React from "react";

// Переименовал в SortFiltersSkeleton для ясности
export default function SortFiltersSkeleton(): React.ReactElement {
    return (
        <div className="animate-pulse space-y-4">
            {/* Фильтры */}
            <div>
                <div className="h-10 bg-skeleton rounded-lg"></div>
                <div className="mt-2 space-y-2">
                    <div className="h-6 w-1/2 bg-skeleton rounded-md"></div>
                    {/* Дополнительные плейсхолдеры фильтров можно добавить здесь */}
                </div>
            </div>

            {/* Сортировка */}
            {/* <div>
                <div className="h-8 bg-skeleton rounded-md w-1/3"></div>
            </div> */}
        </div>
    );
} 