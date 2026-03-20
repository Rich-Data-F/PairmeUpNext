'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
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
  const router = useRouter();
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const blogPosts: BlogPost[] = [
    {
      id: '1',
      title: 'AirPods Pro 3 Leaks: Hearing Aid Features and Better ANC Coming in 2025',
      slug: 'airpods-pro-3-leaks-2025',
      excerpt: 'Apple is reportedly preparing a massive update for the AirPods Pro line, focusing on health tracking and revolutionary active noise cancellation.',
      content: `The latest reports from industry insiders suggest that the AirPods Pro 3 will feature a revamped H3 chip, dedicated health sensors for heart rate monitoring, and a new "hearing aid mode" that leverages advanced on-device processing. This move aligns with Apple's broader strategy to position its wearables as essential health devices.

The hearing aid functionality is particularly interesting, as recent FDA deregulations have opened the door for over-the-counter hearing aids. By integrating this into a device millions already own, Apple could disrupt a multibillion-dollar industry. 

Additionally, we expect a 20% improvement in active noise cancellation (ANC) and better battery efficiency, potentially pushing playback time past 7 hours on a single charge. The case will likely retain its USB-C port but may see improvements in Find My accuracy with a newer U-series chip.`,
      author: {
        name: 'Sarah Johnson',
        avatar: '/avatars/sarah.jpg'
      },
      publishedAt: '2026-03-18T10:00:00Z',
      readTime: 6,
      views: 2450,
      comments: 42,
      tags: ['Apple', 'News', 'AirPods'],
      featured: true,
      coverImage: '/blog/airpods-pro-3.jpg'
    },
    {
      id: '2',
      title: 'The "Single Earbud" Market: Why Replacement Parts are Booming',
      slug: 'single-earbud-market-boom',
      excerpt: 'Losing one earbud used to mean buying a whole new set. Not anymore. Discover why the secondary market for parts is changing the industry.',
      content: `PairAgain data shows a 40% increase in searches for individual left and right buds over the last quarter. Manufacturers like Samsung and Sony are beginning to recognize this "right to repair" movement by making pairing software more accessible, though Apple still maintains a tighter grip on its ecosystem.

For the average consumer, losing a single AirPod Pro used to represent a $100+ loss, often leading to the purchase of a completely new set. However, platforms like PairAgain are enabling a circular economy where users can find an authentic replacement for half the cost.

Industry analysts predict that within the next two years, major brands may even start offering official "single-bud" SKU options at retail, moving away from the all-or-nothing bundles that have dominated the market since 2016.`,
      author: {
        name: 'David Park',
        avatar: '/avatars/david.jpg'
      },
      publishedAt: '2026-03-15T14:30:00Z',
      readTime: 5,
      views: 1892,
      comments: 28,
      tags: ['Market Trends', 'Repair', 'Savings'],
      featured: false
    },
    {
      id: '3',
      title: 'Samsung Galaxy Buds 3 Pro Review: The Stem Design Controversy',
      slug: 'samsung-buds-3-pro-review',
      excerpt: 'Samsung abandoned the "bean" for a "stem." Does the new design actually improve microphone quality and fit?',
      content: `Critics were divided when Samsung unveiled the Galaxy Buds 3 Pro with a design strikingly similar to the AirPods Pro. However, real-world testing shows that the dual-driver system and improved blade-lights offer a level of audio fidelity that justifies the hardware shift.

The primary benefit of the stem design is microphone placement. By bringing the beam-forming mics closer to the mouth, Samsung has significantly improved call quality in windy conditions. The new "Blade Lights" aren't just for show either; they provide a visual indicator for pairing status and battery life.

In terms of sound, the Buds 3 Pro feature a sophisticated 2-way speaker system with a high-fidelity tweeter and a planar woofer, delivering crisp highs and deep, controlled bass that rivals the Sony XM5 series.`,
      author: {
        name: 'Mike Chen',
        avatar: '/avatars/mike.jpg'
      },
      publishedAt: '2026-03-12T09:15:00Z',
      readTime: 8,
      views: 3421,
      comments: 56,
      tags: ['Samsung', 'Review', 'Hardware'],
      featured: false
    },
    {
      id: '4',
      title: 'Sony WF-1000XM6 Rumors: Smaller Case and Faster Loading',
      slug: 'sony-xm6-rumors',
      excerpt: 'Everything we know about Sony\'s next flagship noise-cancelling earbuds.',
      content: `Sony is expected to announce the WF-1000XM6 later this year. Sources indicate a 15% reduction in case size and a new V2 processor that could potentially double the processing power for ANC filters, aiming to take back the crown from Bose.

Internal test models suggest Sony is moving toward a more ergonomic "hybrid" tip design—combining the comfort of silicone with the isolation of memory foam. This has been a point of contention for XM4 and XM5 users who found the stock foam tips prone to degradation.

Connectivity will also get a boost with Bluetooth 5.4 support and optimized LE Audio, allowing for multi-point connection across three devices simultaneously without the occasional dropout seen in previous generations.`,
      author: {
        name: 'Emma Williams',
        avatar: '/avatars/emma.jpg'
      },
      publishedAt: '2026-03-10T16:45:00Z',
      readTime: 4,
      views: 5103,
      comments: 112,
      tags: ['Sony', 'ANC', 'Leaks'],
      featured: false
    },
    {
      id: '5',
      title: 'Bose QuietComfort Ultra: Still the ANC King in 2026?',
      slug: 'bose-qc-ultra-2026-review',
      excerpt: 'Bose\'s "Immersive Audio" has been out for a while. We revisit the QC Ultra to see if it holds up against the newer competition.',
      content: `While other brands focus on health and connectivity, Bose remains laser-focused on one thing: silence. In 2026, the QuietComfort Ultra remains the benchmark for low-frequency isolation in urban environments.

The "Immersive Audio" mode, which uses head-tracking to simulate a spatial soundstage, remains a highlight of the experience. Unlike Apple's implementation, Bose's spatial audio works with any source, making it a versatile choice for movie lovers and podcast listeners alike.

Battery life remains its Achilles' heel, however. With Immersive Audio turned on, you can only expect about 4 hours of juice. For long-haul flights, users might find themselves reaching for their XM5s or AirPods Max instead if they don't have time for a quick charge.`,
      author: {
        name: 'Lisa Thompson',
        avatar: '/avatars/lisa.jpg'
      },
      publishedAt: '2026-03-05T11:20:00Z',
      readTime: 7,
      views: 2876,
      comments: 34,
      tags: ['Bose', 'Audio Quality', 'ANC'],
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

  // Article Detail View
  if (selectedPost) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <button 
            onClick={() => setSelectedPost(null)}
            className="mb-8 flex items-center text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Back to Blog
          </button>
          
          <div className="mb-8">
            <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
              <CalendarIcon className="w-4 h-4" />
              <span>{formatDate(selectedPost.publishedAt)}</span>
              <span className="mx-2">•</span>
              <ClockIcon className="w-4 h-4" />
              <span>{selectedPost.readTime} min read</span>
            </div>
            <h1 className="text-4xl font-extrabold text-gray-900 mb-6">{selectedPost.title}</h1>
            
            <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl mb-8">
              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
                <UserIcon className="w-6 h-6" />
              </div>
              <div>
                <p className="font-bold text-gray-900">{selectedPost.author.name}</p>
                <p className="text-sm text-gray-600">Audio Technology Editor</p>
              </div>
            </div>
          </div>

          <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed space-y-6">
            {selectedPost.content.split('\n\n').map((paragraph, idx) => (
              <p key={idx}>{paragraph}</p>
            ))}
          </div>

          <div className="mt-12 pt-8 border-t border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {selectedPost.tags.map(tag => (
                <span key={tag} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-16 bg-blue-600 rounded-2xl p-8 text-center text-white">
            <h2 className="text-2xl font-bold mb-4">Help the community grow</h2>
            <p className="mb-6 opacity-90">Found a single earbud or lost one? Register it on our registry and help others.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => { setSelectedPost(null); router.push('/lost-stolen'); }}
                className="bg-white text-blue-600 px-8 py-3 rounded-xl font-bold hover:bg-gray-100 transition-all flex items-center justify-center"
              >
                Go to Lost & Found
              </button>
              <button 
                onClick={() => { setSelectedPost(null); router.push('/marketplace'); }}
                className="bg-blue-700 text-white border border-blue-400 px-8 py-3 rounded-xl font-bold hover:bg-blue-800 transition-all flex items-center justify-center"
              >
                Go to Transaction (Sell or Buy)
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
                  
                  <button 
                    onClick={() => setSelectedPost(featuredPost)}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
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
                
                <button 
                  onClick={() => setSelectedPost(post)}
                  className="w-full bg-gray-100 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                >
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

        {/* Newsletter & Propose Article */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
          {/* Newsletter Signup */}
          <div className="bg-blue-600 rounded-lg p-8 text-center text-white">
            <h3 className="text-2xl font-bold mb-4">Stay Updated</h3>
            <p className="text-blue-100 mb-6">Get the latest articles and earbud news delivered to your inbox.</p>
            <div className="space-y-4">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full px-4 py-2 rounded-lg border-0 text-gray-900 focus:ring-2 focus:ring-blue-300"
              />
              <button className="w-full bg-white text-blue-600 px-6 py-2 rounded-lg hover:bg-gray-100 font-bold transition-all">
                Subscribe
              </button>
            </div>
          </div>

          {/* Propose Article Form */}
          <div className="bg-white rounded-lg p-8 shadow-md border border-gray-100">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Propose an Article</h3>
            <p className="text-gray-600 mb-6">Have a story or expert knowledge to share? We'd love to hear from you!</p>
            <form onSubmit={(e) => { e.preventDefault(); toast.success('Proposal submitted! We will contact you soon.'); }} className="space-y-4">
              <input
                type="text"
                placeholder="Working Title"
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <textarea
                placeholder="Brief summary of your article idea..."
                required
                rows={2}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              ></textarea>
              <button 
                type="submit"
                className="w-full bg-gray-900 text-white px-6 py-2 rounded-lg hover:bg-gray-800 font-bold transition-all"
              >
                Send Proposal
              </button>
            </form>
          </div>
        </div>

        {/* Global Community CTA */}
        <div className="mt-16 bg-gray-900 rounded-2xl p-8 text-center text-white shadow-2xl">
          <h2 className="text-2xl font-bold mb-4">Help the community grow</h2>
          <p className="mb-6 opacity-80 max-w-2xl mx-auto">Found a single earbud or lost one? Our community relies on individual reports and transactions to reunite parts.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => router.push('/lost-stolen')}
              className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-500 transition-all flex items-center justify-center shadow-lg"
            >
              Go to Lost & Found
            </button>
            <button 
              onClick={() => router.push('/marketplace')}
              className="bg-white text-gray-900 px-8 py-3 rounded-xl font-bold hover:bg-gray-100 transition-all flex items-center justify-center shadow-lg"
            >
              Go to Transaction (Sell or Buy)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
