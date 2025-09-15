import { Injectable, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';

export interface UploadedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

export interface ProcessedImage {
  url: string;
  key: string;
  size: number;
  width: number;
  height: number;
  format: string;
}

export interface ImageVariant {
  name: string;
  width: number;
  height: number;
  quality: number;
  fit: keyof sharp.FitEnum;
}

@Injectable()
export class UploadService {
  private readonly minioClient: Minio.Client;
  private readonly bucketName: string;
  private readonly allowedMimeTypes: string[];
  private readonly maxFileSize: number;

  // Image variants for different use cases
  private readonly imageVariants: ImageVariant[] = [
    { name: 'thumbnail', width: 150, height: 150, quality: 80, fit: 'cover' },
    { name: 'small', width: 400, height: 400, quality: 85, fit: 'inside' },
    { name: 'medium', width: 800, height: 600, quality: 90, fit: 'inside' },
    { name: 'large', width: 1200, height: 900, quality: 95, fit: 'inside' },
  ];

  constructor(private readonly configService: ConfigService) {
    // Initialize MinIO client
    this.minioClient = new Minio.Client({
      endPoint: this.configService.get<string>('MINIO_ENDPOINT') || 'localhost',
      port: parseInt(this.configService.get<string>('MINIO_PORT') || '9000'),
      useSSL: this.configService.get<string>('NODE_ENV') === 'production',
      accessKey: this.configService.get<string>('MINIO_ACCESS_KEY') || 'minioadmin',
      secretKey: this.configService.get<string>('MINIO_SECRET_KEY') || 'minioadmin123',
    });

    this.bucketName = this.configService.get<string>('MINIO_BUCKET_NAME') || 'earbudhub-uploads';
    this.allowedMimeTypes = (
      this.configService.get<string>('ALLOWED_FILE_TYPES') || 'image/jpeg,image/png,image/webp'
    ).split(',');
    this.maxFileSize = parseInt(
      this.configService.get<string>('MAX_FILE_SIZE') || '5242880' // 5MB
    );

    // Optionally skip MinIO bucket initialization in local dev to avoid startup failures
    const skipMinioInit = this.configService.get<string>('SKIP_MINIO_INIT') === 'true';
    if (!skipMinioInit) {
      this.initializeBucket();
    } else {
      console.warn('⚠️  SKIP_MINIO_INIT=true — skipping MinIO bucket initialization');
    }
  }

  /**
   * Initialize MinIO bucket if it doesn't exist
   */
  private async initializeBucket(): Promise<void> {
    try {
      const bucketExists = await this.minioClient.bucketExists(this.bucketName);
      if (!bucketExists) {
        await this.minioClient.makeBucket(this.bucketName, 'us-east-1');
        
        // Set bucket policy for public read access to images
        const policy = {
          Version: '2012-10-17',
          Statement: [
            {
              Effect: 'Allow',
              Principal: { AWS: ['*'] },
              Action: ['s3:GetObject'],
              Resource: [`arn:aws:s3:::${this.bucketName}/images/*`],
            },
          ],
        };
        
        await this.minioClient.setBucketPolicy(this.bucketName, JSON.stringify(policy));
        console.log(`✅ MinIO bucket '${this.bucketName}' created and configured`);
      }
    } catch (error) {
      console.error('❌ Failed to initialize MinIO bucket:', error);
    }
  }

  /**
   * Validate uploaded file
   * @param file - Uploaded file to validate
   */
  private validateFile(file: UploadedFile): void {
    // Check file size
    if (file.size > this.maxFileSize) {
      throw new BadRequestException(
        `File size too large. Maximum allowed size is ${this.maxFileSize / 1024 / 1024}MB`
      );
    }

    // Check MIME type
    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `File type not allowed. Allowed types: ${this.allowedMimeTypes.join(', ')}`
      );
    }

    // Check if file has content
    if (!file.buffer || file.buffer.length === 0) {
      throw new BadRequestException('File is empty');
    }
  }

  /**
   * Upload a single image with multiple variants
   * @param file - Uploaded file
   * @param folder - Folder path in bucket (e.g., 'listings', 'profiles')
   * @param userId - User ID for organizing uploads
   * @returns Promise<ProcessedImage[]>
   */
  async uploadImage(
    file: UploadedFile,
    folder: string = 'images',
    userId?: string
  ): Promise<ProcessedImage[]> {
    this.validateFile(file);

    try {
      const fileId = uuidv4();
      const fileExtension = this.getFileExtension(file.originalname);
      const timestamp = Date.now();
      
      // Create base path
      const basePath = userId 
        ? `${folder}/${userId}/${timestamp}/${fileId}`
        : `${folder}/${timestamp}/${fileId}`;

      const processedImages: ProcessedImage[] = [];

      // Process original image and create variants
      for (const variant of this.imageVariants) {
        const processedBuffer = await this.processImage(file.buffer, variant);
        const key = `${basePath}_${variant.name}.webp`;
        
        // Upload to MinIO
        await this.minioClient.putObject(
          this.bucketName,
          key,
          processedBuffer,
          processedBuffer.length,
          {
            'Content-Type': 'image/webp',
            'Cache-Control': 'max-age=31536000', // 1 year
          }
        );

        // Get image metadata
        const metadata = await sharp(processedBuffer).metadata();
        
        processedImages.push({
          url: this.getFileUrl(key),
          key,
          size: processedBuffer.length,
          width: metadata.width || variant.width,
          height: metadata.height || variant.height,
          format: 'webp',
        });
      }

      // Also store original (optimized)
      const originalBuffer = await this.processImage(file.buffer, {
        name: 'original',
        width: 2000,
        height: 2000,
        quality: 95,
        fit: 'inside',
      });
      
      const originalKey = `${basePath}_original.webp`;
      await this.minioClient.putObject(
        this.bucketName,
        originalKey,
        originalBuffer,
        originalBuffer.length,
        {
          'Content-Type': 'image/webp',
          'Cache-Control': 'max-age=31536000',
        }
      );

      const originalMetadata = await sharp(originalBuffer).metadata();
      processedImages.push({
        url: this.getFileUrl(originalKey),
        key: originalKey,
        size: originalBuffer.length,
        width: originalMetadata.width || 0,
        height: originalMetadata.height || 0,
        format: 'webp',
      });

      return processedImages;
    } catch (error) {
      console.error('Upload error:', error);
      throw new InternalServerErrorException('Failed to upload image');
    }
  }

  /**
   * Upload multiple images
   * @param files - Array of uploaded files
   * @param folder - Folder path in bucket
   * @param userId - User ID for organizing uploads
   * @returns Promise<ProcessedImage[][]>
   */
  async uploadImages(
    files: UploadedFile[],
    folder: string = 'images',
    userId?: string
  ): Promise<ProcessedImage[][]> {
    const uploadPromises = files.map(file => 
      this.uploadImage(file, folder, userId)
    );
    
    return Promise.all(uploadPromises);
  }

  /**
   * Delete an image and all its variants
   * @param key - Image key to delete
   */
  async deleteImage(key: string): Promise<void> {
    try {
      // Extract base path from key
      const basePath = key.replace(/_[^_]+\.webp$/, '');
      
      // Delete all variants
      const deletePromises = this.imageVariants.map(variant => 
        this.minioClient.removeObject(this.bucketName, `${basePath}_${variant.name}.webp`)
          .catch(() => {}) // Ignore errors for missing files
      );
      
      // Delete original
      deletePromises.push(
        this.minioClient.removeObject(this.bucketName, `${basePath}_original.webp`)
          .catch(() => {})
      );
      
      await Promise.all(deletePromises);
    } catch (error) {
      console.error('Delete error:', error);
      throw new InternalServerErrorException('Failed to delete image');
    }
  }

  /**
   * Delete multiple images
   * @param keys - Array of image keys to delete
   */
  async deleteImages(keys: string[]): Promise<void> {
    const deletePromises = keys.map(key => this.deleteImage(key));
    await Promise.all(deletePromises);
  }

  /**
   * Get presigned URL for temporary access
   * @param key - Image key
   * @param expirySeconds - URL expiry time in seconds (default: 1 hour)
   * @returns Promise<string>
   */
  async getPresignedUrl(key: string, expirySeconds: number = 3600): Promise<string> {
    try {
      return await this.minioClient.presignedGetObject(this.bucketName, key, expirySeconds);
    } catch (error) {
      throw new InternalServerErrorException('Failed to generate presigned URL');
    }
  }

  /**
   * Process image with Sharp
   * @param buffer - Image buffer
   * @param variant - Image variant configuration
   * @returns Promise<Buffer>
   */
  private async processImage(buffer: Buffer, variant: ImageVariant): Promise<Buffer> {
    return sharp(buffer)
      .resize(variant.width, variant.height, {
        fit: variant.fit,
        withoutEnlargement: true,
      })
      .webp({ quality: variant.quality })
      .toBuffer();
  }

  /**
   * Get public URL for an image
   * @param key - Image key
   * @returns string
   */
  private getFileUrl(key: string): string {
    const endpoint = this.configService.get<string>('MINIO_ENDPOINT') || 'localhost';
    const port = this.configService.get<string>('MINIO_PORT') || '9000';
    const protocol = this.configService.get<string>('NODE_ENV') === 'production' ? 'https' : 'http';
    
    return `${protocol}://${endpoint}:${port}/${this.bucketName}/${key}`;
  }

  /**
   * Extract file extension from filename
   * @param filename - Original filename
   * @returns string
   */
  private getFileExtension(filename: string): string {
    return filename.split('.').pop()?.toLowerCase() || '';
  }

  /**
   * Get image info without downloading
   * @param key - Image key
   * @returns Promise<any>
   */
  async getImageInfo(key: string): Promise<any> {
    try {
      return await this.minioClient.statObject(this.bucketName, key);
    } catch (error) {
      throw new BadRequestException('Image not found');
    }
  }

  /**
   * List images in a folder
   * @param prefix - Folder prefix
   * @param maxKeys - Maximum number of keys to return
   * @returns Promise<string[]>
   */
  async listImages(prefix: string = 'images/', maxKeys: number = 1000): Promise<string[]> {
    return new Promise((resolve, reject) => {
      const keys: string[] = [];
      const stream = this.minioClient.listObjects(this.bucketName, prefix, true);
      
      stream.on('data', (obj) => {
        if (obj.name) {
          keys.push(obj.name);
        }
      });
      
      stream.on('end', () => {
        resolve(keys.slice(0, maxKeys));
      });
      
      stream.on('error', (error) => {
        reject(error);
      });
    });
  }

  /**
   * Get presigned URL for secure uploads
   */
  async getPresignedUploadUrl(fileName: string, contentType: string, userId: string): Promise<string> {
    const key = this.generateFileKey(fileName, userId);
    
    return await this.minioClient.presignedPutObject(
      this.bucketName,
      key,
      24 * 60 * 60, // 24 hours
    );
  }

  /**
   * Get presigned URL for secure downloads
   */
  async getPresignedDownloadUrl(key: string): Promise<string> {
    return await this.minioClient.presignedGetObject(
      this.bucketName,
      key,
      24 * 60 * 60 // 24 hours
    );
  }

  /**
   * Get image URLs for different variants
   */
  async getImageUrls(key: string): Promise<{ thumbnailUrl: string; fullUrl: string }> {
    const thumbnailKey = key.replace(/(\.[^.]+)$/, '_thumb$1');
    
    const [thumbnailUrl, fullUrl] = await Promise.all([
      this.getPresignedDownloadUrl(thumbnailKey),
      this.getPresignedDownloadUrl(key)
    ]);

    return { thumbnailUrl, fullUrl };
  }

  /**
   * Generate file key for uploads
   */
  private generateFileKey(fileName: string, userId: string): string {
    const fileId = uuidv4();
    const timestamp = Date.now();
    const extension = this.getFileExtension(fileName);
    
    return `uploads/${userId}/${timestamp}/${fileId}.${extension}`;
  }
}
