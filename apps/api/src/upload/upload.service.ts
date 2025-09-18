import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import * as fs from 'fs/promises';
import * as path from 'path';
import sharp from 'sharp';
import { randomBytes } from 'crypto';

export interface UploadedFile {
  id: string;
  originalName: string;
  filename: string;
  path: string;
  thumbnailPath?: string;
  size: number;
  mimeType: string;
  width?: number;
  height?: number;
  url: string;
  thumbnailUrl?: string;
}

@Injectable()
export class UploadService {
  private uploadDir: string;
  private baseUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    // Railway volume mount path or local storage
    this.uploadDir = this.configService.get<string>('UPLOAD_DIR', './uploads');
    this.baseUrl = this.configService.get<string>('API_URL', 'http://localhost:4000');
    this.ensureUploadDirectory();
  }

  private async ensureUploadDirectory() {
    try {
      await fs.access(this.uploadDir);
    } catch {
      await fs.mkdir(this.uploadDir, { recursive: true });
      await fs.mkdir(path.join(this.uploadDir, 'images'), { recursive: true });
      await fs.mkdir(path.join(this.uploadDir, 'thumbnails'), { recursive: true });
      await fs.mkdir(path.join(this.uploadDir, 'verification'), { recursive: true });
    }
  }

  async uploadImage(
    file: Express.Multer.File,
    userId: string,
    type: 'listing' | 'verification' | 'profile' = 'listing',
    source: 'camera' | 'upload' = 'upload'
  ): Promise<UploadedFile> {
    // Validate file type
    if (!file.mimetype.startsWith('image/')) {
      throw new BadRequestException('Only image files are allowed');
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new BadRequestException('File size must be less than 10MB');
    }

    // Generate unique filename
    const fileId = randomBytes(16).toString('hex');
    const ext = path.extname(file.originalname);
    const filename = `${fileId}${ext}`;
    
    const typeDir = type === 'verification' ? 'verification' : 'images';
    const filePath = path.join(this.uploadDir, typeDir, filename);
    const thumbnailFilename = `thumb_${filename}`;
    const thumbnailPath = path.join(this.uploadDir, 'thumbnails', thumbnailFilename);

    try {
      // Process and save the main image
      const imageBuffer = await sharp(file.path)
        .jpeg({ quality: 90 }) // Convert to JPEG and compress
        .resize(1920, 1920, { 
          fit: 'inside', 
          withoutEnlargement: true 
        })
        .toBuffer();

      await fs.writeFile(filePath, imageBuffer);

      // Generate thumbnail
      const thumbnailBuffer = await sharp(file.path)
        .jpeg({ quality: 80 })
        .resize(300, 300, { 
          fit: 'cover',
          position: 'center'
        })
        .toBuffer();

      await fs.writeFile(thumbnailPath, thumbnailBuffer);

      // Get image metadata
      const metadata = await sharp(file.path).metadata();

      // Save file metadata to database
      const fileRecord = await this.prisma.file.create({
        data: {
          id: fileId,
          originalName: file.originalname,
          filename,
          path: filePath,
          thumbnailPath,
          size: imageBuffer.length,
          mimeType: 'image/jpeg', // Always JPEG after processing
          width: metadata.width,
          height: metadata.height,
          uploadedById: userId,
          type,
          source,
        } as any, // Temporary type assertion to bypass TypeScript error
      });

      return {
        id: fileRecord.id,
        originalName: fileRecord.originalName,
        filename: fileRecord.filename,
        path: fileRecord.path,
        thumbnailPath: fileRecord.thumbnailPath,
        size: fileRecord.size,
        mimeType: fileRecord.mimeType,
        width: fileRecord.width || undefined,
        height: fileRecord.height || undefined,
        url: `${this.baseUrl}/uploads/${typeDir}/${filename}`,
        thumbnailUrl: `${this.baseUrl}/uploads/thumbnails/${thumbnailFilename}`,
      };
    } catch (error) {
      // Clean up files on error
      try {
        await fs.unlink(filePath);
        await fs.unlink(thumbnailPath);
      } catch {
        // Ignore cleanup errors
      }
      throw new BadRequestException(`Failed to process image: ${error.message}`);
    }
  }

  async uploadMultipleImages(
    files: Express.Multer.File[],
    userId: string,
    type: 'listing' | 'verification' | 'profile' = 'listing',
    sources: ('camera' | 'upload')[] = []
  ): Promise<UploadedFile[]> {
    // Ensure we have a source for each file, defaulting to 'upload'
    const fileSources = sources.length >= files.length 
      ? sources.slice(0, files.length)
      : [...sources, ...Array(files.length - sources.length).fill('upload')];

    const uploadPromises = files.map((file, index) => 
      this.uploadImage(file, userId, type, fileSources[index])
    );
    return Promise.all(uploadPromises);
  }

  async getFile(fileId: string): Promise<UploadedFile | null> {
    const file = await this.prisma.file.findUnique({
      where: { id: fileId },
    });

    if (!file) {
      return null;
    }

    const typeDir = file.type === 'verification' ? 'verification' : 'images';
    
    return {
      id: file.id,
      originalName: file.originalName,
      filename: file.filename,
      path: file.path,
      thumbnailPath: file.thumbnailPath,
      size: file.size,
      mimeType: file.mimeType,
      width: file.width || undefined,
      height: file.height || undefined,
      url: `${this.baseUrl}/uploads/${typeDir}/${file.filename}`,
      thumbnailUrl: file.thumbnailPath ? `${this.baseUrl}/uploads/thumbnails/thumb_${file.filename}` : undefined,
    };
  }

  async deleteFile(fileId: string, userId: string): Promise<void> {
    const file = await this.prisma.file.findFirst({
      where: {
        id: fileId,
        uploadedById: userId,
      },
    });

    if (!file) {
      throw new BadRequestException('File not found or unauthorized');
    }

    try {
      // Delete physical files
      await fs.unlink(file.path);
      if (file.thumbnailPath) {
        await fs.unlink(file.thumbnailPath);
      }
    } catch (error) {
      // Log error but continue with database cleanup
      console.error('Failed to delete physical file:', error);
    }

    // Remove from database
    await this.prisma.file.delete({
      where: { id: fileId },
    });
  }

  async serveFile(typeDir: string, filename: string): Promise<Buffer> {
    const filePath = path.join(this.uploadDir, typeDir, filename);
    
    try {
      return await fs.readFile(filePath);
    } catch (error) {
      throw new BadRequestException('File not found');
    }
  }

  async getUserFiles(userId: string, type?: string): Promise<UploadedFile[]> {
    const files = await this.prisma.file.findMany({
      where: {
        uploadedById: userId,
        ...(type && { type }),
      },
      orderBy: { createdAt: 'desc' },
    });

    return files.map(file => {
      const typeDir = file.type === 'verification' ? 'verification' : 'images';
      return {
        id: file.id,
        originalName: file.originalName,
        filename: file.filename,
        path: file.path,
        thumbnailPath: file.thumbnailPath,
        size: file.size,
        mimeType: file.mimeType,
        width: file.width || undefined,
        height: file.height || undefined,
        url: `${this.baseUrl}/uploads/${typeDir}/${file.filename}`,
        thumbnailUrl: file.thumbnailPath ? `${this.baseUrl}/uploads/thumbnails/thumb_${file.filename}` : undefined,
      };
    });
  }

  async getFileById(fileId: string): Promise<UploadedFile | null> {
    const file = await this.prisma.file.findUnique({
      where: { id: fileId },
    });

    if (!file) {
      return null;
    }

    const typeDir = file.type === 'verification' ? 'verification' : 'images';
    return {
      id: file.id,
      originalName: file.originalName,
      filename: file.filename,
      path: file.path,
      thumbnailPath: file.thumbnailPath,
      size: file.size,
      mimeType: file.mimeType,
      width: file.width || undefined,
      height: file.height || undefined,
      url: `${this.baseUrl}/uploads/${typeDir}/${file.filename}`,
      thumbnailUrl: file.thumbnailPath ? `${this.baseUrl}/uploads/thumbnails/thumb_${file.filename}` : undefined,
    };
  }

  async getThumbnailPath(fileId: string): Promise<string | null> {
    const file = await this.prisma.file.findUnique({
      where: { id: fileId },
      select: { thumbnailPath: true },
    });

    return file?.thumbnailPath || null;
  }
}
