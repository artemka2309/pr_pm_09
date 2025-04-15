"use client";
import React from "react";

export default function CheckboxSortSkeleton(): React.ReactElement {
    return (
        <div className="animate-pulse">
            <div className="space-y-4">
                {[...Array(3)].map((_, index) => (
                    <div key={index} className="space-y-2">
                        {/* Имитация заголовка группы чекбоксов */}
                        <div className="h-6 bg-skeleton rounded w-2/3 mb-2"></div>
                        {/* Имитация чекбоксов */}
                        <div className="flex flex-col space-y-2">
                            {[...Array(3)].map((_, subIndex) => (
                                <div key={subIndex} className="flex items-center space-x-2">
                                    <div className="w-6 h-6 bg-skeleton rounded-lg"></div>
                                    <div className="h-5 bg-skeleton rounded w-5/6"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
} 