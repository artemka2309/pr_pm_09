"use client"; // Добавляем директиву

import React from 'react';
import { Spinner } from "@heroui/react";

export default function LoadingSpinner({ label = "Загрузка..." }: { label?: string }) {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)]"> {/* Центрируем и задаем минимальную высоту */}
      <Spinner
        label={label}
        color="primary" // Используем primary для черного цвета
        size="lg"       // Установим большой размер для заметности
        aria-label={label} // Добавляем aria-label для доступности
        variant="spinner"
      />
    </div>
  );
} 