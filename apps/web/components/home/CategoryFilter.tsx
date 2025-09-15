'use client';

import React, { useState } from 'react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

interface Category {
  id: string;
  name: string;
  icon: string;
  count?: number;
}

interface CategoryFilterProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

const categories: Category[] = [
  { id: '', name: 'All Categories', icon: '🎧', count: 15420 },
  { id: 'airpods', name: 'AirPods', icon: '🍎', count: 8520 },
  { id: 'galaxy-buds', name: 'Galaxy Buds', icon: '📱', count: 3240 },
  { id: 'charging-cases', name: 'Charging Cases', icon: '🔋', count: 2150 },
  { id: 'left-earbuds', name: 'Left Earbuds', icon: '⬅️', count: 890 },
  { id: 'right-earbuds', name: 'Right Earbuds', icon: '➡️', count: 620 },
  { id: 'accessories', name: 'Accessories', icon: '🎛️', count: 340 },
  { id: 'other-brands', name: 'Other Brands', icon: '🎵', count: 180 },
];

export function CategoryFilter({ selectedCategory, onCategoryChange }: CategoryFilterProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedCategoryData = categories.find(cat => cat.id === selectedCategory) || categories[0];

  return (
    <div className="relative">
      {/* Desktop View */}
      <div className="hidden md:flex flex-wrap gap-2 justify-center">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={`px-6 py-3 rounded-full font-medium transition-all duration-200 flex items-center space-x-2 ${
              selectedCategory === category.id
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            <span className="text-lg">{category.icon}</span>
            <span>{category.name}</span>
            {category.count && (
              <span className={`text-sm px-2 py-1 rounded-full ${
                selectedCategory === category.id
                  ? 'bg-blue-500 text-blue-100'
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {category.count.toLocaleString()}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Mobile View - Dropdown */}
      <div className="md:hidden">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between px-4 py-3 bg-white border border-gray-200 rounded-lg text-left"
        >
          <div className="flex items-center space-x-3">
            <span className="text-lg">{selectedCategoryData.icon}</span>
            <span className="font-medium">{selectedCategoryData.name}</span>
            {selectedCategoryData.count && (
              <span className="text-sm px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                {selectedCategoryData.count.toLocaleString()}
              </span>
            )}
          </div>
          <ChevronDownIcon 
            className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
          />
        </button>

        {isOpen && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
            <div className="max-h-64 overflow-y-auto">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => {
                    onCategoryChange(category.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 ${
                    selectedCategory === category.id ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">{category.icon}</span>
                    <span className="font-medium">{category.name}</span>
                  </div>
                  {category.count && (
                    <span className={`text-sm px-2 py-1 rounded-full ${
                      selectedCategory === category.id
                        ? 'bg-blue-100 text-blue-600'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {category.count.toLocaleString()}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
