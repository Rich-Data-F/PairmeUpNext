'use client';

import { useState, Fragment } from 'react';
import { Dialog, Transition, Switch } from '@headlessui/react';
import { XMarkIcon, AdjustmentsHorizontalIcon } from '@heroicons/react/24/outline';
import { SearchParams, SearchFacets } from './SearchPage';

interface SearchMobileFiltersProps {
  isOpen: boolean;
  onClose: () => void;
  searchParams: SearchParams;
  onParamsChange: (params: Partial<SearchParams>) => void;
  facets: SearchFacets | null;
}

interface FilterSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function FilterSection({ title, children, defaultOpen = false }: FilterSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-gray-200 pb-6">
      <button
        type="button"
        className="flex w-full items-center justify-between py-3 text-left"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="font-medium text-gray-900">{title}</span>
        <span className="ml-6 flex items-center">
          {isOpen ? (
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5 10a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
          )}
        </span>
      </button>
      {isOpen && (
        <div className="pt-3">
          {children}
        </div>
      )}
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
    <div className="flex items-center">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
      />
      <label htmlFor={id} className="ml-3 text-sm text-gray-600 flex-1 flex items-center justify-between">
        <span>{label}</span>
        {count !== undefined && (
          <span className="text-gray-400 text-xs">({count})</span>
        )}
      </label>
    </div>
  );
}

export function SearchMobileFilters({
  isOpen,
  onClose,
  searchParams,
  onParamsChange,
  facets
}: SearchMobileFiltersProps) {
  const [tempParams, setTempParams] = useState<SearchParams>(searchParams);

  const updateTempParams = (updates: Partial<SearchParams>) => {
    setTempParams(prev => ({ ...prev, ...updates }));
  };

  const handleApplyFilters = () => {
    onParamsChange(tempParams);
    onClose();
  };

  const handleClearFilters = () => {
    const clearedParams: SearchParams = {
      query: tempParams.query,
      brands: [],
      models: [],
      conditions: [],
      cities: [],
      minPrice: '',
      maxPrice: '',
      isVerified: false,
      hasImages: false,
      sortBy: 'relevance',
      page: 1
    };
    setTempParams(clearedParams);
  };

  const handleBrandChange = (brandId: string, checked: boolean) => {
    const newBrands = checked
      ? [...tempParams.brands, brandId]
      : tempParams.brands.filter(id => id !== brandId);
    updateTempParams({ brands: newBrands });
  };

  const handleModelChange = (modelId: string, checked: boolean) => {
    const newModels = checked
      ? [...tempParams.models, modelId]
      : tempParams.models.filter(id => id !== modelId);
    updateTempParams({ models: newModels });
  };

  const handleConditionChange = (condition: string, checked: boolean) => {
    const newConditions = checked
      ? [...tempParams.conditions, condition]
      : tempParams.conditions.filter(c => c !== condition);
    updateTempParams({ conditions: newConditions });
  };

  const handleCityChange = (cityId: string, checked: boolean) => {
    const newCities = checked
      ? [...tempParams.cities, cityId]
      : tempParams.cities.filter(id => id !== cityId);
    updateTempParams({ cities: newCities });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (tempParams.brands.length > 0) count++;
    if (tempParams.models.length > 0) count++;
    if (tempParams.conditions.length > 0) count++;
    if (tempParams.cities.length > 0) count++;
    if (tempParams.minPrice || tempParams.maxPrice) count++;
    if (tempParams.isVerified) count++;
    if (tempParams.hasImages) count++;
    return count;
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-in-out duration-500"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-500"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-500 sm:duration-700"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-500 sm:duration-700"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                  <div className="flex h-full flex-col overflow-y-scroll bg-white shadow-xl">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-6 border-b border-gray-200">
                      <div className="flex items-center">
                        <AdjustmentsHorizontalIcon className="h-6 w-6 text-gray-600 mr-2" />
                        <Dialog.Title className="text-lg font-medium text-gray-900">
                          Filters
                        </Dialog.Title>
                        {getActiveFiltersCount() > 0 && (
                          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {getActiveFiltersCount()}
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        onClick={onClose}
                      >
                        <XMarkIcon className="h-6 w-6" />
                      </button>
                    </div>

                    {/* Filter Content */}
                    <div className="flex-1 px-4 py-6 space-y-6">
                      {/* Quick Filters */}
                      <FilterSection title="Quick Filters" defaultOpen>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">Verified Only</span>
                            <Switch
                              checked={tempParams.isVerified}
                              onChange={(checked) => updateTempParams({ isVerified: checked })}
                              className={`${
                                tempParams.isVerified ? 'bg-blue-600' : 'bg-gray-200'
                              } relative inline-flex h-6 w-11 items-center rounded-full`}
                            >
                              <span
                                className={`${
                                  tempParams.isVerified ? 'translate-x-6' : 'translate-x-1'
                                } inline-block h-4 w-4 transform rounded-full bg-white transition`}
                              />
                            </Switch>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-gray-700">Has Images</span>
                            <Switch
                              checked={tempParams.hasImages}
                              onChange={(checked) => updateTempParams({ hasImages: checked })}
                              className={`${
                                tempParams.hasImages ? 'bg-blue-600' : 'bg-gray-200'
                              } relative inline-flex h-6 w-11 items-center rounded-full`}
                            >
                              <span
                                className={`${
                                  tempParams.hasImages ? 'translate-x-6' : 'translate-x-1'
                                } inline-block h-4 w-4 transform rounded-full bg-white transition`}
                              />
                            </Switch>
                          </div>
                        </div>
                      </FilterSection>

                      {/* Price Range */}
                      <FilterSection title="Price Range">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label htmlFor="mobile-min-price" className="block text-sm font-medium text-gray-700 mb-1">
                              Min Price
                            </label>
                            <input
                              type="number"
                              id="mobile-min-price"
                              placeholder="0"
                              value={tempParams.minPrice}
                              onChange={(e) => updateTempParams({ minPrice: e.target.value })}
                              className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label htmlFor="mobile-max-price" className="block text-sm font-medium text-gray-700 mb-1">
                              Max Price
                            </label>
                            <input
                              type="number"
                              id="mobile-max-price"
                              placeholder="Any"
                              value={tempParams.maxPrice}
                              onChange={(e) => updateTempParams({ maxPrice: e.target.value })}
                              className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                        </div>
                      </FilterSection>

                      {/* Brands */}
                      {facets?.brands && facets.brands.length > 0 && (
                        <FilterSection title="Brands">
                          <div className="space-y-3 max-h-48 overflow-y-auto">
                            {facets.brands.map((brand) => (
                              <CheckboxOption
                                key={brand.id}
                                id={`mobile-brand-${brand.id}`}
                                label={brand.name}
                                count={brand.count}
                                checked={tempParams.brands.includes(brand.id)}
                                onChange={(checked) => handleBrandChange(brand.id, checked)}
                              />
                            ))}
                          </div>
                        </FilterSection>
                      )}

                      {/* Models */}
                      {facets?.models && facets.models.length > 0 && (
                        <FilterSection title="Models">
                          <div className="space-y-3 max-h-48 overflow-y-auto">
                            {facets.models.map((model) => (
                              <CheckboxOption
                                key={model.id}
                                id={`mobile-model-${model.id}`}
                                label={model.name}
                                count={model.count}
                                checked={tempParams.models.includes(model.id)}
                                onChange={(checked) => handleModelChange(model.id, checked)}
                              />
                            ))}
                          </div>
                        </FilterSection>
                      )}

                      {/* Condition */}
                      {facets?.conditions && facets.conditions.length > 0 && (
                        <FilterSection title="Condition">
                          <div className="space-y-3">
                            {facets.conditions.map((condition) => (
                              <CheckboxOption
                                key={condition.value}
                                id={`mobile-condition-${condition.value}`}
                                label={condition.label}
                                count={condition.count}
                                checked={tempParams.conditions.includes(condition.value)}
                                onChange={(checked) => handleConditionChange(condition.value, checked)}
                              />
                            ))}
                          </div>
                        </FilterSection>
                      )}

                      {/* Cities */}
                      {facets?.cities && facets.cities.length > 0 && (
                        <FilterSection title="Cities">
                          <div className="space-y-3 max-h-48 overflow-y-auto">
                            {facets.cities.map((city) => (
                              <CheckboxOption
                                key={city.id}
                                id={`mobile-city-${city.id}`}
                                label={city.name}
                                count={city.count}
                                checked={tempParams.cities.includes(city.id)}
                                onChange={(checked) => handleCityChange(city.id, checked)}
                              />
                            ))}
                          </div>
                        </FilterSection>
                      )}
                    </div>

                    {/* Footer */}
                    <div className="border-t border-gray-200 px-4 py-6">
                      <div className="flex space-x-3">
                        <button
                          type="button"
                          onClick={handleClearFilters}
                          className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                          Clear All
                        </button>
                        <button
                          type="button"
                          onClick={handleApplyFilters}
                          className="flex-1 rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                          Apply Filters
                        </button>
                      </div>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
