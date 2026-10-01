/**
 * Checks Cloudinary credentials: Admin ping + a tiny signed upload.
 * Exit 0 only when upload succeeds (API key has create/upload permission).
 */
import dotenv from 'dotenv';
import https from 'https';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { v2 as cloudinary } from 'cloudinary';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '..', '.env') });

const cloud = process.env.CLOUDINARY_CLOUD_NAME;
const key = process.env.CLOUDINARY_API_KEY;
const secret = process.env.CLOUDINARY_API_SECRET;

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

const boundary = '----VerifyCloudinary';
const parts = [
  `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="verify.png"\r\nContent-Type: image/png\r\n\r\n`,
  png,
  `\r\n--${boundary}--\r\n`,
];
const body = Buffer.concat(parts.map((p) => (typeof p === 'string' ? Buffer.from(p) : p)));
const auth = Buffer.from(`${key}:${secret}`).toString('base64');

const uploadResult = await new Promise((resolve) => {
  const req = https.request(
    {
      hostname: 'api.cloudinary.com',
      path: `/v1_1/${cloud}/image/upload`,
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
        'Content-Length': body.length,
      },
    },
    (res) => {
      let data = '';
      res.on('data', (c) => {
        data += c;
      });
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          cldError: res.headers['x-cld-error'],
          body: data,
        });
      });
    },
  );
  req.on('error', (e) => resolve({ status: 0, error: e.message }));
  req.write(body);
  req.end();
});

if (uploadResult.status === 200) {
  console.log('Upload test: OK');
  process.exit(0);
}

console.error('Upload test: FAILED (HTTP', uploadResult.status + ')');
if (uploadResult.cldError) {
  console.error('X-Cld-Error:', uploadResult.cldError);
}
console.error(
  '\nFix: Cloudinary Console → Settings → API Keys → select this key → assign a role with',
  '"Upload assets" (create) permission, or use Master Admin. Then update .env / Vercel env and redeploy.',
);
console.error('See backend-nest/CLOUDINARY.md for details.\n');
process.exit(1);
