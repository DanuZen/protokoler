import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { google } from 'googleapis';
import { Readable } from 'stream';

@Injectable()
export class GoogleDriveService {
  private readonly logger = new Logger(GoogleDriveService.name);
  private driveClient: any;
  private folderId: string | undefined;

  constructor(private configService: ConfigService) {
    const clientEmail = this.configService.get<string>('GDRIVE_CLIENT_EMAIL');
    let privateKey = this.configService.get<string>('GDRIVE_PRIVATE_KEY');
    this.folderId = this.configService.get<string>('GDRIVE_FOLDER_ID');

    if (clientEmail && privateKey) {
      try {
        // Handle escaped newlines in env private key
        privateKey = privateKey.replace(/\\n/g, '\n');
        const auth = new google.auth.JWT({
          email: clientEmail,
          key: privateKey,
          scopes: ['https://www.googleapis.com/auth/drive.file']
        });
        this.driveClient = google.drive({ version: 'v3', auth });
        this.logger.log('Google Drive client initialized successfully');
      } catch (err) {
        this.logger.error('Failed to initialize Google Drive client: ' + err.message);
      }
    } else {
      this.logger.warn('Google Drive credentials (GDRIVE_CLIENT_EMAIL, GDRIVE_PRIVATE_KEY) not found. Fallback/mock mode will be used.');
    }
  }

  async uploadVideo(fileName: string, buffer: Buffer, mimeType: string): Promise<string> {
    if (!this.driveClient) {
      this.logger.warn('Google Drive is not configured. Returning a mock URL.');
      return `https://drive.google.com/file/d/mock_file_id_${Date.now()}/view`;
    }

    try {
      const bufferStream = new Readable();
      bufferStream.push(buffer);
      bufferStream.push(null);

      const fileMetadata = {
        name: fileName,
        parents: this.folderId ? [this.folderId] : [],
      };

      const media = {
        mimeType: mimeType || 'video/mp4',
        body: bufferStream,
      };

      const response = await this.driveClient.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: 'id, webViewLink, webContentLink',
      });

      // Try to set permissions to anyone with link (read-only)
      try {
        await this.driveClient.permissions.create({
          fileId: response.data.id,
          requestBody: {
            role: 'reader',
            type: 'anyone',
          },
        });
      } catch (permissionErr) {
        this.logger.warn(`Failed to set permissions for file ${response.data.id}: ${permissionErr.message}`);
      }

      this.logger.log(`Video uploaded to Google Drive successfully. File ID: ${response.data.id}`);
      return response.data.webViewLink || `https://drive.google.com/file/d/${response.data.id}/view`;
    } catch (err) {
      this.logger.error(`Error uploading video to Google Drive: ${err.message}`);
      throw err;
    }
  }
}
