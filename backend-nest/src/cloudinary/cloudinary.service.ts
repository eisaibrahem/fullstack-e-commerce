import {
  BadGatewayException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';

function cloudinaryUploadErrorMessage(raw: string | undefined): string {
  if (!raw?.includes('403')) {
    return raw ?? 'Unknown Cloudinary error';
  }
  return (
    'Cloudinary rejected the upload: the API key lacks upload (create) permission. ' +
    'In Cloudinary Console → Settings → API Keys, assign a role with Upload assets, then redeploy. ' +
    'See backend-nest/CLOUDINARY.md.'
  );
}

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);

  constructor() {
    const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;

    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
      throw new Error(
        'Missing Cloudinary credentials. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET.',
      );
    }

    cloudinary.config({
      cloud_name: CLOUDINARY_CLOUD_NAME,
      api_key: CLOUDINARY_API_KEY,
      api_secret: CLOUDINARY_API_SECRET,
    });
  }

  async uploadImage(file: { buffer?: Buffer }, folder: string) {
    if (!file?.buffer?.length) {
      throw new InternalServerErrorException(
        'Upload failed: file buffer is empty. Ensure Multer uses memoryStorage.',
      );
    }

    return new Promise<{ url: string; publicId: string }>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder, resource_type: 'image' },
        (error, result) => {
          if (error) {
            const raw = error.message;
            this.logger.error(`Cloudinary upload failed: ${raw}`, error.stack);
            const message = `Image upload failed: ${cloudinaryUploadErrorMessage(raw)}`;
            if (raw?.includes('403')) {
              reject(new BadGatewayException(message));
            } else {
              reject(new InternalServerErrorException(message));
            }
          } else if (result) {
            resolve({
              url: result.secure_url,
              publicId: result.public_id,
            });
          } else {
            reject(new InternalServerErrorException('Image upload failed: empty response from Cloudinary'));
          }
        },
      );

      uploadStream.end(file.buffer);
    });
  }

  async deleteImage(publicId: string) {
    return new Promise<void>((resolve, reject) => {
      cloudinary.uploader.destroy(publicId, (error) => {
        if (error) {
          this.logger.error(`Cloudinary delete failed: ${error.message}`, error.stack);
          reject(new InternalServerErrorException(`Image delete failed: ${error.message}`));
        } else {
          resolve();
        }
      });
    });
  }
}
