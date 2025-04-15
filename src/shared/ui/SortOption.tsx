"use client"

import React from "react";
import { Select, SelectItem } from "@heroui/react";

// Типы для пропсов
interface SortOptionProps {
  onSortChange: (value: string) => void;
  "aria-label"?: string; // Делаем aria-label необязательным, но рекомендуемым
}

const SortOption = ({ onSortChange, "aria-label": ariaLabel }: SortOptionProps) => {
  const sortOptions = [
    { value: 'default', label: 'по умолчанию' },
    { value: 'PriceAsc', label: 'дешевле' },
    { value: 'PriceDesc', label: 'дороже' },
    { value: 'UpdateAtAsc', label: 'новинки' },
  ];

  return (
    <Select
      label="Сортировка"
      aria-label={ariaLabel || "Сортировка товаров"}
      variant="flat"
      labelPlacement="inside"
      radius="md"
      size="sm"
      onSelectionChange={(keys) => {
        const selectedKey = Array.from(keys)[0];
        if (selectedKey) {
          onSortChange(String(selectedKey));
        }
      }}
    >
      {sortOptions.map((option) => (
        <SelectItem
          key={option.value}
        >
          {option.label}
        </SelectItem>
      ))}
    </Select>
  );
};

export default SortOption;