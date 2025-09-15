'use client';

import { useState, useEffect } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { SearchParams, SearchFacets } from './SearchPage';

interface SearchFiltersProps {
  facets: SearchFacets | null;
  filters: SearchParams;
  onFiltersChange: (filters: Partial<SearchParams>) => void;
  loading: boolean;
}

interface FilterSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function FilterSection({ title, children, defaultOpen = true }: FilterSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-gray-200 py-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between text-left"
      >
        <span className="text-sm font-medium text-gray-900">{title}</span>
        {isOpen ? (
          <ChevronUpIcon className="h-5 w-5 text-gray-400" />
        ) : (
          <ChevronDownIcon className="h-5 w-5 text-gray-400" />
        )}
      </button>
      {isOpen && <div className="mt-4 space-y-3">{children}</div>}
    </div>
  );
}

interface CheckboxOptionProps {
  id: string;
  label: string;
  count?: number;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

function CheckboxOption({ id, label, count, checked, onChange }: CheckboxOptionProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center">
        <input
          type="checkbox"
          id={id}
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor={id} className="ml-3 text-sm text-gray-700">
          {label}
        </label>
      </div>
      {count !== undefined && (
        <span className="text-xs text-gray-500">({count})</span>
      )}
    </div>
  );
}

// Condition labels mapping
const conditionLabels: Record<string, string> = {
  NEW: 'New',
  LIKE_NEW: 'Like New',
  GOOD: 'Good',
  FAIR: 'Fair',
  PARTS_ONLY: 'Parts Only'
};

export function SearchFilters({ facets, filters, onFiltersChange, loading }: SearchFiltersProps) {
  // Local state for price inputs to avoid immediate API calls on every keystroke
  const [localMinPrice, setLocalMinPrice] = useState(filters.minPrice || '');
  const [localMaxPrice, setLocalMaxPrice] = useState(filters.maxPrice || '');
  
  // Update local price state when filters change from outside (e.g., URL params)
  useEffect(() => {
    setLocalMinPrice(filters.minPrice || '');
    setLocalMaxPrice(filters.maxPrice || '');
  }, [filters.minPrice, filters.maxPrice]);

  // Debounce price changes to avoid excessive API calls
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      // Only update if the local values differ from filter values
      if (localMinPrice !== (filters.minPrice || '') || localMaxPrice !== (filters.maxPrice || '')) {
        onFiltersChange({
          minPrice: localMinPrice || undefined,
          maxPrice: localMaxPrice || undefined,
          page: 1 // Reset to first page when filters change
        });
      }
    }, 800); // 800ms delay for better UX

    return () => clearTimeout(timeoutId);
  }, [localMinPrice, localMaxPrice, filters.minPrice, filters.maxPrice, onFiltersChange]);

  // Handle brand filter changes
  const handleBrandChange = (brandId: string, checked: boolean) => {
    const currentBrands = filters.brands || [];
    const newBrands = checked
      ? [...currentBrands, brandId]
      : currentBrands.filter(id => id !== brandId);
    
    onFiltersChange({ brands: newBrands, page: 1 });
  };

  // Handle model filter changes
  const handleModelChange = (modelId: string, checked: boolean) => {
    const currentModels = filters.models || [];
    const newModels = checked
      ? [...currentModels, modelId]
      : currentModels.filter(id => id !== modelId);
    
    onFiltersChange({ models: newModels, page: 1 });
  };

  // Handle condition filter changes
  const handleConditionChange = (condition: string, checked: boolean) => {
    const currentConditions = filters.conditions || [];
    const newConditions = checked
      ? [...currentConditions, condition]
      : currentConditions.filter(c => c !== condition);
    
    onFiltersChange({ conditions: newConditions, page: 1 });
  };

  // Handle city filter changes
  const handleCityChange = (cityId: string, checked: boolean) => {
    const currentCities = filters.cities || [];
    const newCities = checked
      ? [...currentCities, cityId]
      : currentCities.filter(id => id !== cityId);
    
    onFiltersChange({ cities: newCities, page: 1 });
  };

  // Handle verified toggle
  const handleVerifiedChange = (checked: boolean) => {
    onFiltersChange({ isVerified: checked, page: 1 });
  };

  // Handle images toggle
  const handleImagesChange = (checked: boolean) => {
    onFiltersChange({ hasImages: checked, page: 1 });
  };

  // Clear all filters
  const clearAllFilters = () => {
    setLocalMinPrice('');
    setLocalMaxPrice('');
    onFiltersChange({
      brands: [],
      models: [],
      conditions: [],
      cities: [],
      minPrice: undefined,
      maxPrice: undefined,
      isVerified: false,
      hasImages: false,
      page: 1,
    });
  };

  // Check if any filters are active
  const hasActiveFilters = () => {
    return (
      (filters.brands && filters.brands.length > 0) ||
      (filters.models && filters.models.length > 0) ||
      (filters.conditions && filters.conditions.length > 0) ||
      (filters.cities && filters.cities.length > 0) ||
      filters.minPrice ||
      filters.maxPrice ||
      filters.isVerified ||
      filters.hasImages
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-gray-900">Filters</h3>
          {hasActiveFilters() && (
            <button
              onClick={clearAllFilters}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Clear all
            </button>
          )}
        </div>

        {loading && (
          <div className="mb-4 p-3 bg-blue-50 rounded-md">
            <p className="text-sm text-blue-700">Loading filters...</p>
          </div>
        )}

        <div className="space-y-0">
          {/* Quick filters */}
          <FilterSection title="Quick Filters">
            <CheckboxOption
              id="verified"
              label="Verified Sellers Only"
              checked={filters.isVerified || false}
              onChange={handleVerifiedChange}
            />
            <CheckboxOption
              id="images"
              label="With Images"
              checked={filters.hasImages || false}
              onChange={handleImagesChange}
            />
          </FilterSection>

          {/* Price Range */}
          <FilterSection title="Price Range">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="min-price" className="block text-xs font-medium text-gray-700 mb-1">
                    Min Price
                  </label>
                  <input
                    type="number"
                    id="min-price"
                    value={localMinPrice}
                    onChange={(e) => setLocalMinPrice(e.target.value)}
                    placeholder="$0"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="max-price" className="block text-xs font-medium text-gray-700 mb-1">
                    Max Price
                  </label>
                  <input
                    type="number"
                    id="max-price"
                    value={localMaxPrice}
                    onChange={(e) => setLocalMaxPrice(e.target.value)}
                    placeholder="$999"
                    className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </FilterSection>

          {/* Condition */}
          <FilterSection title="Condition">
            {['NEW', 'LIKE_NEW', 'GOOD', 'FAIR', 'PARTS_ONLY'].map((condition) => (
              <CheckboxOption
                key={condition}
                id={`condition-${condition}`}
                label={conditionLabels[condition] || condition}
                count={facets?.conditions?.find(c => c.value === condition)?.count}
                checked={(filters.conditions || []).includes(condition)}
                onChange={(checked) => handleConditionChange(condition, checked)}
              />
            ))}
          </FilterSection>

          {/* Brands */}
          {((facets?.brands && facets.brands.length > 0) || (filters.brands && filters.brands.length > 0)) && (
            <FilterSection title="Brands">
              {/* Show selected brands first, even if not in facets yet */}
              {filters.brands && filters.brands.length > 0 && 
               filters.brands.map((brandId) => {
                 // Check if this brand is already in facets
                 const facetBrand = facets?.brands?.find(b => b.id === brandId);
                 if (facetBrand) return null; // Will be rendered below
                 
                 // Show selected brand even if not in facets yet
                 return (
                   <CheckboxOption
                     key={brandId}
                     id={`brand-${brandId}`}
                     label={brandId} // Will show ID until facets load with proper name
                     count={0}
                     checked={true}
                     onChange={(checked) => handleBrandChange(brandId, checked)}
                   />
                 );
               })
              }
              
              {/* Show facets brands */}
              {facets?.brands?.slice(0, 10).map((brand) => (
                <CheckboxOption
                  key={brand.id}
                  id={`brand-${brand.id}`}
                  label={brand.name}
                  count={brand.count}
                  checked={(filters.brands || []).includes(brand.id)}
                  onChange={(checked) => handleBrandChange(brand.id, checked)}
                />
              ))}
              
              {facets?.brands && facets.brands.length > 10 && (
                <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                  Show more brands
                </button>
              )}
            </FilterSection>
          )}

          {/* Models */}
          {facets?.models && facets.models.length > 0 && (
            <FilterSection title="Models" defaultOpen={false}>
              {facets.models.slice(0, 10).map((model) => (
                <CheckboxOption
                  key={model.id}
                  id={`model-${model.id}`}
                  label={model.name}
                  count={model.count}
                  checked={(filters.models || []).includes(model.id)}
                  onChange={(checked) => handleModelChange(model.id, checked)}
                />
              ))}
              {facets.models.length > 10 && (
                <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                  Show more models
                </button>
              )}
            </FilterSection>
          )}

          {/* Cities */}
          {facets?.cities && facets.cities.length > 0 && (
            <FilterSection title="Location" defaultOpen={false}>
              {facets.cities.slice(0, 10).map((city) => (
                <CheckboxOption
                  key={city.id}
                  id={`city-${city.id}`}
                  label={city.name}
                  count={city.count}
                  checked={(filters.cities || []).includes(city.id)}
                  onChange={(checked) => handleCityChange(city.id, checked)}
                />
              ))}
              {facets.cities.length > 10 && (
                <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                  Show more cities
                </button>
              )}
            </FilterSection>
          )}
        </div>
      </div>
    </div>
  );
}
