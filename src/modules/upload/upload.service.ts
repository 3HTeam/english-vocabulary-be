import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';
import { extname } from 'path';
import type { Multer } from 'multer';

type SupabaseConfig = {
  url?: string;
  anonKey?: string;
  serviceRoleKey?: string;
  bucket?: string;
  uploadFolder?: string;
};

@Injectable()
export class UploadService {
  private readonly supabaseClient: SupabaseClient;
  private readonly bucketName: string;
  private readonly uploadFolder: string;

  constructor(private readonly configService: ConfigService) {
    const supabaseConfig = this.configService.get<SupabaseConfig>('supabase');
    const url = supabaseConfig?.url;
    const serviceRoleKey = supabaseConfig?.serviceRoleKey;

    if (!url || !serviceRoleKey) {
      throw new InternalServerErrorException(
        'Supabase configuration is missing. Please check SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.',
      );
    }

    this.bucketName = supabaseConfig?.bucket || 'public';
    this.uploadFolder = supabaseConfig?.uploadFolder || 'uploads';
    this.supabaseClient = createClient(url, serviceRoleKey);
  }

  async uploadFile(file?: Multer.File) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    const fileExtension = extname(file.originalname);
    const fileName = `${randomUUID()}${fileExtension}`;
    const path = `${this.uploadFolder}/${fileName}`;

    const { error } = await this.supabaseClient.storage
      .from(this.bucketName)
      .upload(path, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (error) {
      throw new BadRequestException(error.message);
    }

    const { data } = this.supabaseClient.storage
      .from(this.bucketName)
      .getPublicUrl(path);

    return {
      path,
      url: data.publicUrl,
    };
  }
}
