import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class StorageConfig {
  constructor(private configService: ConfigService) {}

  getStorageType(): 's3' | 'local' | 'url' {
    return (this.configService.get<string>('STORAGE_TYPE') || 'url') as 's3' | 'local' | 'url';
  }

  getS3Config() {
    return {
      region: this.configService.get<string>('AWS_REGION'),
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY'),
      },
      bucket: this.configService.get<string>('AWS_S3_BUCKET'),
      cloudFrontUrl: this.configService.get<string>('AWS_CLOUDFRONT_URL'),
    };
  }
}
