import { Module, Global } from '@nestjs/common';
import { IdentifierService } from './services/identifier.service';
import { UploadService } from './services/upload.service';
import { GeoService } from './services/geo.service';

@Global()
@Module({
  providers: [IdentifierService, UploadService, GeoService],
  exports: [IdentifierService, UploadService, GeoService],
})
export class CommonModule {}
