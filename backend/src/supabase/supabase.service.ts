import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class SupabaseService {
  private readonly logger = new Logger(SupabaseService.name);
  private supabase: SupabaseClient;

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseKey = this.configService.get<string>('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      this.logger.error('Supabase URL or Service Role Key is missing from environment variables');
    } else {
      this.supabase = createClient(supabaseUrl, supabaseKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
    }
  }

  getClient(): SupabaseClient {
    return this.supabase;
  }

  async uploadFile(bucket: string, filePath: string, buffer: Buffer, mimeType: string): Promise<string> {
    const storageType = this.configService.get<string>('STORAGE_TYPE') || 'supabase';

    if (storageType === 'base64') {
      const base64Data = buffer.toString('base64');
      return `data:${mimeType};base64,${base64Data}`;
    }

    if (storageType === 'local') {
      const backendUrl = this.configService.get<string>('BACKEND_URL') || 'http://localhost:4000';
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads', bucket);
      const fullPath = path.join(uploadsDir, filePath);

      // Ensure directory exists
      fs.mkdirSync(path.dirname(fullPath), { recursive: true });
      fs.writeFileSync(fullPath, buffer);

      // Return the URL to access the file statically
      return `${backendUrl}/uploads/${bucket}/${filePath.replace(/\\/g, '/')}`;
    }

    const client = this.getClient();
    
    // Ensure bucket exists (or try uploading directly, Supabase will return error if it doesn't exist)
    const { data: buckets, error: listError } = await client.storage.listBuckets();
    if (listError) {
      this.logger.error(`Gagal list buckets: ${listError.message}`);
    }
    const bucketExists = buckets?.some(b => b.name === bucket);
    
    if (!bucketExists) {
      const { error: createError } = await client.storage.createBucket(bucket, {
        public: true,
      });
      if (createError) {
        this.logger.error(`Gagal membuat bucket ${bucket}: ${createError.message}`);
        throw createError;
      }
    }

    const { data, error } = await client.storage.from(bucket).upload(filePath, buffer, {
      contentType: mimeType,
      upsert: true,
    });

    if (error) {
      throw error;
    }

    const { data: publicUrlData } = client.storage.from(bucket).getPublicUrl(filePath);
    return publicUrlData.publicUrl;
  }

  async deleteFile(bucket: string, filePath: string): Promise<void> {
    const storageType = this.configService.get<string>('STORAGE_TYPE') || 'supabase';

    if (storageType === 'local') {
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads', bucket);
      const fullPath = path.join(uploadsDir, filePath);
      try {
        if (fs.existsSync(fullPath)) {
          fs.unlinkSync(fullPath);
        }
      } catch (err) {
        this.logger.error(`Gagal menghapus file lokal: ${err.message}`);
      }
      return;
    }

    if (storageType === 'base64') {
      return; // No physical file
    }

    const client = this.getClient();
    const { error } = await client.storage.from(bucket).remove([filePath]);
    if (error) {
      this.logger.error(`Gagal menghapus file dari Supabase bucket ${bucket}: ${error.message}`);
    }
  }
}


