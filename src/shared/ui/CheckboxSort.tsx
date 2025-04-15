"use client"
import React, { useState, useCallback } from 'react';
import { Checkbox } from "@heroui/react";

// Типы из ProductFilters
interface FilterOption {
  label: string;
  value: string | number;
}
interface FiltersData {
  [key: string]: FilterOption[];
}

// Типы для пропсов CheckboxSort
interface CheckboxSortProps {
  filters: FiltersData;
  onFilterChange: (filterType: string, values: (string | number)[]) => void;
  "aria-labelledby"?: string;
}

const CheckboxSort = ({ filters, onFilterChange, "aria-labelledby": ariaLabelledBy }: CheckboxSortProps) => {
  const [selectedValues, setSelectedValues] = useState<Record<string, Set<string | number>>>({});

  const handleCheckboxChange = useCallback((filterType: string, value: string | number, isChecked: boolean) => {
    let updatedSet: Set<string | number>;
    setSelectedValues(prevSelected => {
      const currentSet = new Set(prevSelected[filterType] || []);
      if (isChecked) {
        currentSet.add(value);
      } else {
        currentSet.delete(value);
      }
      updatedSet = currentSet;
      return {
        ...prevSelected,
        [filterType]: updatedSet
      };
    });

    if (updatedSet !== undefined) {
       onFilterChange(filterType, Array.from(updatedSet));
    }

  }, [onFilterChange]);

  return (
    <div className="flex flex-col space-y-2" aria-labelledby={ariaLabelledBy}>
      {Object.entries(filters).map(([filterType, options]) => {
        const currentSelected = selectedValues[filterType] || new Set();

        return (
          <div key={filterType} className="bg-light rounded-2xl p-3 mb-1">
            <span className="block pb-2 text-sm font-medium text-gray-900">
              {filterType}
            </span>
            <div className="flex flex-col pt-1">
              {options.map((option: FilterOption, index: number) => (
                <div key={option.value} className={index < options.length - 1 ? "mb-1" : ""}>
                  <Checkbox
                    isSelected={currentSelected.has(option.value)}
                    onChange={(e) => handleCheckboxChange(filterType, option.value, e.target.checked)}
                    classNames={{
                      wrapper: "after:bg-black after:text-white text-white",
                      label: "text-sm text-gray-700"
                    }}
                    radius="sm"
                  >
                    {option.label}
                  </Checkbox>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default CheckboxSort;