import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BlogService } from './blog.service';
import { CreateBlogPostDto, UpdateBlogPostDto } from './dto/blog.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';

@ApiTags('blog')
@Controller('blog')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  // ─── Public endpoints ────────────────────────────────

  @Get()
  @ApiOperation({ summary: 'List published blog posts' })
  async list(
    @Query('tag') tag?: string,
    @Query('search') search?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.blogService.findPublished({
      tag,
      search,
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined,
    });
  }

  // Static routes MUST come before :slug wildcard
  @Get('my/posts')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all posts by current user' })
  async myPosts(@GetUser() user: any) {
    return this.blogService.findByAuthor(user.id);
  }

  @Post('seed')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Seed initial blog posts (admin only, idempotent)' })
  async seed(@GetUser() user: any) {
    if (!user.isAdmin) {
      return { error: 'Admin only' };
    }
    return this.blogService.seedInitialPosts(user.id);
  }

  @Get(':slug')
  @ApiOperation({ summary: 'Get a blog post by slug' })
  async getBySlug(@Param('slug') slug: string) {
    return this.blogService.findBySlug(slug);
  }

  // ─── Comment (semi-public) ───────────────────────────

  @Post(':id/comments')
  @ApiOperation({ summary: 'Add comment to a blog post' })
  async addComment(
    @Param('id') id: string,
    @Body() body: { content: string; guestName?: string; guestEmail?: string; parentId?: string },
  ) {
    return this.blogService.addComment(id, {
      content: body.content,
      guestName: body.guestName,
      guestEmail: body.guestEmail,
      parentId: body.parentId,
    });
  }

  @Post(':id/like')
  @ApiOperation({ summary: 'Like / react to a post' })
  async like(@Param('id') id: string) {
    return this.blogService.incrementLikes(id);
  }

  // ─── Auth-required endpoints ─────────────────────────

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new blog post' })
  async create(@GetUser() user: any, @Body() dto: CreateBlogPostDto) {
    return this.blogService.create(user.id, dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a blog post (author or admin)' })
  async update(
    @Param('id') id: string,
    @GetUser() user: any,
    @Body() dto: UpdateBlogPostDto,
  ) {
    return this.blogService.update(id, user.id, user.isAdmin === true, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a blog post (author or admin)' })
  async remove(@Param('id') id: string, @GetUser() user: any) {
    return this.blogService.remove(id, user.id, user.isAdmin === true);
  }
}
