"use client"
import React, { useState, useCallback } from 'react';
import { Select, SelectItem, Button } from "@heroui/react";

// Определяем типы для пропсов
interface FilterOption {
  label: string;
  value: string | number; // Значение может быть строкой или числом
}

interface FiltersData {
  [key: string]: FilterOption[]; // Объект, где ключ - строка, значение - массив FilterOption
}

interface DropdownMenuProps {
  filters: FiltersData;
  onFilterChange: (filterType: string, newSelectedValues: (string | number)[]) => void;
}

export default function DropdownMenu({ filters, onFilterChange }: DropdownMenuProps) {
  const handleSelectionChange = useCallback((filterType: string, newSelectedKeys: Set<string | number>) => {
    onFilterChange(filterType, Array.from(newSelectedKeys));
  }, [onFilterChange]);

  return (
    <>
      {Object.keys(filters).map((filterType: string) => (
        <Select
          key={filterType}
          label={filterType}
          selectionMode="multiple"
          onSelectionChange={(newSelectedKeys: Set<string | number>) => handleSelectionChange(filterType, newSelectedKeys)}
          variant="flat"
          labelPlacement="inside"
          radius="md"
          size="sm"
          aria-label={`Фильтр по ${filterType}`}
        >
          {filters[filterType].map((filter: FilterOption) => (
            <SelectItem
              key={filter.value}
            >
              {filter.label}
            </SelectItem>
          ))}
        </Select>
      ))}
    </>
  );
}