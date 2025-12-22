import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import { randomUUID } from 'crypto';
import { Readable } from 'stream';
import type { Multer } from 'multer';

type UploadResult = {
  publicId: string;
  url: string;
  resourceType?: string;
  format?: string;
  bytes?: number;
  width?: number;
  height?: number;
};

@Injectable()
export class UploadService {
  private readonly uploadFolder: string;

  constructor(private readonly configService: ConfigService) {
    const cloudName = this.configService.get<string>('CLOUDINARY_CLOUD_NAME');
    const apiKey = this.configService.get<string>('CLOUDINARY_API_KEY');
    const apiSecret = this.configService.get<string>('CLOUDINARY_API_SECRET');

    if (!cloudName || !apiKey || !apiSecret) {
      throw new InternalServerErrorException(
        'Cloudinary configuration is missing. Please check CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET.',
      );
    }

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    });

    this.uploadFolder =
      this.configService.get<string>('CLOUDINARY_UPLOAD_FOLDER') || 'uploads';
  }

  async uploadFile(file?: Multer.File): Promise<UploadResult> {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    const publicId = randomUUID();
    const mimeType = file.mimetype;

    let resourceType: 'image' | 'video' | 'raw' | 'auto' = 'auto';

    if (mimeType.startsWith('image/')) {
      resourceType = 'image';
    } else if (mimeType.startsWith('audio/') || mimeType.startsWith('video/')) {
      resourceType = 'video';
    } else if (
      mimeType ===
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      mimeType === 'application/vnd.ms-excel'
    ) {
      resourceType = 'raw';
    } else {
      resourceType = 'auto';
    }

    return new Promise<UploadResult>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: this.uploadFolder,
          resource_type: resourceType,
          public_id: publicId,
        },
        (error, result) => {
          if (error) {
            return reject(new BadRequestException(error.message));
          }

          if (!result) {
            return reject(
              new InternalServerErrorException('Failed to upload image'),
            );
          }

          return resolve({
            publicId: result.public_id,
            url: result.secure_url,
            resourceType: result.resource_type,
            format: result.format,
            bytes: result.bytes,
            width: result.width,
            height: result.height,
          });
        },
      );

      Readable.from(file.buffer).pipe(uploadStream);
    });
  }
}
