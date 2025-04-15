import React from 'react';
import LoadingSpinner from '@/shared/ui/LoadingSpinner'; // Импортируем новый компонент

// --- Основной компонент Loading ---
export default function ProductsLoading() {
  return (
    <LoadingSpinner label="Загрузка главной страницы..." /> // Используем новый спиннер
  );
}