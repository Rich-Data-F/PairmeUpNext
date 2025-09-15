'use client';

import React, { useState } from 'react';
import { 
  CalendarIcon,
  UserIcon,
  TagIcon,
  MagnifyingGlassIcon,
  ClockIcon,
  EyeIcon,
  ChatBubbleLeftIcon
} from '@heroicons/react/24/outline';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: {
    name: string;
    avatar?: string;
  };
  publishedAt: string;
  readTime: number;
  views: number;
  comments: number;
  tags: string[];
  featured?: boolean;
  coverImage?: string;
}

export function BlogPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const blogPosts: BlogPost[] = [
    {
      id: '1',
      title: 'The Ultimate Guide to Wireless Earbuds in 2025',
      slug: 'ultimate-guide-wireless-earbuds-2025',
      excerpt: 'Everything you need to know about choosing the perfect wireless earbuds, from sound quality to battery life and beyond.',
      content: '',
      author: {
        name: 'Sarah Johnson',
        avatar: '/avatars/sarah.jpg'
      },
      publishedAt: '2025-09-15T10:00:00Z',
      readTime: 8,
      views: 1247,
      comments: 23,
      tags: ['Guide', 'Technology', 'Reviews'],
      featured: true,
      coverImage: '/blog/wireless-earbuds-guide.jpg'
    },
    {
      id: '2',
      title: 'How to Keep Your Earbuds Safe and Sound',
      slug: 'keep-earbuds-safe-sound',
      excerpt: 'Tips and tricks to prevent losing your precious earbuds and keeping them in perfect condition.',
      content: '',
      author: {
        name: 'Mike Chen',
        avatar: '/avatars/mike.jpg'
      },
      publishedAt: '2025-09-12T14:30:00Z',
      readTime: 5,
      views: 892,
      comments: 15,
      tags: ['Tips', 'Care', 'Prevention'],
      featured: false
    },
    {
      id: '3',
      title: 'Community Success Stories: Reunited with Lost Earbuds',
      slug: 'community-success-stories-reunited',
      excerpt: 'Heartwarming stories from our community members who successfully found their lost earbuds through PairAgain.',
      content: '',
      author: {
        name: 'Emma Williams',
        avatar: '/avatars/emma.jpg'
      },
      publishedAt: '2025-09-10T09:15:00Z',
      readTime: 6,
      views: 654,
      comments: 31,
      tags: ['Community', 'Success Stories', 'Lost & Found'],
      featured: false
    },
    {
      id: '4',
      title: 'Top 10 Most Popular Earbud Brands of 2025',
      slug: 'top-10-earbud-brands-2025',
      excerpt: 'Discover the most sought-after earbud brands based on our marketplace data and user preferences.',
      content: '',
      author: {
        name: 'David Park',
        avatar: '/avatars/david.jpg'
      },
      publishedAt: '2025-09-08T16:45:00Z',
      readTime: 7,
      views: 1103,
      comments: 18,
      tags: ['Brands', 'Statistics', 'Market Trends'],
      featured: false
    },
    {
      id: '5',
      title: 'Audio Quality vs Price: Finding the Sweet Spot',
      slug: 'audio-quality-vs-price-sweet-spot',
      excerpt: 'An in-depth analysis of how audio quality correlates with price points across different earbud categories.',
      content: '',
      author: {
        name: 'Lisa Thompson',
        avatar: '/avatars/lisa.jpg'
      },
      publishedAt: '2025-09-05T11:20:00Z',
      readTime: 9,
      views: 876,
      comments: 27,
      tags: ['Audio Quality', 'Price Analysis', 'Buying Guide'],
      featured: false
    }
  ];

  const allTags = Array.from(new Set(blogPosts.flatMap(post => post.tags)));

  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = searchQuery === '' || 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesTag = selectedTag === null || post.tags.includes(selectedTag);
    
    return matchesSearch && matchesTag;
  });

  const featuredPost = blogPosts.find(post => post.featured);
  const otherPosts = filteredPosts.filter(post => !post.featured || selectedTag !== null || searchQuery !== '');

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">PairAgain Blog</h1>
            <p className="text-xl text-gray-600 mb-8">
              Latest insights, tips, and stories from the earbud community
            </p>

            {/* Search */}
            <div className="max-w-md mx-auto">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search articles..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tags Filter */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedTag(null)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedTag === null
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              All
            </button>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedTag === tag
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Featured Post */}
        {featuredPost && selectedTag === null && searchQuery === '' && (
          <div className="mb-12">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <div className="md:flex">
                <div className="md:w-1/2">
                  <div className="h-64 md:h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <div className="text-white text-center p-8">
                      <h3 className="text-2xl font-bold mb-2">Featured Article</h3>
                      <p className="text-blue-100">Most popular this week</p>
                    </div>
                  </div>
                </div>
                <div className="md:w-1/2 p-8">
                  <div className="flex items-center space-x-2 text-sm text-gray-600 mb-3">
                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                      Featured
                    </span>
                    <CalendarIcon className="w-4 h-4" />
                    <span>{formatDate(featuredPost.publishedAt)}</span>
                  </div>
                  
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">{featuredPost.title}</h2>
                  <p className="text-gray-600 mb-6">{featuredPost.excerpt}</p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <UserIcon className="w-4 h-4" />
                        <span>{featuredPost.author.name}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <ClockIcon className="w-4 h-4" />
                        <span>{featuredPost.readTime} min read</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-4">
                    {featuredPost.tags.map((tag) => (
                      <span key={tag} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        <TagIcon className="w-3 h-3 mr-1" />
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    Read More
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {otherPosts.map((post) => (
            <article key={post.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-48 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                <div className="text-gray-500 text-center p-4">
                  <h4 className="font-medium text-lg">{post.title}</h4>
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex items-center space-x-2 text-sm text-gray-600 mb-3">
                  <CalendarIcon className="w-4 h-4" />
                  <span>{formatDate(post.publishedAt)}</span>
                </div>
                
                <h3 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-2">{post.title}</h3>
                <p className="text-gray-600 mb-4 line-clamp-3">{post.excerpt}</p>
                
                <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                  <div className="flex items-center space-x-1">
                    <UserIcon className="w-4 h-4" />
                    <span>{post.author.name}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <ClockIcon className="w-4 h-4" />
                    <span>{post.readTime} min</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <EyeIcon className="w-4 h-4" />
                      <span>{post.views}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <ChatBubbleLeftIcon className="w-4 h-4" />
                      <span>{post.comments}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-1 mb-4">
                  {post.tags.slice(0, 2).map((tag) => (
                    <span key={tag} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {tag}
                    </span>
                  ))}
                  {post.tags.length > 2 && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      +{post.tags.length - 2}
                    </span>
                  )}
                </div>
                
                <button className="w-full bg-gray-100 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors">
                  Read Article
                </button>
              </div>
            </article>
          ))}
        </div>

        {filteredPosts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No articles found</h3>
            <p className="text-gray-600">Try adjusting your search criteria or browse all articles.</p>
            {(selectedTag || searchQuery) && (
              <button 
                onClick={() => {
                  setSelectedTag(null);
                  setSearchQuery('');
                }}
                className="mt-4 text-blue-600 hover:text-blue-800"
              >
                Clear filters
              </button>
            )}
          </div>
        )}

        {/* Newsletter Signup */}
        <div className="bg-blue-600 rounded-lg p-8 mt-12 text-center">
          <h3 className="text-2xl font-bold text-white mb-4">Stay Updated</h3>
          <p className="text-blue-100 mb-6">Get the latest articles and earbud news delivered to your inbox.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-2 rounded-lg border-0 focus:ring-2 focus:ring-blue-300"
            />
            <button className="bg-white text-blue-600 px-6 py-2 rounded-lg hover:bg-gray-100 font-medium">
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
