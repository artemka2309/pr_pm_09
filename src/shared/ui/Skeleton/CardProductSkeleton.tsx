import React from 'react';

// Простой компонент-скелетон, не требует сложных типов
export default function CardProductSkeleton(): React.ReactElement {
  return (
    <div className="flex flex-col h-full justify-between space-y-2 overflow-hidden animate-pulse">
      {/* Заменил bg-skeleton на стандартный bg-gray-200 или bg-gray-300 для согласованности */}
      <div className="bg-skeleton h-48 w-full rounded-md"></div>
      <div className="px-2 space-y-1.5">
        <div className="h-4 bg-skeleton rounded"></div>
        <div className="h-4 bg-skeleton rounded w-1/2"></div>
      </div>
      <div className="px-2 pb-1 mt-auto">
        <div className="h-10 bg-skeleton rounded-md"></div>
      </div>
    </div>
  );
} 