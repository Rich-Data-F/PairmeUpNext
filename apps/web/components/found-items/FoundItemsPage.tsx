'use client';

import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { 
  CheckCircleIcon, 
  MagnifyingGlassIcon,
  PlusIcon,
  MapPinIcon,
  ClockIcon,
  UserIcon
} from '@heroicons/react/24/outline';

interface FoundItem {
  id: string;
  title: string;
  description: string;
  brand?: string;
  model?: string;
  color: string;
  foundLocation: string;
  foundDate: string;
  contactEmail: string;
  status: 'AVAILABLE' | 'CLAIMED' | 'RETURNED';
  images: string[];
  createdAt: string;
  finderName: string;
}

export function FoundItemsPage() {
  const [activeTab, setActiveTab] = useState<'browse' | 'report'>('browse');
  const [searchQuery, setSearchQuery] = useState('');
  const [foundItems, setFoundItems] = useState<FoundItem[]>([
    {
      id: '1',
      title: 'Found White Wireless Earbuds',
      description: 'Found a single white earbud in the subway station. Looks like Apple AirPods.',
      brand: 'Apple',
      model: 'AirPods',
      color: 'White',
      foundLocation: 'Times Square Subway Station, NYC',
      foundDate: '2025-09-12',
      contactEmail: 'finder@example.com',
      status: 'AVAILABLE',
      images: [],
      createdAt: '2025-09-12T09:15:00Z',
      finderName: 'John D.'
    },
    {
      id: '2',
      title: 'Found Black Earbuds with Case',
      description: 'Complete set of black wireless earbuds with charging case found in coffee shop.',
      brand: 'Samsung',
      model: 'Galaxy Buds',
      color: 'Black',
      foundLocation: 'Starbucks, Oxford Street, London',
      foundDate: '2025-09-11',
      contactEmail: 'goodsamaritan@example.com',
      status: 'AVAILABLE',
      images: [],
      createdAt: '2025-09-11T14:30:00Z',
      finderName: 'Sarah M.'
    },
    {
      id: '3',
      title: 'Found Blue Earbuds',
      description: 'Found blue earbuds in the park. Owner might be looking for them.',
      color: 'Blue',
      foundLocation: 'Hyde Park, London',
      foundDate: '2025-09-09',
      contactEmail: 'parkvisitor@example.com',
      status: 'RETURNED',
      images: [],
      createdAt: '2025-09-09T16:45:00Z',
      finderName: 'Mike R.'
    }
  ]);

  const [reportForm, setReportForm] = useState({
    title: '',
    description: '',
    brand: '',
    model: '',
    color: '',
    foundLocation: '',
    foundDate: '',
    contactEmail: '',
    finderName: ''
  });

  const filteredItems = foundItems.filter(item =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.brand && item.brand.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (item.model && item.model.toLowerCase().includes(searchQuery.toLowerCase())) ||
    item.color.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.foundLocation.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!reportForm.title || !reportForm.description || !reportForm.color || !reportForm.contactEmail || !reportForm.finderName) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      // TODO: Replace with actual API call
      const newFoundItem: FoundItem = {
        id: Date.now().toString(),
        title: reportForm.title,
        description: reportForm.description,
        brand: reportForm.brand || undefined,
        model: reportForm.model || undefined,
        color: reportForm.color,
        foundLocation: reportForm.foundLocation,
        foundDate: reportForm.foundDate,
        contactEmail: reportForm.contactEmail,
        status: 'AVAILABLE',
        images: [],
        createdAt: new Date().toISOString(),
        finderName: reportForm.finderName
      };

      setFoundItems(prev => [newFoundItem, ...prev]);
      
      // Reset form
      setReportForm({
        title: '',
        description: '',
        brand: '',
        model: '',
        color: '',
        foundLocation: '',
        foundDate: '',
        contactEmail: '',
        finderName: ''
      });

      toast.success('Found item reported successfully!');
      setActiveTab('browse');
    } catch (error) {
      toast.error('Failed to submit report');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Found Items</h1>
            <p className="text-xl text-gray-600 mb-8">
              Help reunite found earbuds with their owners through our community platform
            </p>

            {/* Tab Navigation */}
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setActiveTab('browse')}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  activeTab === 'browse'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <CheckCircleIcon className="w-5 h-5 inline mr-2" />
                Browse Found Items
              </button>
              <button
                onClick={() => setActiveTab('report')}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  activeTab === 'report'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <PlusIcon className="w-5 h-5 inline mr-2" />
                Report Found Item
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'browse' ? (
          <>
            {/* Search Section */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by brand, model, color, location..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <CheckCircleIcon className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <div className="text-2xl font-bold text-gray-900">{foundItems.filter(i => i.status === 'AVAILABLE').length}</div>
                <div className="text-sm text-gray-600">Available Items</div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <UserIcon className="w-12 h-12 text-blue-500 mx-auto mb-3" />
                <div className="text-2xl font-bold text-gray-900">{foundItems.filter(i => i.status === 'RETURNED').length}</div>
                <div className="text-sm text-gray-600">Successfully Returned</div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <ClockIcon className="w-12 h-12 text-orange-500 mx-auto mb-3" />
                <div className="text-2xl font-bold text-gray-900">24h</div>
                <div className="text-sm text-gray-600">Average Response Time</div>
              </div>
            </div>

            {/* Found Items List */}
            <div className="space-y-6">
              {filteredItems.map((item) => (
                <div key={item.id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.title}</h3>
                      <p className="text-gray-600 mb-3">{item.description}</p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                        <div>
                          <span className="font-medium text-gray-700">Brand/Model:</span>
                          <p className="text-gray-600">{item.brand || 'Unknown'} {item.model || ''}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Color:</span>
                          <p className="text-gray-600">{item.color}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Found Date:</span>
                          <p className="text-gray-600">{new Date(item.foundDate).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Location:</span>
                          <p className="text-gray-600 flex items-center">
                            <MapPinIcon className="w-4 h-4 mr-1" />
                            {item.foundLocation}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center text-sm text-gray-600">
                        <UserIcon className="w-4 h-4 mr-1" />
                        <span>Found by: {item.finderName}</span>
                      </div>
                    </div>

                    <div className="ml-6 text-center">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium mb-3 ${
                        item.status === 'AVAILABLE' ? 'bg-green-100 text-green-800' :
                        item.status === 'RETURNED' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {item.status}
                      </span>
                      {item.status === 'AVAILABLE' && (
                        <button className="block w-full px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700">
                          Claim Item
                        </button>
                      )}
                      {item.status === 'RETURNED' && (
                        <div className="text-xs text-gray-500">✅ Returned to Owner</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {filteredItems.length === 0 && (
                <div className="text-center py-12">
                  <CheckCircleIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No found items match your search</h3>
                  <p className="text-gray-600">Try adjusting your search criteria or check back later.</p>
                </div>
              )}
            </div>
          </>
        ) : (
          /* Report Found Item Form */
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Report Found Earbuds</h2>
            
            <form onSubmit={handleSubmitReport} className="space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                <input
                  type="text"
                  value={reportForm.title}
                  onChange={(e) => setReportForm({...reportForm, title: e.target.value})}
                  placeholder="e.g., Found White Wireless Earbuds"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                <textarea
                  value={reportForm.description}
                  onChange={(e) => setReportForm({...reportForm, description: e.target.value})}
                  placeholder="Detailed description of the found item..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Brand and Model */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Brand (if known)</label>
                  <input
                    type="text"
                    value={reportForm.brand}
                    onChange={(e) => setReportForm({...reportForm, brand: e.target.value})}
                    placeholder="e.g., Apple"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Model (if known)</label>
                  <input
                    type="text"
                    value={reportForm.model}
                    onChange={(e) => setReportForm({...reportForm, model: e.target.value})}
                    placeholder="e.g., AirPods Pro"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Color and Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Color *</label>
                  <input
                    type="text"
                    value={reportForm.color}
                    onChange={(e) => setReportForm({...reportForm, color: e.target.value})}
                    placeholder="e.g., White"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Found Date</label>
                  <input
                    type="date"
                    value={reportForm.foundDate}
                    onChange={(e) => setReportForm({...reportForm, foundDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Found Location</label>
                <input
                  type="text"
                  value={reportForm.foundLocation}
                  onChange={(e) => setReportForm({...reportForm, foundLocation: e.target.value})}
                  placeholder="e.g., Central Park, New York"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              {/* Finder Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Your Name *</label>
                  <input
                    type="text"
                    value={reportForm.finderName}
                    onChange={(e) => setReportForm({...reportForm, finderName: e.target.value})}
                    placeholder="First name or initials"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contact Email *</label>
                  <input
                    type="email"
                    value={reportForm.contactEmail}
                    onChange={(e) => setReportForm({...reportForm, contactEmail: e.target.value})}
                    placeholder="your@email.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                >
                  Report Found Item
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
