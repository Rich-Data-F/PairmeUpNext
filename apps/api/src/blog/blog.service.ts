import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 120);
}

@Injectable()
export class BlogService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * List published posts (public). Optional filters: tag, search, limit, offset.
   */
  async findPublished(query: {
    tag?: string;
    search?: string;
    limit?: number;
    offset?: number;
  }) {
    const where: any = { status: 'PUBLISHED' };
    if (query.tag) {
      where.tags = { has: query.tag };
    }
    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { excerpt: { contains: query.search, mode: 'insensitive' } },
        { tags: { has: query.search } },
      ];
    }

    const [posts, total] = await Promise.all([
      this.prisma.blogPost.findMany({
        where,
        orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
        take: query.limit || 50,
        skip: query.offset || 0,
        include: {
          author: { select: { id: true, name: true, image: true } },
        },
      }),
      this.prisma.blogPost.count({ where }),
    ]);

    return { posts, total };
  }

  /**
   * Get single post by slug (public, increments views)
   */
  async findBySlug(slug: string) {
    const post = await this.prisma.blogPost.findUnique({
      where: { slug },
      include: {
        author: { select: { id: true, name: true, image: true } },
        comments: {
          where: { isApproved: true },
          orderBy: { createdAt: 'asc' },
          select: {
            id: true,
            content: true,
            guestName: true,
            parentId: true,
            createdAt: true,
            user: { select: { id: true, name: true, image: true } },
          },
        },
      },
    });
    if (!post) throw new NotFoundException('Blog post not found');

    // Increment views (fire-and-forget)
    this.prisma.blogPost.update({
      where: { id: post.id },
      data: { views: { increment: 1 } },
    }).catch(() => {});

    return post;
  }

  /**
   * Create a new blog post (auth required)
   */
  async create(authorId: string, data: {
    title: string;
    slug?: string;
    excerpt?: string;
    content: string;
    status?: string;
    featuredImage?: string;
    tags?: string[];
    category?: string;
    readTime?: number;
    metaTitle?: string;
    metaDescription?: string;
  }) {
    const slug = data.slug || slugify(data.title);

    // Ensure slug is unique
    const existing = await this.prisma.blogPost.findUnique({ where: { slug } });
    const finalSlug = existing ? `${slug}-${Date.now().toString(36)}` : slug;

    return this.prisma.blogPost.create({
      data: {
        title: data.title,
        slug: finalSlug,
        excerpt: data.excerpt,
        content: data.content,
        status: (data.status as any) || 'DRAFT',
        featuredImage: data.featuredImage,
        tags: data.tags || [],
        category: data.category,
        readTime: data.readTime || 5,
        metaTitle: data.metaTitle,
        metaDescription: data.metaDescription,
        authorId,
        publishedAt: data.status === 'PUBLISHED' ? new Date() : null,
      },
      include: {
        author: { select: { id: true, name: true, image: true } },
      },
    });
  }

  /**
   * Update a blog post (only author or admin)
   */
  async update(postId: string, userId: string, isAdmin: boolean, data: {
    title?: string;
    slug?: string;
    excerpt?: string;
    content?: string;
    status?: string;
    featuredImage?: string;
    tags?: string[];
    category?: string;
    readTime?: number;
    metaTitle?: string;
    metaDescription?: string;
  }) {
    const post = await this.prisma.blogPost.findUnique({ where: { id: postId } });
    if (!post) throw new NotFoundException('Blog post not found');
    if (post.authorId !== userId && !isAdmin) {
      throw new ForbiddenException('Only the author or an admin can edit this post');
    }

    const updateData: any = { ...data };

    // If transitioning to PUBLISHED and not yet published, set publishedAt
    if (data.status === 'PUBLISHED' && !post.publishedAt) {
      updateData.publishedAt = new Date();
    }
    // Remove status string and convert
    if (data.status) {
      updateData.status = data.status;
    }

    return this.prisma.blogPost.update({
      where: { id: postId },
      data: updateData,
      include: {
        author: { select: { id: true, name: true, image: true } },
      },
    });
  }

  /**
   * Delete a blog post (only author or admin)
   */
  async remove(postId: string, userId: string, isAdmin: boolean) {
    const post = await this.prisma.blogPost.findUnique({ where: { id: postId } });
    if (!post) throw new NotFoundException('Blog post not found');
    if (post.authorId !== userId && !isAdmin) {
      throw new ForbiddenException('Only the author or an admin can delete this post');
    }
    await this.prisma.blogPost.delete({ where: { id: postId } });
    return { success: true };
  }

  /**
   * Add a comment (guest or logged-in user)
   */
  async addComment(postId: string, data: {
    content: string;
    userId?: string;
    guestName?: string;
    guestEmail?: string;
    parentId?: string;
  }) {
    const post = await this.prisma.blogPost.findUnique({ where: { id: postId } });
    if (!post) throw new NotFoundException('Blog post not found');

    const comment = await this.prisma.comment.create({
      data: {
        content: data.content,
        postId,
        userId: data.userId || null,
        guestName: data.guestName || null,
        guestEmail: data.guestEmail || null,
        parentId: data.parentId || null,
        isApproved: !!data.userId, // Auto-approve for logged-in users
      },
      select: {
        id: true,
        content: true,
        guestName: true,
        parentId: true,
        createdAt: true,
        user: { select: { id: true, name: true, image: true } },
      },
    });

    // Increment comment count
    await this.prisma.blogPost.update({
      where: { id: postId },
      data: { commentCount: { increment: 1 } },
    }).catch(() => {});

    return comment;
  }

  /**
   * Toggle like/reaction on a post
   */
  async incrementLikes(postId: string) {
    const post = await this.prisma.blogPost.findUnique({ where: { id: postId } });
    if (!post) throw new NotFoundException('Blog post not found');
    return this.prisma.blogPost.update({
      where: { id: postId },
      data: { likes: { increment: 1 } },
      select: { id: true, likes: true },
    });
  }

  /**
   * All posts for a specific author (including drafts)
   */
  async findByAuthor(authorId: string) {
    return this.prisma.blogPost.findMany({
      where: { authorId },
      orderBy: { createdAt: 'desc' },
      include: {
        author: { select: { id: true, name: true, image: true } },
      },
    });
  }

  /**
   * Seed the 6 initial blog posts (idempotent — skips existing slugs)
   */
  async seedInitialPosts(adminUserId: string) {
    const seedPosts = [
      {
        title: 'AirPods Pro 3 Leaks: Hearing Aid Features and Better ANC Coming in 2025',
        slug: 'airpods-pro-3-leaks-2025',
        excerpt: 'Apple is reportedly preparing a massive update for the AirPods Pro line, focusing on health tracking and revolutionary active noise cancellation.',
        content: `The latest reports from industry insiders suggest that the AirPods Pro 3 will feature a revamped H3 chip, dedicated health sensors for heart rate monitoring, and a new "hearing aid mode" that leverages advanced on-device processing. This move aligns with Apple's broader strategy to position its wearables as essential health devices.

The hearing aid functionality is particularly interesting, as recent FDA deregulations have opened the door for over-the-counter hearing aids. By integrating this into a device millions already own, Apple could disrupt a multibillion-dollar industry.

Additionally, we expect a 20% improvement in active noise cancellation (ANC) and better battery efficiency, potentially pushing playback time past 7 hours on a single charge. The case will likely retain its USB-C port but may see improvements in Find My accuracy with a newer U-series chip.`,
        readTime: 6,
        tags: ['Apple', 'News', 'AirPods'],
        featuredImage: 'https://images.unsplash.com/photo-1606741965326-cb990ae01bb2?w=800&q=80',
        publishedAt: new Date('2026-03-18T10:00:00Z'),
      },
      {
        title: 'The "Single Earbud" Market: Why Replacement Parts are Booming',
        slug: 'single-earbud-market-boom',
        excerpt: 'Losing one earbud used to mean buying a whole new set. Not anymore. Discover why the secondary market for parts is changing the industry.',
        content: `PairAgain data shows a 40% increase in searches for individual left and right buds over the last quarter. Manufacturers like Samsung and Sony are beginning to recognize this "right to repair" movement by making pairing software more accessible, though Apple still maintains a tighter grip on its ecosystem.

For the average consumer, losing a single AirPod Pro used to represent a $100+ loss, often leading to the purchase of a completely new set. However, platforms like PairAgain are enabling a circular economy where users can find an authentic replacement for half the cost.

Industry analysts predict that within the next two years, major brands may even start offering official "single-bud" SKU options at retail, moving away from the all-or-nothing bundles that have dominated the market since 2016.`,
        readTime: 5,
        tags: ['Market Trends', 'Repair', 'Savings'],
        featuredImage: 'https://images.unsplash.com/photo-1590658268037-6bf12f032f55?w=800&q=80',
        publishedAt: new Date('2026-03-15T14:30:00Z'),
      },
      {
        title: 'Samsung Galaxy Buds 3 Pro Review: The Stem Design Controversy',
        slug: 'samsung-buds-3-pro-review',
        excerpt: 'Samsung abandoned the "bean" for a "stem." Does the new design actually improve microphone quality and fit?',
        content: `Critics were divided when Samsung unveiled the Galaxy Buds 3 Pro with a design strikingly similar to the AirPods Pro. However, real-world testing shows that the dual-driver system and improved blade-lights offer a level of audio fidelity that justifies the hardware shift.

The primary benefit of the stem design is microphone placement. By bringing the beam-forming mics closer to the mouth, Samsung has significantly improved call quality in windy conditions. The new "Blade Lights" aren't just for show either; they provide a visual indicator for pairing status and battery life.

In terms of sound, the Buds 3 Pro feature a sophisticated 2-way speaker system with a high-fidelity tweeter and a planar woofer, delivering crisp highs and deep, controlled bass that rivals the Sony XM5 series.`,
        readTime: 8,
        tags: ['Samsung', 'Review', 'Hardware'],
        featuredImage: 'https://images.unsplash.com/photo-1631867934874-4e0719e27668?w=800&q=80',
        publishedAt: new Date('2026-03-12T09:15:00Z'),
      },
      {
        title: 'Sony WF-1000XM6 Rumors: Smaller Case and Faster Loading',
        slug: 'sony-xm6-rumors',
        excerpt: "Everything we know about Sony's next flagship noise-cancelling earbuds.",
        content: `Sony is expected to announce the WF-1000XM6 later this year. Sources indicate a 15% reduction in case size and a new V2 processor that could potentially double the processing power for ANC filters, aiming to take back the crown from Bose.

Internal test models suggest Sony is moving toward a more ergonomic "hybrid" tip design—combining the comfort of silicone with the isolation of memory foam. This has been a point of contention for XM4 and XM5 users who found the stock foam tips prone to degradation.

Connectivity will also get a boost with Bluetooth 5.4 support and optimized LE Audio, allowing for multi-point connection across three devices simultaneously without the occasional dropout seen in previous generations.`,
        readTime: 4,
        tags: ['Sony', 'ANC', 'Leaks'],
        featuredImage: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=800&q=80',
        publishedAt: new Date('2026-03-10T16:45:00Z'),
      },
      {
        title: 'Bose QuietComfort Ultra: Still the ANC King in 2026?',
        slug: 'bose-qc-ultra-2026-review',
        excerpt: "Bose's \"Immersive Audio\" has been out for a while. We revisit the QC Ultra to see if it holds up against the newer competition.",
        content: `While other brands focus on health and connectivity, Bose remains laser-focused on one thing: silence. In 2026, the QuietComfort Ultra remains the benchmark for low-frequency isolation in urban environments.

The "Immersive Audio" mode, which uses head-tracking to simulate a spatial soundstage, remains a highlight of the experience. Unlike Apple's implementation, Bose's spatial audio works with any source, making it a versatile choice for movie lovers and podcast listeners alike.

Battery life remains its Achilles' heel, however. With Immersive Audio turned on, you can only expect about 4 hours of juice. For long-haul flights, users might find themselves reaching for their XM5s or AirPods Max instead if they don't have time for a quick charge.`,
        readTime: 7,
        tags: ['Bose', 'Audio Quality', 'ANC'],
        featuredImage: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&q=80',
        publishedAt: new Date('2026-03-05T11:20:00Z'),
      },
      {
        title: 'Huawei Loss Care: A Built-In Insurance for Your FreeBuds',
        slug: 'huawei-loss-care-freebuds',
        excerpt: 'Huawei now offers an official loss-protection plan for FreeBuds owners. Is it worth it, and how does it compare to the secondary market?',
        content: `Huawei has quietly rolled out a service called "Loss Care" specifically for its FreeBuds product line. The concept is straightforward: pay a small fee when purchasing your FreeBuds, and if you lose a single earbud or the charging case within the coverage period, Huawei will replace it at a significantly reduced cost.

This is a notable move in the true wireless earbud space, where losing a single bud has traditionally meant either buying a full replacement set or turning to the secondary market. Huawei's approach acknowledges a pain point that platforms like PairAgain were built to solve.

**How it works:** After purchasing the Loss Care add-on, users register their FreeBuds through the Huawei Support app. If a component is lost, they can file a claim and receive a replacement unit for a fraction of the retail price. The service currently covers FreeBuds Pro 3, FreeBuds 6i, and select other models.

**The catch:** Loss Care only covers one replacement per coverage period, and the replacement must be for the same model. It doesn't cover physical damage, water damage, or theft — only accidental loss.

**How it compares to PairAgain:** While Huawei's Loss Care is a manufacturer-backed insurance model, PairAgain's marketplace offers more flexibility. On PairAgain, you can find replacement buds across all brands, negotiate prices, and even trade components you no longer need. For Huawei users specifically, Loss Care is a convenient first line of defense, but PairAgain remains the go-to for cross-brand replacements and cost-conscious buyers.

For full details on Huawei's Loss Care program, visit the [official Huawei Loss Care page](https://consumer.huawei.com/fr/support/huawei-loss-care-for-freebuds/).`,
        readTime: 4,
        tags: ['Huawei', 'Insurance', 'FreeBuds'],
        featuredImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
        publishedAt: new Date('2026-03-22T08:00:00Z'),
      },
    ];

    const results = [];
    for (const post of seedPosts) {
      const existing = await this.prisma.blogPost.findUnique({ where: { slug: post.slug } });
      if (existing) {
        results.push({ slug: post.slug, status: 'skipped (already exists)' });
        continue;
      }
      await this.prisma.blogPost.create({
        data: {
          ...post,
          status: 'PUBLISHED',
          authorId: adminUserId,
        },
      });
      results.push({ slug: post.slug, status: 'created' });
    }
    return { seeded: results };
  }
}
