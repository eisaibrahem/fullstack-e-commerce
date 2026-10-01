/**
 * Checks Cloudinary: Admin ping + a tiny upload (unsigned preset when configured).
 */
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { v2 as cloudinary } from 'cloudinary';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '..', '.env') });

const cloud = process.env.CLOUDINARY_CLOUD_NAME;
const key = process.env.CLOUDINARY_API_KEY;
const secret = process.env.CLOUDINARY_API_SECRET;
const preset = process.env.CLOUDINARY_UPLOAD_PRESET?.trim();

const missing = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'].filter(
  (name) => !process.env[name]?.trim(),
);
if (missing.length) {
  console.error('Missing env:', missing.join(', '));
  process.exit(1);
}

cloudinary.config({ cloud_name: cloud, api_key: key, api_secret: secret });

await new Promise((resolve, reject) => {
  cloudinary.api.ping((err) => (err ? reject(err) : resolve()));
});
console.log('Admin ping: OK');

const png = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
  'base64',
);

const uploadOptions = preset
  ? { upload_preset: preset, folder: 'products', unsigned: true, resource_type: 'image' }
  : { folder: 'products', resource_type: 'image' };

try {
  const result = await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(uploadOptions, (err, res) => {
      if (err) reject(err);
      else resolve(res);
    });
    stream.end(png);
  });
  console.log('Upload test: OK', preset ? `(unsigned preset: ${preset})` : '(signed)');
  if (result?.public_id) {
    cloudinary.uploader.destroy(result.public_id, () => {});
  }
  process.exit(0);
} catch (error) {
  console.error('Upload test: FAILED', error.message);
  if (preset) {
    console.error('Check CLOUDINARY_UPLOAD_PRESET exists and is Unsigned in Cloudinary Console.');
  } else {
    console.error(
      'Set CLOUDINARY_UPLOAD_PRESET to an unsigned preset, or grant upload (create) on the API key.',
    );
  }
  console.error('See backend-nest/CLOUDINARY.md for details.\n');
  process.exit(1);
}
