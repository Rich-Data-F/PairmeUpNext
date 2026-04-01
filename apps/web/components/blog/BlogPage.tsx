'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { 
  CalendarIcon,
  UserIcon,
  TagIcon,
  MagnifyingGlassIcon,
  ClockIcon,
  EyeIcon,
  ChatBubbleLeftIcon,
  ShareIcon,
  HandThumbUpIcon,
  LinkIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: {
    id: string;
    name: string;
    avatar?: string;
  };
  publishedAt: string;
  readTime: number;
  tags: string[];
  featured?: boolean;
  coverImage: string;
}

interface BlogComment {
  id: string;
  name: string;
  content: string;
  createdAt: string;
  parentId?: string;
}

type ReactionType = '👍' | '❤️' | '🔥' | '😮' | '👏';
const REACTIONS: ReactionType[] = ['👍', '❤️', '🔥', '😮', '👏'];

// --- localStorage helpers ---
function getViewCount(slug: string): number {
  if (typeof window === 'undefined') return 0;
  try {
    const counts = JSON.parse(localStorage.getItem('blog_views') || '{}');
    return counts[slug] || 0;
  } catch { return 0; }
}

function incrementViewCount(slug: string): number {
  if (typeof window === 'undefined') return 0;
  try {
    const counts = JSON.parse(localStorage.getItem('blog_views') || '{}');
    const sessionKey = `blog_viewed_${slug}`;
    if (!sessionStorage.getItem(sessionKey)) {
      counts[slug] = (counts[slug] || 0) + 1;
      localStorage.setItem('blog_views', JSON.stringify(counts));
      sessionStorage.setItem(sessionKey, '1');
    }
    return counts[slug] || 0;
  } catch { return 0; }
}

function getReactions(slug: string): Record<ReactionType, number> {
  if (typeof window === 'undefined') return { '👍': 0, '❤️': 0, '🔥': 0, '😮': 0, '👏': 0 };
  try {
    const all = JSON.parse(localStorage.getItem('blog_reactions') || '{}');
    return all[slug] || { '👍': 0, '❤️': 0, '🔥': 0, '😮': 0, '👏': 0 };
  } catch { return { '👍': 0, '❤️': 0, '🔥': 0, '😮': 0, '👏': 0 }; }
}

function getUserReaction(slug: string): ReactionType | null {
  if (typeof window === 'undefined') return null;
  try {
    const userReactions = JSON.parse(localStorage.getItem('blog_user_reactions') || '{}');
    return userReactions[slug] || null;
  } catch { return null; }
}

function toggleReaction(slug: string, reaction: ReactionType): { reactions: Record<ReactionType, number>; userReaction: ReactionType | null } {
  if (typeof window === 'undefined') return { reactions: getReactions(slug), userReaction: null };
  try {
    const all = JSON.parse(localStorage.getItem('blog_reactions') || '{}');
    const userReactions = JSON.parse(localStorage.getItem('blog_user_reactions') || '{}');
    const current = all[slug] || { '👍': 0, '❤️': 0, '🔥': 0, '😮': 0, '👏': 0 };
    const prev = userReactions[slug] || null;

    if (prev === reaction) {
      // Un-react
      current[reaction] = Math.max(0, (current[reaction] || 0) - 1);
      delete userReactions[slug];
    } else {
      // Remove previous reaction
      if (prev) current[prev] = Math.max(0, (current[prev] || 0) - 1);
      // Add new
      current[reaction] = (current[reaction] || 0) + 1;
      userReactions[slug] = reaction;
    }
    all[slug] = current;
    localStorage.setItem('blog_reactions', JSON.stringify(all));
    localStorage.setItem('blog_user_reactions', JSON.stringify(userReactions));
    return { reactions: current, userReaction: userReactions[slug] || null };
  } catch { return { reactions: getReactions(slug), userReaction: null }; }
}

function getComments(slug: string): BlogComment[] {
  if (typeof window === 'undefined') return [];
  try {
    const all = JSON.parse(localStorage.getItem('blog_comments') || '{}');
    return all[slug] || [];
  } catch { return []; }
}

function addComment(slug: string, name: string, content: string, parentId?: string): BlogComment[] {
  if (typeof window === 'undefined') return [];
  try {
    const all = JSON.parse(localStorage.getItem('blog_comments') || '{}');
    const comments: BlogComment[] = all[slug] || [];
    comments.push({
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      name,
      content,
      createdAt: new Date().toISOString(),
      parentId,
    });
    all[slug] = comments;
    localStorage.setItem('blog_comments', JSON.stringify(all));
    return comments;
  } catch { return []; }
}

// --- Blog edit helpers (localStorage) ---
type BlogEdits = Partial<Pick<BlogPost, 'title' | 'excerpt' | 'content' | 'coverImage' | 'readTime' | 'tags'>>;

function getBlogEdits(): Record<string, BlogEdits> {
  if (typeof window === 'undefined') return {};
  try { return JSON.parse(localStorage.getItem('blog_edits') || '{}'); }
  catch { return {}; }
}

function saveBlogEdit(slug: string, edits: BlogEdits) {
  if (typeof window === 'undefined') return;
  try {
    const all = getBlogEdits();
    all[slug] = edits;
    localStorage.setItem('blog_edits', JSON.stringify(all));
  } catch {}
}

function deleteBlogEdit(slug: string) {
  if (typeof window === 'undefined') return;
  try {
    const all = getBlogEdits();
    delete all[slug];
    localStorage.setItem('blog_edits', JSON.stringify(all));
  } catch {}
}

function applyEdits(post: BlogPost, edits: Record<string, BlogEdits>): BlogPost {
  const e = edits[post.slug];
  if (!e) return post;
  return { ...post, ...e };
}

// --- Share helpers ---
function getShareUrl(slug: string): string {
  if (typeof window === 'undefined') return '';
  return `${window.location.origin}/blog#${slug}`;
}

function shareToTwitter(title: string, slug: string) {
  const url = getShareUrl(slug);
  window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`, '_blank');
}
function shareToFacebook(slug: string) {
  const url = getShareUrl(slug);
  window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
}
function shareToLinkedIn(title: string, slug: string) {
  const url = getShareUrl(slug);
  window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank');
}
function shareToWhatsApp(title: string, slug: string) {
  const url = getShareUrl(slug);
  window.open(`https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}`, '_blank');
}
function copyLink(slug: string) {
  navigator.clipboard.writeText(getShareUrl(slug));
  toast.success('Link copied to clipboard!');
}

export function BlogPage() {
  const router = useRouter();
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [viewCounts, setViewCounts] = useState<Record<string, number>>({});

  // Blog posts from API (with hardcoded fallback)
  const [apiPosts, setApiPosts] = useState<BlogPost[] | null>(null);
  const [postsLoading, setPostsLoading] = useState(true);
  
  // Auth / edit
  const [profile, setProfile] = useState<{ id: string; name: string; isAdmin: boolean } | null>(null);
  const [blogEdits, setBlogEdits] = useState<Record<string, BlogEdits>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<BlogEdits & { tagsRaw: string }>({ tagsRaw: '' });
  const [uploadingCover, setUploadingCover] = useState(false);
  const coverFileRef = useRef<HTMLInputElement>(null);
  
  // Engagement state
  const [reactions, setReactions] = useState<Record<string, Record<ReactionType, number>>>({});
  const [userReactions, setUserReactions] = useState<Record<string, ReactionType | null>>({});
  const [comments, setComments] = useState<Record<string, BlogComment[]>>({});
  const [commentName, setCommentName] = useState('');
  const [commentText, setCommentText] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyName, setReplyName] = useState('');
  const [replyText, setReplyText] = useState('');
  const [showShareMenu, setShowShareMenu] = useState<string | null>(null);
  const [showReactions, setShowReactions] = useState<string | null>(null);
  const shareMenuRef = useRef<HTMLDivElement>(null);

  // Refresh view counts from localStorage on mount and when selectedPost changes
  const refreshViewCounts = useCallback((slugs: string[]) => {
    const counts: Record<string, number> = {};
    slugs.forEach(slug => {
      counts[slug] = getViewCount(slug);
    });
    setViewCounts(counts);
  }, []);

  // Load engagement data for all posts
  const loadEngagement = useCallback((slugs: string[]) => {
    const r: Record<string, Record<ReactionType, number>> = {};
    const ur: Record<string, ReactionType | null> = {};
    const c: Record<string, BlogComment[]> = {};
    slugs.forEach(slug => {
      r[slug] = getReactions(slug);
      ur[slug] = getUserReaction(slug);
      c[slug] = getComments(slug);
    });
    setReactions(r);
    setUserReactions(ur);
    setComments(c);
  }, []);

  // Load profile for edit permission and fetch posts from API
  useEffect(() => {
    fetch('/api/proxy/auth/profile')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.id) setProfile({ id: data.id, name: data.name || '', isAdmin: data.isAdmin === true });
      })
      .catch(() => {});
    setBlogEdits(getBlogEdits());

    // Fetch posts from API
    fetch('/api/proxy/blog?limit=50')
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.data?.length > 0) {
          setApiPosts(data.data);
          // Clear any stale localStorage edits now that we have authoritative DB data
          if (typeof window !== 'undefined') {
            localStorage.removeItem('blog_edits');
          }
          setBlogEdits({});
        }
      })
      .catch(() => {})
      .finally(() => setPostsLoading(false));
  }, []);

  // Increment view count when an article is opened
  useEffect(() => {
    if (selectedPost) {
      incrementViewCount(selectedPost.slug);
      setViewCounts((prev: Record<string, number>) => ({
        ...prev,
        [selectedPost.slug]: getViewCount(selectedPost.slug)
      }));
    }
  }, [selectedPost]);

  // Close share menu on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (shareMenuRef.current && !shareMenuRef.current.contains(e.target as Node)) {
        setShowShareMenu(null);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleReaction = (slug: string, reaction: ReactionType) => {
    const result = toggleReaction(slug, reaction);
    setReactions((prev: Record<string, Record<ReactionType, number>>) => ({ ...prev, [slug]: result.reactions }));
    setUserReactions((prev: Record<string, ReactionType | null>) => ({ ...prev, [slug]: result.userReaction }));
    setShowReactions(null);
  };

  const handleComment = (slug: string, parentId?: string) => {
    const name = parentId ? replyName.trim() : commentName.trim();
    const text = parentId ? replyText.trim() : commentText.trim();
    if (!name || !text) { toast.error('Please enter your name and comment.'); return; }
    const updated = addComment(slug, name, text, parentId);
    setComments((prev: Record<string, BlogComment[]>) => ({ ...prev, [slug]: updated }));
    if (parentId) { setReplyName(''); setReplyText(''); setReplyingTo(null); }
    else { setCommentName(''); setCommentText(''); }
    toast.success('Comment posted!');
  };

  const getTotalReactions = (slug: string): number => {
    const r = reactions[slug];
    if (!r) return 0;
    return (Object.values(r) as number[]).reduce((sum, v) => sum + v, 0);
  };

  const canEdit = (post: BlogPost): boolean => {
    if (!profile) return false;
    // ID check works for API posts; name check serves as fallback for hardcoded posts (author.id = '')
    return profile.isAdmin || profile.id === post.author.id || (post.author.id === '' && profile.name === post.author.name);
  };

  const startEdit = (post: BlogPost) => {
    const p = applyEdits(post, blogEdits);
    setEditForm({
      title: p.title,
      excerpt: p.excerpt,
      content: p.content,
      coverImage: p.coverImage,
      readTime: p.readTime,
      tagsRaw: p.tags.join(', '),
    });
    setIsEditing(true);
  };

  const saveEdit = async (post: BlogPost) => {
    const tags = editForm.tagsRaw?.split(',').map(t => t.trim()).filter(Boolean) || post.tags;
    const edits: BlogEdits = {
      title: editForm.title || post.title,
      excerpt: editForm.excerpt || post.excerpt,
      content: editForm.content || post.content,
      coverImage: editForm.coverImage || post.coverImage,
      readTime: Number(editForm.readTime) || post.readTime,
      tags,
    };

    // Persist to database
    try {
      const resp = await fetch(`/api/proxy/blog/${post.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: edits.title,
          excerpt: edits.excerpt,
          content: edits.content,
          featuredImage: edits.coverImage,
          readTime: edits.readTime,
          tags: edits.tags,
        }),
      });
      if (resp.ok) {
        const updated = await resp.json();
        // Update apiPosts with the server response
        setApiPosts(prev =>
          prev ? prev.map(p => (p.id === post.id ? { ...p, ...updated } : p)) : prev,
        );
        // Clear localStorage edit for this post since it's now in DB
        deleteBlogEdit(post.slug);
        const updatedEdits = { ...blogEdits };
        delete updatedEdits[post.slug];
        setBlogEdits(updatedEdits);
        setSelectedPost({ ...post, ...updated });
        setIsEditing(false);
        toast.success('Post updated and saved to database!');
        return;
      }
    } catch {
      // Fall through to localStorage fallback
    }

    // Fallback: save to localStorage if API is unavailable
    saveBlogEdit(post.slug, edits);
    const updatedEdits = { ...blogEdits, [post.slug]: edits };
    setBlogEdits(updatedEdits);
    setSelectedPost(applyEdits(post, updatedEdits));
    setIsEditing(false);
    toast.success('Post updated (saved locally).');
  };

  const revertEdit = (post: BlogPost) => {
    deleteBlogEdit(post.slug);
    const updated = { ...blogEdits };
    delete updated[post.slug];
    setBlogEdits(updated);
    setSelectedPost(post);
    setIsEditing(false);
    toast.success('Post reverted to original.');
  };

  const uploadCoverImage = async (file: File) => {
    if (!file.type.startsWith('image/')) { toast.error('Please select an image file.'); return; }
    setUploadingCover(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      fd.append('category', 'blog');
      const res = await fetch('/api/proxy/upload/image', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || 'Upload failed');
      setEditForm(f => ({ ...f, coverImage: data.url }));
      toast.success('Cover photo uploaded!');
    } catch (e: any) {
      toast.error(e.message || 'Upload failed');
    } finally {
      setUploadingCover(false);
    }
  };

  const getTopReaction = (slug: string): ReactionType | null => {
    const r = reactions[slug];
    if (!r) return null;
    let top: ReactionType | null = null;
    let max = 0;
    (Object.entries(r) as [ReactionType, number][]).forEach(([k, v]) => { if (v > max) { max = v; top = k; } });
    return max > 0 ? top : null;
  };

  const hardcodedPosts: BlogPost[] = [
    {
      id: '1',
      title: 'AirPods Pro 3 Leaks: Hearing Aid Features and Better ANC Coming in 2025',
      slug: 'airpods-pro-3-leaks-2025',
      excerpt: 'Apple is reportedly preparing a massive update for the AirPods Pro line, focusing on health tracking and revolutionary active noise cancellation.',
      content: `The latest reports from industry insiders suggest that the AirPods Pro 3 will feature a revamped H3 chip, dedicated health sensors for heart rate monitoring, and a new "hearing aid mode" that leverages advanced on-device processing. This move aligns with Apple's broader strategy to position its wearables as essential health devices.

The hearing aid functionality is particularly interesting, as recent FDA deregulations have opened the door for over-the-counter hearing aids. By integrating this into a device millions already own, Apple could disrupt a multibillion-dollar industry. 

Additionally, we expect a 20% improvement in active noise cancellation (ANC) and better battery efficiency, potentially pushing playback time past 7 hours on a single charge. The case will likely retain its USB-C port but may see improvements in Find My accuracy with a newer U-series chip.`,
      author: { id: '', name: 'Sarah Johnson' },
      publishedAt: '2026-03-18T10:00:00Z',
      readTime: 6,
      tags: ['Apple', 'News', 'AirPods'],
      featured: true,
      coverImage: 'https://images.unsplash.com/photo-1606741965326-cb990ae01bb2?w=800&q=80'
    },
    {
      id: '2',
      title: 'The "Single Earbud" Market: Why Replacement Parts are Booming',
      slug: 'single-earbud-market-boom',
      excerpt: 'Losing one earbud used to mean buying a whole new set. Not anymore. Discover why the secondary market for parts is changing the industry.',
      content: `PairAgain data shows a 40% increase in searches for individual left and right buds over the last quarter. Manufacturers like Samsung and Sony are beginning to recognize this "right to repair" movement by making pairing software more accessible, though Apple still maintains a tighter grip on its ecosystem.

For the average consumer, losing a single AirPod Pro used to represent a $100+ loss, often leading to the purchase of a completely new set. However, platforms like PairAgain are enabling a circular economy where users can find an authentic replacement for half the cost.

Industry analysts predict that within the next two years, major brands may even start offering official "single-bud" SKU options at retail, moving away from the all-or-nothing bundles that have dominated the market since 2016.`,
      author: { id: '', name: 'David Park' },
      publishedAt: '2026-03-15T14:30:00Z',
      readTime: 5,
      tags: ['Market Trends', 'Repair', 'Savings'],
      featured: false,
      coverImage: 'https://images.unsplash.com/photo-1590658268037-6bf12f032f55?w=800&q=80'
    },
    {
      id: '3',
      title: 'Samsung Galaxy Buds 3 Pro Review: The Stem Design Controversy',
      slug: 'samsung-buds-3-pro-review',
      excerpt: 'Samsung abandoned the "bean" for a "stem." Does the new design actually improve microphone quality and fit?',
      content: `Critics were divided when Samsung unveiled the Galaxy Buds 3 Pro with a design strikingly similar to the AirPods Pro. However, real-world testing shows that the dual-driver system and improved blade-lights offer a level of audio fidelity that justifies the hardware shift.

The primary benefit of the stem design is microphone placement. By bringing the beam-forming mics closer to the mouth, Samsung has significantly improved call quality in windy conditions. The new "Blade Lights" aren't just for show either; they provide a visual indicator for pairing status and battery life.

In terms of sound, the Buds 3 Pro feature a sophisticated 2-way speaker system with a high-fidelity tweeter and a planar woofer, delivering crisp highs and deep, controlled bass that rivals the Sony XM5 series.`,
      author: { id: '', name: 'Mike Chen' },
      publishedAt: '2026-03-12T09:15:00Z',
      readTime: 8,
      tags: ['Samsung', 'Review', 'Hardware'],
      featured: false,
      coverImage: 'https://images.unsplash.com/photo-1631867934874-4e0719e27668?w=800&q=80'
    },
    {
      id: '4',
      title: 'Sony WF-1000XM6 Rumors: Smaller Case and Faster Loading',
      slug: 'sony-xm6-rumors',
      excerpt: 'Everything we know about Sony\'s next flagship noise-cancelling earbuds.',
      content: `Sony is expected to announce the WF-1000XM6 later this year. Sources indicate a 15% reduction in case size and a new V2 processor that could potentially double the processing power for ANC filters, aiming to take back the crown from Bose.

Internal test models suggest Sony is moving toward a more ergonomic "hybrid" tip design—combining the comfort of silicone with the isolation of memory foam. This has been a point of contention for XM4 and XM5 users who found the stock foam tips prone to degradation.

Connectivity will also get a boost with Bluetooth 5.4 support and optimized LE Audio, allowing for multi-point connection across three devices simultaneously without the occasional dropout seen in previous generations.`,
      author: { id: '', name: 'Emma Williams' },
      publishedAt: '2026-03-10T16:45:00Z',
      readTime: 4,
      tags: ['Sony', 'ANC', 'Leaks'],
      featured: false,
      coverImage: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=800&q=80'
    },
    {
      id: '5',
      title: 'Bose QuietComfort Ultra: Still the ANC King in 2026?',
      slug: 'bose-qc-ultra-2026-review',
      excerpt: 'Bose\'s "Immersive Audio" has been out for a while. We revisit the QC Ultra to see if it holds up against the newer competition.',
      content: `While other brands focus on health and connectivity, Bose remains laser-focused on one thing: silence. In 2026, the QuietComfort Ultra remains the benchmark for low-frequency isolation in urban environments.

The "Immersive Audio" mode, which uses head-tracking to simulate a spatial soundstage, remains a highlight of the experience. Unlike Apple's implementation, Bose's spatial audio works with any source, making it a versatile choice for movie lovers and podcast listeners alike.

Battery life remains its Achilles' heel, however. With Immersive Audio turned on, you can only expect about 4 hours of juice. For long-haul flights, users might find themselves reaching for their XM5s or AirPods Max instead if they don't have time for a quick charge.`,
      author: { id: '', name: 'Lisa Thompson' },
      publishedAt: '2026-03-05T11:20:00Z',
      readTime: 7,
      tags: ['Bose', 'Audio Quality', 'ANC'],
      featured: false,
      coverImage: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&q=80'
    },
    {
      id: '6',
      title: 'Huawei Loss Care: A Built-In Insurance for Your FreeBuds',
      slug: 'huawei-loss-care-freebuds',
      excerpt: 'Huawei now offers an official loss-protection plan for FreeBuds owners. Is it worth it, and how does it compare to the secondary market?',
      content: `Huawei has quietly rolled out a service called "Loss Care" specifically for its FreeBuds product line. The concept is straightforward: pay a small fee when purchasing your FreeBuds, and if you lose a single earbud or the charging case within the coverage period, Huawei will replace it at a significantly reduced cost.

This is a notable move in the true wireless earbud space, where losing a single bud has traditionally meant either buying a full replacement set or turning to the secondary market. Huawei's approach acknowledges a pain point that platforms like PairAgain were built to solve.

**How it works:** After purchasing the Loss Care add-on, users register their FreeBuds through the Huawei Support app. If a component is lost, they can file a claim and receive a replacement unit for a fraction of the retail price. The service currently covers FreeBuds Pro 3, FreeBuds 6i, and select other models.

**The catch:** Loss Care only covers one replacement per coverage period, and the replacement must be for the same model. It doesn't cover physical damage, water damage, or theft — only accidental loss.

**How it compares to PairAgain:** While Huawei's Loss Care is a manufacturer-backed insurance model, PairAgain's marketplace offers more flexibility. On PairAgain, you can find replacement buds across all brands, negotiate prices, and even trade components you no longer need. For Huawei users specifically, Loss Care is a convenient first line of defense, but PairAgain remains the go-to for cross-brand replacements and cost-conscious buyers.

For full details on Huawei's Loss Care program, visit the [official Huawei Loss Care page](https://consumer.huawei.com/fr/support/huawei-loss-care-for-freebuds/).`,
      author: { id: '', name: 'David Park' },
      publishedAt: '2026-03-22T08:00:00Z',
      readTime: 4,
      tags: ['Huawei', 'Insurance', 'FreeBuds'],
      featured: false,
      coverImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80'
    }
  ];

  // Use API posts when available, otherwise fall back to hardcoded posts
  const blogPosts: BlogPost[] = apiPosts ?? hardcodedPosts;

  // Initialize view counts and engagement on mount
  useEffect(() => {
    const slugs = blogPosts.map(p => p.slug);
    refreshViewCounts(slugs);
    loadEngagement(slugs);
  }, [apiPosts]); // eslint-disable-line react-hooks/exhaustive-deps

  // Apply localStorage edits to all posts for rendering (only for non-API posts)
  const displayPosts = apiPosts
    ? blogPosts  // API posts are already up-to-date
    : blogPosts.map(p => applyEdits(p, blogEdits));

  const allTags = Array.from(new Set(displayPosts.flatMap(post => post.tags)));

  const filteredPosts = displayPosts.filter(post => {
    const matchesSearch = searchQuery === '' || 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesTag = selectedTag === null || post.tags.includes(selectedTag);
    
    return matchesSearch && matchesTag;
  });

  const featuredPost = displayPosts.find(post => post.featured);
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
        <div className="mb-8 flex items-center justify-between">
          <button 
            onClick={() => { setSelectedPost(null); setIsEditing(false); }}
            className="flex items-center text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Back to Blog
          </button>

          {canEdit(selectedPost) && !isEditing && (
            <div className="flex items-center gap-2">
              {blogEdits[selectedPost.slug] && (
                <button
                  onClick={() => revertEdit(applyEdits(blogPosts.find(p => p.slug === selectedPost.slug)!, blogEdits))}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-orange-600 border border-orange-300 rounded-lg hover:bg-orange-50 transition-all"
                >
                  <XMarkIcon className="w-4 h-4" /> Revert
                </button>
              )}
              <button
                onClick={() => startEdit(applyEdits(blogPosts.find(p => p.slug === selectedPost.slug)!, blogEdits))}
                className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all"
              >
                <PencilIcon className="w-4 h-4" /> Edit Post
              </button>
            </div>
          )}
        </div>

        {/* Inline Edit Form */}
        {isEditing && canEdit(selectedPost) && (
          <div className="mb-10 bg-yellow-50 border border-yellow-200 rounded-2xl p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-gray-900 flex items-center gap-2"><PencilIcon className="w-5 h-5 text-yellow-600" /> Editing Post</h3>
              <button onClick={() => setIsEditing(false)} className="text-gray-400 hover:text-gray-600"><XMarkIcon className="w-5 h-5" /></button>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Title</label>
              <input
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-semibold"
                value={editForm.title || ''}
                onChange={e => setEditForm(f => ({ ...f, title: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Excerpt</label>
              <textarea
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
                rows={2}
                value={editForm.excerpt || ''}
                onChange={e => setEditForm(f => ({ ...f, excerpt: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Cover Photo</label>

              {/* Upload area */}
              <div
                className={`relative border-2 border-dashed rounded-xl transition-all cursor-pointer ${
                  uploadingCover ? 'border-blue-300 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                }`}
                onClick={() => !uploadingCover && coverFileRef.current?.click()}
                onDragOver={e => { e.preventDefault(); e.stopPropagation(); }}
                onDrop={e => {
                  e.preventDefault();
                  e.stopPropagation();
                  const file = e.dataTransfer.files?.[0];
                  if (file) uploadCoverImage(file);
                }}
              >
                <input
                  ref={coverFileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={e => { const f = e.target.files?.[0]; if (f) uploadCoverImage(f); e.target.value = ''; }}
                />
                {editForm.coverImage ? (
                  <div className="relative group">
                    <img
                      src={editForm.coverImage}
                      alt="Cover preview"
                      className="w-full h-40 object-cover rounded-xl"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                      <span className="text-white text-sm font-semibold">{uploadingCover ? 'Uploading…' : '📷 Click or drop to replace'}</span>
                    </div>
                    {uploadingCover && (
                      <div className="absolute inset-0 bg-white/70 rounded-xl flex items-center justify-center">
                        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                    {uploadingCover ? (
                      <><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-2" /><p className="text-sm text-blue-600 font-medium">Uploading…</p></>
                    ) : (
                      <><div className="text-4xl mb-2">📷</div><p className="text-sm font-semibold text-gray-700">Click or drag & drop to upload a cover photo</p><p className="text-xs text-gray-400 mt-1">PNG, JPG, WebP · Max 10 MB</p></>
                    )}
                  </div>
                )}
              </div>

              {/* URL fallback */}
              <div className="mt-2 flex items-center gap-2">
                <span className="text-xs text-gray-400 whitespace-nowrap">Or paste URL:</span>
                <input
                  className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-xs font-mono"
                  placeholder="https://example.com/photo.jpg"
                  value={editForm.coverImage || ''}
                  onChange={e => setEditForm(f => ({ ...f, coverImage: e.target.value }))}
                />
                {editForm.coverImage && (
                  <button
                    onClick={() => setEditForm(f => ({ ...f, coverImage: '' }))}
                    className="text-gray-400 hover:text-red-500 transition-colors"
                    title="Clear image"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Read Time (min)</label>
                <input
                  type="number"
                  min={1}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  value={editForm.readTime || ''}
                  onChange={e => setEditForm(f => ({ ...f, readTime: Number(e.target.value) }))}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Tags (comma-separated)</label>
                <input
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  value={editForm.tagsRaw || ''}
                  onChange={e => setEditForm(f => ({ ...f, tagsRaw: e.target.value }))}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Content (markdown supported: **bold**, [link](url))</label>
              <textarea
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-mono resize-y"
                rows={14}
                value={editForm.content || ''}
                onChange={e => setEditForm(f => ({ ...f, content: e.target.value }))}
              />
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t border-yellow-200">
              <button
                onClick={() => setIsEditing(false)}
                className="px-5 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => saveEdit(blogPosts.find(p => p.slug === selectedPost.slug)!)}
                className="flex items-center gap-1.5 px-5 py-2 text-sm font-bold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-all"
              >
                <CheckIcon className="w-4 h-4" /> Save Changes
              </button>
            </div>
          </div>
        )}

          {/* Cover Image */}
          <div className="mb-8 rounded-2xl overflow-hidden shadow-lg">
            <img 
              src={selectedPost.coverImage} 
              alt={selectedPost.title}
              className="w-full h-64 sm:h-80 md:h-96 object-cover"
            />
          </div>
          
          <div className="mb-8">
            <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
              <CalendarIcon className="w-4 h-4" />
              <span>{formatDate(selectedPost.publishedAt)}</span>
              <span className="mx-2">•</span>
              <ClockIcon className="w-4 h-4" />
              <span>{selectedPost.readTime} min read</span>
              <span className="mx-2">•</span>
              <EyeIcon className="w-4 h-4" />
              <span>{viewCounts[selectedPost.slug] || 0} views</span>
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
            {selectedPost.content.split('\n\n').map((paragraph, idx) => {
              // Parse markdown-style bold (**text**) and links ([text](url))
              const parts = paragraph.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/g);
              return (
                <p key={idx}>
                  {parts.map((part, i) => {
                    const boldMatch = part.match(/^\*\*(.+)\*\*$/);
                    if (boldMatch) return <strong key={i}>{boldMatch[1]}</strong>;
                    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
                    if (linkMatch) return <a key={i} href={linkMatch[2]} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline hover:text-blue-800">{linkMatch[1]}</a>;
                    return <React.Fragment key={i}>{part}</React.Fragment>;
                  })}
                </p>
              );
            })}
          </div>

          {/* Reactions & Share Bar */}
          <div className="mt-10 pt-6 border-t border-gray-100">
            <div className="flex items-center justify-between flex-wrap gap-4">
              {/* Reactions */}
              <div className="flex items-center gap-2">
                <div className="relative">
                  <button
                    onClick={() => setShowReactions(showReactions === selectedPost.slug ? null : selectedPost.slug)}
                    className={`flex items-center gap-1.5 px-4 py-2 rounded-full border transition-all ${
                      userReactions[selectedPost.slug]
                        ? 'bg-blue-50 border-blue-300 text-blue-700'
                        : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    {userReactions[selectedPost.slug] ? (
                      <span className="text-lg">{userReactions[selectedPost.slug]}</span>
                    ) : (
                      <HandThumbUpIcon className="w-5 h-5" />
                    )}
                    <span className="font-medium text-sm">{getTotalReactions(selectedPost.slug) || 'React'}</span>
                  </button>
                  {showReactions === selectedPost.slug && (
                    <div className="absolute bottom-full left-0 mb-2 bg-white rounded-full shadow-lg border border-gray-200 px-2 py-1 flex gap-1 z-10 animate-in fade-in slide-in-from-bottom-2">
                      {REACTIONS.map(r => (
                        <button
                          key={r}
                          onClick={() => handleReaction(selectedPost.slug, r)}
                          className={`text-xl hover:scale-125 transition-transform p-1.5 rounded-full ${
                            userReactions[selectedPost.slug] === r ? 'bg-blue-100' : 'hover:bg-gray-100'
                          }`}
                          title={r}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {/* Show breakdown of reactions */}
                {getTotalReactions(selectedPost.slug) > 0 && (
                  <div className="flex items-center gap-1 text-sm text-gray-500">
                    {(Object.entries(reactions[selectedPost.slug] || {}) as [ReactionType, number][])
                      .filter(([, v]) => v > 0)
                      .sort(([, a], [, b]) => b - a)
                      .map(([emoji, count]) => (
                        <span key={emoji} className="flex items-center gap-0.5">
                          <span className="text-base">{emoji}</span>
                          <span>{count}</span>
                        </span>
                      ))}
                  </div>
                )}
              </div>

              {/* Share */}
              <div className="relative" ref={shareMenuRef}>
                <button
                  onClick={() => setShowShareMenu(showShareMenu === selectedPost.slug ? null : selectedPost.slug)}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 transition-all"
                >
                  <ShareIcon className="w-5 h-5" />
                  <span className="font-medium text-sm">Share</span>
                </button>
                {showShareMenu === selectedPost.slug && (
                  <div className="absolute right-0 top-full mt-2 bg-white rounded-xl shadow-lg border border-gray-200 py-2 w-48 z-10">
                    <button onClick={() => { shareToTwitter(selectedPost.title, selectedPost.slug); setShowShareMenu(null); }} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3">
                      <span className="text-lg">𝕏</span> Share on X
                    </button>
                    <button onClick={() => { shareToFacebook(selectedPost.slug); setShowShareMenu(null); }} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3">
                      <span className="text-lg">📘</span> Facebook
                    </button>
                    <button onClick={() => { shareToLinkedIn(selectedPost.title, selectedPost.slug); setShowShareMenu(null); }} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3">
                      <span className="text-lg">💼</span> LinkedIn
                    </button>
                    <button onClick={() => { shareToWhatsApp(selectedPost.title, selectedPost.slug); setShowShareMenu(null); }} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3">
                      <span className="text-lg">💬</span> WhatsApp
                    </button>
                    <hr className="my-1 border-gray-100" />
                    <button onClick={() => { copyLink(selectedPost.slug); setShowShareMenu(null); }} className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3">
                      <LinkIcon className="w-4 h-4" /> Copy link
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {selectedPost.tags.map(tag => (
                <span key={tag} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* Comments Section */}
          <div className="mt-10 pt-8 border-t border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <ChatBubbleLeftIcon className="w-5 h-5" />
              Comments ({(comments[selectedPost.slug] || []).length})
            </h3>

            {/* Comment form */}
            <div className="bg-gray-50 rounded-xl p-6 mb-8">
              <h4 className="font-semibold text-gray-800 mb-4">Leave a comment</h4>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Your name"
                  value={commentName}
                  onChange={(e) => setCommentName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
                <textarea
                  placeholder="Write your comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
                />
                <button
                  onClick={() => handleComment(selectedPost.slug)}
                  className="bg-blue-600 text-white px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm"
                >
                  Post Comment
                </button>
              </div>
            </div>

            {/* Comments list */}
            <div className="space-y-6">
              {(comments[selectedPost.slug] || [])
                .filter(c => !c.parentId)
                .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                .map(comment => (
                  <div key={comment.id} className="group">
                    <div className="flex gap-3">
                      <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-sm flex-shrink-0">
                        {comment.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-gray-900 text-sm">{comment.name}</span>
                          <span className="text-xs text-gray-400">{formatDate(comment.createdAt)}</span>
                        </div>
                        <p className="text-gray-700 text-sm leading-relaxed">{comment.content}</p>
                        <button
                          onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                          className="text-xs text-blue-600 hover:text-blue-800 mt-2 font-medium"
                        >
                          Reply
                        </button>

                        {/* Reply form */}
                        {replyingTo === comment.id && (
                          <div className="mt-3 pl-4 border-l-2 border-blue-200 space-y-2">
                            <input
                              type="text"
                              placeholder="Your name"
                              value={replyName}
                              onChange={(e) => setReplyName(e.target.value)}
                              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            />
                            <textarea
                              placeholder="Write a reply..."
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              rows={2}
                              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm resize-none"
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleComment(selectedPost.slug, comment.id)}
                                className="bg-blue-600 text-white px-4 py-1.5 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                              >
                                Reply
                              </button>
                              <button
                                onClick={() => { setReplyingTo(null); setReplyName(''); setReplyText(''); }}
                                className="text-gray-500 hover:text-gray-700 px-4 py-1.5 text-sm"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Threaded replies */}
                        {(comments[selectedPost.slug] || [])
                          .filter(r => r.parentId === comment.id)
                          .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                          .map(reply => (
                            <div key={reply.id} className="mt-4 pl-4 border-l-2 border-gray-200">
                              <div className="flex gap-3">
                                <div className="w-7 h-7 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 font-bold text-xs flex-shrink-0">
                                  {reply.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-semibold text-gray-900 text-sm">{reply.name}</span>
                                    <span className="text-xs text-gray-400">{formatDate(reply.createdAt)}</span>
                                  </div>
                                  <p className="text-gray-700 text-sm leading-relaxed">{reply.content}</p>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                ))}
              {(comments[selectedPost.slug] || []).length === 0 && (
                <p className="text-center text-gray-400 py-6 text-sm">No comments yet. Be the first to share your thoughts!</p>
              )}
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
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {postsLoading && (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mr-3" />
            <span className="text-gray-500 text-sm">Loading articles…</span>
          </div>
        )}
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
                  <div className="h-64 md:h-full relative">
                    <img 
                      src={featuredPost.coverImage} 
                      alt={featuredPost.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end">
                      <div className="text-white p-6">
                        <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Featured</span>
                      </div>
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
                      <div className="flex items-center space-x-1">
                        <EyeIcon className="w-4 h-4" />
                        <span>{viewCounts[featuredPost.slug] || 0} views</span>
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
                  {canEdit(featuredPost) && (
                    <button
                      onClick={() => { setSelectedPost(featuredPost); setTimeout(() => startEdit(featuredPost), 50); }}
                      className="flex items-center gap-1.5 ml-3 px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50 transition-all"
                    >
                      <PencilIcon className="w-4 h-4" />
                      {blogEdits[featuredPost.slug] ? <span className="text-amber-600">Edited ✓</span> : 'Edit'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {otherPosts.map((post) => (
            <article key={post.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              <div className="h-48 overflow-hidden relative">
                <img 
                  src={post.coverImage} 
                  alt={post.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                />
                {canEdit(post) && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setSelectedPost(post); setTimeout(() => startEdit(post), 50); }}
                    className="absolute top-2 right-2 flex items-center gap-1 px-2.5 py-1 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-lg text-xs font-semibold text-gray-700 hover:bg-white shadow-sm transition-all"
                    title="Edit this post"
                  >
                    <PencilIcon className="w-3.5 h-3.5" />
                    {blogEdits[post.slug] ? <span className="text-amber-600">Edited</span> : 'Edit'}
                  </button>
                )}
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
                      <span>{viewCounts[post.slug] || 0}</span>
                    </div>
                    {getTotalReactions(post.slug) > 0 && (
                      <div className="flex items-center space-x-1">
                        <span className="text-sm">{getTopReaction(post.slug)}</span>
                        <span>{getTotalReactions(post.slug)}</span>
                      </div>
                    )}
                    {(comments[post.slug] || []).length > 0 && (
                      <div className="flex items-center space-x-1">
                        <ChatBubbleLeftIcon className="w-4 h-4" />
                        <span>{(comments[post.slug] || []).length}</span>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); copyLink(post.slug); }}
                    className="text-gray-400 hover:text-blue-600 transition-colors"
                    title="Copy link"
                  >
                    <ShareIcon className="w-4 h-4" />
                  </button>
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
