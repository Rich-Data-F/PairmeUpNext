'use client';

import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { 
  ExclamationTriangleIcon, 
  MagnifyingGlassIcon,
  PlusIcon,
  ShieldCheckIcon,
  ClockIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';

interface LostReport {
  id: string;
  title: string;
  description: string;
  brand: string;
  model: string;
  color: string;
  lastSeenLocation: string;
  lastSeenDate: string;
  rewardAmount?: number;
  contactEmail: string;
  status: 'ACTIVE' | 'FOUND' | 'CLOSED';
  images: string[];
  createdAt: string;
}

export function LostStolenPage() {
  const [activeTab, setActiveTab] = useState<'search' | 'report'>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [reports, setReports] = useState<LostReport[]>([
    {
      id: '1',
      title: 'Lost Apple AirPods Pro (Left Earbud)',
      description: 'Lost left earbud from AirPods Pro 2nd generation. Has custom ear tip.',
      brand: 'Apple',
      model: 'AirPods Pro 2',
      color: 'White',
      lastSeenLocation: 'Central Park, New York',
      lastSeenDate: '2025-09-10',
      rewardAmount: 50,
      contactEmail: 'user@example.com',
      status: 'ACTIVE',
      images: [],
      createdAt: '2025-09-10T14:30:00Z'
    },
    {
      id: '2',
      title: 'Stolen Samsung Galaxy Buds Pro',
      description: 'Complete set stolen from gym locker. Black color with custom case.',
      brand: 'Samsung',
      model: 'Galaxy Buds Pro',
      color: 'Black',
      lastSeenLocation: 'Fitness First Gym, London',
      lastSeenDate: '2025-09-08',
      rewardAmount: 100,
      contactEmail: 'victim@example.com',
      status: 'ACTIVE',
      images: [],
      createdAt: '2025-09-08T16:45:00Z'
    }
  ]);

  const [reportForm, setReportForm] = useState({
    title: '',
    description: '',
    brand: '',
    model: '',
    color: '',
    lastSeenLocation: '',
    lastSeenDate: '',
    rewardAmount: '',
    contactEmail: '',
    incidentType: 'lost' as 'lost' | 'stolen'
  });

  const filteredReports = reports.filter(report =>
    report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    report.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
    report.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
    report.lastSeenLocation.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!reportForm.title || !reportForm.description || !reportForm.brand || !reportForm.contactEmail) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      // TODO: Replace with actual API call
      const newReport: LostReport = {
        id: Date.now().toString(),
        title: reportForm.title,
        description: reportForm.description,
        brand: reportForm.brand,
        model: reportForm.model,
        color: reportForm.color,
        lastSeenLocation: reportForm.lastSeenLocation,
        lastSeenDate: reportForm.lastSeenDate,
        rewardAmount: reportForm.rewardAmount ? parseFloat(reportForm.rewardAmount) : undefined,
        contactEmail: reportForm.contactEmail,
        status: 'ACTIVE',
        images: [],
        createdAt: new Date().toISOString()
      };

      setReports(prev => [newReport, ...prev]);
      
      // Reset form
      setReportForm({
        title: '',
        description: '',
        brand: '',
        model: '',
        color: '',
        lastSeenLocation: '',
        lastSeenDate: '',
        rewardAmount: '',
        contactEmail: '',
        incidentType: 'lost'
      });

      toast.success('Report submitted successfully!');
      setActiveTab('search');
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
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Lost & Found Registry</h1>
            <p className="text-xl text-gray-600 mb-8">
              Help recover lost or stolen earbuds through our secure community registry
            </p>

            {/* Tab Navigation */}
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => setActiveTab('search')}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  activeTab === 'search'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <MagnifyingGlassIcon className="w-5 h-5 inline mr-2" />
                Search Reports
              </button>
              <button
                onClick={() => setActiveTab('report')}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  activeTab === 'report'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <PlusIcon className="w-5 h-5 inline mr-2" />
                Report Lost/Stolen
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'search' ? (
          <>
            {/* Search Section */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by brand, model, location..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <ExclamationTriangleIcon className="w-12 h-12 text-red-500 mx-auto mb-3" />
                <div className="text-2xl font-bold text-gray-900">{reports.filter(r => r.status === 'ACTIVE').length}</div>
                <div className="text-sm text-gray-600">Active Reports</div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <ShieldCheckIcon className="w-12 h-12 text-green-500 mx-auto mb-3" />
                <div className="text-2xl font-bold text-gray-900">{reports.filter(r => r.status === 'FOUND').length}</div>
                <div className="text-sm text-gray-600">Successfully Recovered</div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-6 text-center">
                <ClockIcon className="w-12 h-12 text-blue-500 mx-auto mb-3" />
                <div className="text-2xl font-bold text-gray-900">72h</div>
                <div className="text-sm text-gray-600">Average Recovery Time</div>
              </div>
            </div>

            {/* Reports List */}
            <div className="space-y-6">
              {filteredReports.map((report) => (
                <div key={report.id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{report.title}</h3>
                      <p className="text-gray-600 mb-3">{report.description}</p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-gray-700">Brand:</span>
                          <p className="text-gray-600">{report.brand} {report.model}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Color:</span>
                          <p className="text-gray-600">{report.color}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Last Seen:</span>
                          <p className="text-gray-600">{new Date(report.lastSeenDate).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-700">Location:</span>
                          <p className="text-gray-600 flex items-center">
                            <MapPinIcon className="w-4 h-4 mr-1" />
                            {report.lastSeenLocation}
                          </p>
                        </div>
                      </div>

                      {report.rewardAmount && (
                        <div className="mt-3 p-3 bg-green-50 rounded-lg">
                          <p className="text-green-800 font-medium">
                            💰 Reward: €{report.rewardAmount}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="ml-6 text-center">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                        report.status === 'ACTIVE' ? 'bg-red-100 text-red-800' :
                        report.status === 'FOUND' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {report.status}
                      </span>
                      <button className="mt-3 block w-full px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700">
                        Contact Reporter
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {filteredReports.length === 0 && (
                <div className="text-center py-12">
                  <ExclamationTriangleIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No reports found</h3>
                  <p className="text-gray-600">Try adjusting your search criteria or report a lost item.</p>
                </div>
              )}
            </div>
          </>
        ) : (
          /* Report Form */
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Report Lost or Stolen Earbuds</h2>
            
            <form onSubmit={handleSubmitReport} className="space-y-6">
              {/* Incident Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Incident Type</label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="lost"
                      checked={reportForm.incidentType === 'lost'}
                      onChange={(e) => setReportForm({...reportForm, incidentType: e.target.value as 'lost' | 'stolen'})}
                      className="mr-2"
                    />
                    Lost
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="stolen"
                      checked={reportForm.incidentType === 'stolen'}
                      onChange={(e) => setReportForm({...reportForm, incidentType: e.target.value as 'lost' | 'stolen'})}
                      className="mr-2"
                    />
                    Stolen
                  </label>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                <input
                  type="text"
                  value={reportForm.title}
                  onChange={(e) => setReportForm({...reportForm, title: e.target.value})}
                  placeholder="e.g., Lost Apple AirPods Pro (Left Earbud)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                <textarea
                  value={reportForm.description}
                  onChange={(e) => setReportForm({...reportForm, description: e.target.value})}
                  placeholder="Detailed description of the item and circumstances..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Brand and Model */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Brand *</label>
                  <input
                    type="text"
                    value={reportForm.brand}
                    onChange={(e) => setReportForm({...reportForm, brand: e.target.value})}
                    placeholder="e.g., Apple"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Model</label>
                  <input
                    type="text"
                    value={reportForm.model}
                    onChange={(e) => setReportForm({...reportForm, model: e.target.value})}
                    placeholder="e.g., AirPods Pro 2"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Color and Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                  <input
                    type="text"
                    value={reportForm.color}
                    onChange={(e) => setReportForm({...reportForm, color: e.target.value})}
                    placeholder="e.g., White"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Seen Date</label>
                  <input
                    type="date"
                    value={reportForm.lastSeenDate}
                    onChange={(e) => setReportForm({...reportForm, lastSeenDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Last Seen Location</label>
                <input
                  type="text"
                  value={reportForm.lastSeenLocation}
                  onChange={(e) => setReportForm({...reportForm, lastSeenLocation: e.target.value})}
                  placeholder="e.g., Central Park, New York"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Reward and Contact */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Reward Amount (€)</label>
                  <input
                    type="number"
                    value={reportForm.rewardAmount}
                    onChange={(e) => setReportForm({...reportForm, rewardAmount: e.target.value})}
                    placeholder="Optional reward amount"
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Contact Email *</label>
                  <input
                    type="email"
                    value={reportForm.contactEmail}
                    onChange={(e) => setReportForm({...reportForm, contactEmail: e.target.value})}
                    placeholder="your@email.com"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
                >
                  Submit Report
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
