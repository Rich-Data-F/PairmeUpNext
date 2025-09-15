import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { PrismaModule } from '../prisma/prisma.module';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Module({
  imports: [
    PrismaModule,
    MulterModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        storage: diskStorage({
          destination: (req, file, cb) => {
            const uploadDir = configService.get<string>('UPLOAD_DIR', './uploads');
            
            // Determine subdirectory based on file type or endpoint
            let subDir = 'images';
            if (req.path.includes('verification')) {
              subDir = 'verification';
            }
            
            cb(null, `${uploadDir}/${subDir}`);
          },
          filename: (req, file, cb) => {
            // Generate unique filename with timestamp and random string
            const timestamp = Date.now();
            const randomName = Math.round(Math.random() * 1e9);
            const ext = extname(file.originalname);
            cb(null, `${timestamp}-${randomName}${ext}`);
          },
        }),
        fileFilter: (req, file, cb) => {
          // Only allow image files
          if (file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
            cb(null, true);
          } else {
            cb(new Error('Only image files are allowed!'), false);
          }
        },
        limits: {
          fileSize: 10 * 1024 * 1024, // 10MB limit
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [UploadController],
  providers: [UploadService],
  exports: [UploadService],
})
export class UploadModule {}
