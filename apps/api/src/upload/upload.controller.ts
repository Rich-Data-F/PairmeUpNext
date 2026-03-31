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
import { UploadService } from '../common/services/upload.service';
import { PrismaService } from '../prisma/prisma.service';
import { v4 as uuidv4 } from 'uuid';

@Controller('upload')
export class UploadController {
  constructor(
    private readonly uploadService: UploadService,
    private readonly prisma: PrismaService,
  ) {}

  @Post('image')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('image'))
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @GetUser() user: any,
    @Body() body: any,
  ) {
    if (!file) {
      throw new BadRequestException('No image file provided');
    }

    const category = body.category || 'listing';
    const source = body.source || 'upload';

    // Upload to MinIO
    const variants = await this.uploadService.uploadImage(
      {
        fieldname: file.fieldname,
        originalname: file.originalname,
        encoding: file.encoding,
        mimetype: file.mimetype,
        size: file.size,
        buffer: file.buffer,
      },
      category,
      user.id,
    );

    // Pick 'medium' as main URL, and 'original' for full size
    const original = variants.find(v => v.key.includes('_original.webp')) || variants[0];
    const medium = variants.find(v => v.key.includes('_medium.webp')) || original;
    const thumbnail = variants.find(v => v.key.includes('_thumbnail.webp')) || original;

    // Save to Prisma
    const fileRecord = await this.prisma.file.create({
      data: {
        id: uuidv4(),
        originalName: file.originalname,
        filename: original.key,
        path: original.key, // Using key as path
        thumbnailPath: thumbnail.key,
        size: original.size,
        mimeType: 'image/webp',
        width: original.width,
        height: original.height,
        uploadedById: user.id,
        type: category,
        source: source,
      },
    });

    return {
      id: fileRecord.id,
      originalName: fileRecord.originalName,
      filename: fileRecord.filename,
      url: medium.url,
      thumbnailUrl: thumbnail.url,
      fullUrl: original.url,
      variants: variants,
    };
  }

  @Post('verification')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('verification'))
  async uploadVerification(
    @UploadedFile() file: Express.Multer.File,
    @GetUser() user: any,
  ) {
    if (!file) {
      throw new BadRequestException('No verification file provided');
    }

    return this.uploadImage(file, user, { category: 'verification' });
  }

  @Post('multiple')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FilesInterceptor('images', 10))
  async uploadMultipleImages(
    @UploadedFiles() files: Express.Multer.File[],
    @GetUser() user: any,
    @Body() body: any,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No image files provided');
    }

    const uploadPromises = files.map(file => this.uploadImage(file, user, body));
    return Promise.all(uploadPromises);
  }

  // Serve an image directly by its object key (used by frontend image proxy)
  @Get('serve-key/*')
  async serveByKey(@Param('0') rawKey: string, @Res() res: Response) {
    try {
      const key = decodeURIComponent(rawKey);
      const stream = await this.uploadService.streamObject(key);
      res.setHeader('Content-Type', 'image/webp');
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      stream.pipe(res);
    } catch (error: any) {
      console.error(`serve-key error for key: ${rawKey}`, error.message);
      return res.status(404).json({ message: 'Image not found' });
    }
  }

  // Backwards compatibility redirect or serving
  @Get('serve/:fileId')
  async serveFile(@Param('fileId') fileId: string, @Res() res: Response) {
    try {
      const file = await this.prisma.file.findUnique({
        where: { id: fileId },
      });
      if (!file) {
        return res.status(404).json({ message: 'File not found' });
      }

      // Instead of serving from disk, we redirect to MinIO unless it's a legacy local path
      if (file.path.startsWith('uploads/')) {
        // Redirect to MinIO public URL if it's a key
        // Or actually, just return the URL directly from Common service
        // Since we don't have the key directly if it was an old path, let's try to infer
        const url = `http://${process.env.MINIO_ENDPOINT || 'localhost'}:${process.env.MINIO_PORT || '9000'}/${process.env.MINIO_BUCKET_NAME || 'pair-me-up'}/${file.path}`;
        return res.redirect(url);
      }

      return res.status(404).json({ message: 'File has no valid path' });
    } catch (error) {
      return res.status(500).json({ message: 'Error serving file' });
    }
  }

  @Get('user/:userId')
  @UseGuards(JwtAuthGuard)
  async getUserFiles(
    @Param('userId') userId: string,
    @GetUser() user: any,
  ) {
    if (user.id !== userId && user.role !== 'ADMIN') {
      throw new BadRequestException('Access denied');
    }

    const files = await this.prisma.file.findMany({
      where: { uploadedById: userId },
      orderBy: { createdAt: 'desc' },
    });

    return files.map(f => ({
      id: f.id,
      originalName: f.originalName,
      filename: f.filename,
      url: `http://${process.env.MINIO_ENDPOINT || 'localhost'}:${process.env.MINIO_PORT || '9000'}/${process.env.MINIO_BUCKET_NAME || 'pair-me-up'}/${f.path}`,
      createdAt: f.createdAt,
    }));
  }

  @Post('test')
  async testUploadModule() {
    return {
      status: 'success',
      message: 'Upload module rebranded to use MinIO',
      timestamp: new Date().toISOString(),
      provider: 'MinIO',
    };
  }
}
