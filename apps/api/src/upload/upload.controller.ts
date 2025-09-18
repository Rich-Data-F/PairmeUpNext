import {
  Controller,
  Post,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
  Body,
  BadRequestException,
  Get,
  Param,
  Res,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { UploadService, UploadedFile as UploadedFileDto } from './upload.service';
import * as path from 'path';
import * as fs from 'fs';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('image')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image'))
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @GetUser() user: any,
    @Body() body: any, // Allow any body for multipart form data
  ): Promise<UploadedFileDto> {
    if (!file) {
      throw new BadRequestException('No image file provided');
    }

    // Get source from body - handle both string and object cases
    let source: 'camera' | 'upload' = 'upload';
    if (body) {
      if (typeof body === 'object' && body.source) {
        source = body.source;
      } else if (typeof body === 'string') {
        // Try to parse as JSON or get source from string
        try {
          const parsed = JSON.parse(body);
          if (parsed.source) source = parsed.source;
        } catch {
          // If it's not JSON, it might be the source value directly
          if (body === 'camera' || body === 'upload') {
            source = body;
          }
        }
      }
    }

    return this.uploadService.uploadImage(
      file,
      user.id,
      body.category || 'listing',
      source
    );
  }

  @Post('verification')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('verification'))
  async uploadVerification(
    @UploadedFile() file: Express.Multer.File,
    @GetUser() user: any,
  ): Promise<UploadedFileDto> {
    if (!file) {
      throw new BadRequestException('No verification file provided');
    }

    return this.uploadService.uploadImage(
      file,
      user.id,
      'verification',
    );
  }

  @Post('multiple')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor('images', 10))
  async uploadMultipleImages(
    @UploadedFiles() files: Express.Multer.File[],
    @GetUser() user: any,
    @Body() body: any, // Allow any body for multipart form data
  ): Promise<UploadedFileDto[]> {
    if (!files || files.length === 0) {
      throw new BadRequestException('No image files provided');
    }

    // Get sources from body - can be array or single value
    let sources: ('camera' | 'upload')[] = [];
    if (body) {
      if (typeof body === 'object' && body.sources) {
        // Handle array of sources
        if (Array.isArray(body.sources)) {
          sources = body.sources.map(s => s === 'camera' ? 'camera' : 'upload');
        } else {
          sources = [body.sources === 'camera' ? 'camera' : 'upload'];
        }
      } else if (typeof body === 'string') {
        // Try to parse as JSON or get source from string
        try {
          const parsed = JSON.parse(body);
          if (parsed.sources && Array.isArray(parsed.sources)) {
            sources = parsed.sources.map(s => s === 'camera' ? 'camera' : 'upload');
          } else if (parsed.source) {
            sources = [parsed.source === 'camera' ? 'camera' : 'upload'];
          }
        } catch {
          // If it's not JSON, it might be the source value directly
          const source = body === 'camera' ? 'camera' : 'upload';
          sources = [source];
        }
      }
    }

    // If we don't have enough sources, fill with 'upload' default
    while (sources.length < files.length) {
      sources.push('upload');
    }

    // Trim to match file count
    sources = sources.slice(0, files.length);

    return this.uploadService.uploadMultipleImages(
      files,
      user.id,
      'listing',
      sources
    );
  }

  @Get('serve/:fileId')
  async serveFile(@Param('fileId') fileId: string, @Res() res: Response) {
    try {
      const file = await this.uploadService.getFileById(fileId);
      if (!file) {
        return res.status(404).json({ message: 'File not found' });
      }

      const filePath = path.resolve(file.path);
      
      // Check if file exists on filesystem
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({ message: 'File not found on disk' });
      }

      // Set appropriate headers
      res.setHeader('Content-Type', file.mimeType);
      res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 year cache
      
      return res.sendFile(filePath);
    } catch (error) {
      return res.status(500).json({ message: 'Error serving file' });
    }
  }

  @Get('thumbnail/:fileId')
  async serveThumbnail(@Param('fileId') fileId: string, @Res() res: Response) {
    try {
      const thumbnailPath = await this.uploadService.getThumbnailPath(fileId);
      if (!thumbnailPath || !fs.existsSync(thumbnailPath)) {
        return res.status(404).json({ message: 'Thumbnail not found' });
      }

      res.setHeader('Content-Type', 'image/jpeg');
      res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 year cache
      
      return res.sendFile(path.resolve(thumbnailPath));
    } catch (error) {
      return res.status(500).json({ message: 'Error serving thumbnail' });
    }
  }

  @Get('user/:userId')
  @UseGuards(JwtAuthGuard)
  async getUserFiles(
    @Param('userId') userId: string,
    @GetUser() user: any,
  ) {
    // Users can only access their own files (or implement admin check)
    if (user.id !== userId) {
      throw new BadRequestException('Access denied');
    }

    return this.uploadService.getUserFiles(userId);
  }

  @Post('test')
  async testUploadModule() {
    return {
      status: 'success',
      message: 'Upload module is properly loaded and configured',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      uploadDir: process.env.UPLOAD_DIR || './uploads',
    };
  }
}
