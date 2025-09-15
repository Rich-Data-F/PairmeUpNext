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
    @Body() body: { category?: 'listing' | 'verification' | 'profile'; description?: string },
  ): Promise<UploadedFileDto> {
    if (!file) {
      throw new BadRequestException('No image file provided');
    }

    return this.uploadService.uploadImage(
      file,
      user.id,
      body.category || 'listing',
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
    @Body() body: { category?: string; description?: string },
  ): Promise<UploadedFileDto[]> {
    if (!files || files.length === 0) {
      throw new BadRequestException('No image files provided');
    }

    const uploadPromises = files.map(file =>
      this.uploadService.uploadImage(
        file,
        user.id,
        'listing',
      ),
    );

    return Promise.all(uploadPromises);
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
