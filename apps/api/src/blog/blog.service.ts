import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

type PostStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

export interface CreateBlogPostDto {
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  featuredImage?: string;
  tags?: string[];
  category?: string;
  readTime?: number;
  featured?: boolean;
  status?: PostStatus;
  publishedAt?: string;
}

export interface UpdateBlogPostDto {
  title?: string;
  excerpt?: string;
  content?: string;
  featuredImage?: string;
  tags?: string[];
  readTime?: number;
  featured?: boolean;
  status?: PostStatus;
}

@Injectable()
export class BlogService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: {
    page?: number;
    limit?: number;
    tag?: string;
    search?: string;
    status?: PostStatus;
  } = {}) {
    const { page = 1, limit = 20, tag, search, status = 'PUBLISHED' } = query;
    const skip = (page - 1) * limit;

    const where: any = { status };

    if (tag) {
      where.tags = { has: tag };
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [posts, total] = await Promise.all([
      this.prisma.blogPost.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          featuredImage: true,
          tags: true,
          category: true,
          readTime: true,
          featured: true,
          views: true,
          likes: true,
          commentCount: true,
          publishedAt: true,
          createdAt: true,
          author: { select: { id: true, name: true, avatar: true } },
        },
      }),
      this.prisma.blogPost.count({ where }),
    ]);

    return {
      data: posts.map(p => this.mapPost(p)),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string) {
    const post = await this.prisma.blogPost.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, name: true, avatar: true } },
      },
    });

    if (!post) {
      throw new NotFoundException('Blog post not found');
    }

    // Increment views
    await this.prisma.blogPost.update({
      where: { id },
      data: { views: { increment: 1 } },
    });

    return this.mapPost(post);
  }

  async findBySlug(slug: string) {
    const post = await this.prisma.blogPost.findUnique({
      where: { slug },
      include: {
        author: { select: { id: true, name: true, avatar: true } },
      },
    });

    if (!post) {
      throw new NotFoundException('Blog post not found');
    }

    // Increment views
    await this.prisma.blogPost.update({
      where: { slug },
      data: { views: { increment: 1 } },
    });

    return this.mapPost(post);
  }

  async create(authorId: string, dto: CreateBlogPostDto) {
    const status: PostStatus = dto.status || 'PUBLISHED';
    const publishedAt = status === 'PUBLISHED'
      ? (dto.publishedAt ? new Date(dto.publishedAt) : new Date())
      : null;

    const post = await this.prisma.blogPost.create({
      data: {
        title: dto.title,
        slug: dto.slug,
        excerpt: dto.excerpt,
        content: dto.content,
        featuredImage: dto.featuredImage,
        tags: dto.tags || [],
        category: dto.category,
        readTime: dto.readTime || 5,
        featured: dto.featured || false,
        status,
        publishedAt,
        authorId,
      },
      include: {
        author: { select: { id: true, name: true, avatar: true } },
      },
    });

    return this.mapPost(post);
  }

  async update(id: string, userId: string, isAdmin: boolean, dto: UpdateBlogPostDto) {
    const existing = await this.prisma.blogPost.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Blog post not found');

    if (!isAdmin && existing.authorId !== userId) {
      throw new ForbiddenException('You can only edit your own blog posts');
    }

    const updated = await this.prisma.blogPost.update({
      where: { id },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.excerpt !== undefined && { excerpt: dto.excerpt }),
        ...(dto.content !== undefined && { content: dto.content }),
        ...(dto.featuredImage !== undefined && { featuredImage: dto.featuredImage }),
        ...(dto.tags !== undefined && { tags: dto.tags }),
        ...(dto.readTime !== undefined && { readTime: dto.readTime }),
        ...(dto.featured !== undefined && { featured: dto.featured }),
        ...(dto.status !== undefined && { status: dto.status }),
        ...(dto.status === 'PUBLISHED' && !existing.publishedAt && { publishedAt: new Date() }),
      },
      include: {
        author: { select: { id: true, name: true, avatar: true } },
      },
    });

    return this.mapPost(updated);
  }

  private mapPost(post: any) {
    return {
      id: post.id,
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt || '',
      content: post.content,
      // Renamed from featuredImage (DB) to coverImage to match the frontend BlogPost interface
      coverImage: post.featuredImage || '',
      tags: post.tags || [],
      category: post.category || '',
      views: post.views || 0,
      likes: post.likes || 0,
      commentCount: post.commentCount || 0,
      publishedAt: post.publishedAt?.toISOString() || post.createdAt?.toISOString() || new Date().toISOString(),
      createdAt: post.createdAt?.toISOString() || new Date().toISOString(),
      readTime: post.readTime || 5,
      featured: post.featured || false,
      author: {
        id: post.author?.id || '',
        name: post.author?.name || 'Unknown',
        avatar: post.author?.avatar || undefined,
      },
    };
  }
}
