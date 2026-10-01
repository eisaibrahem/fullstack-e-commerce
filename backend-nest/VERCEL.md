# Deploying to Vercel

Root Directory: `backend-nest`

## Build

- **Install command:** `npm ci`
- **Build command:** `npm run build` (runs `prisma generate && nest build`)

## Required environment variables

Set in **Vercel → Project → Settings → Environment Variables** for Production (and Preview if needed). See [`.env.example`](.env.example).

| Name | Notes |
| --- | --- |
| `DATABASE_URL` | Neon pooler URL with `sslmode=require` |
| `JWT_SECRET` | Strong secret for JWT signing |
| `CORS_ORIGIN` | Comma-separated frontend origins; **no trailing slashes** |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary product environment cloud name |
| `CLOUDINARY_API_KEY` | API key with **Upload assets (create)** permission |
| `CLOUDINARY_API_SECRET` | Matching API secret |

After changing env vars, redeploy the project.

### Image upload returns 403 / 502

If uploads fail with Cloudinary **403**, the API key often passes Admin `ping` but lacks **create** permission. Fix roles in Cloudinary Console → Settings → API Keys, then run `npm run verify:cloudinary` locally. Details: [`CLOUDINARY.md`](CLOUDINARY.md).

**Security:** If database credentials or `JWT_SECRET` were ever shared outside Vercel, rotate the Neon password and generate a new `JWT_SECRET`, then update these variables and redeploy.

## Node runtime

`package.json` sets `"engines": { "node": "22.x" }` so Vercel does not run Node 24 (which can worsen ESM/CJS interop). `.npmrc` enables `node-options=--experimental-require-module` for remaining CJS dependencies.

Prisma `binaryTargets` includes `rhel-openssl-3.0.x` for the Vercel function runtime (see `prisma/schema.prisma`).

## ESM on Vercel

This app uses `"type": "module"`. `@nestjs/throttler` is not loaded in `AppModule` because its CommonJS build triggers `ERR_REQUIRE_ESM` on Vercel’s Node runtime. Rate limiting can be reintroduced via a Vercel-compatible approach or at the edge (Firewall) if needed.

## Frontend

Set `NEXT_PUBLIC_API_URL` on the Next.js Vercel project to this API URL (e.g. `https://fullstack-e-commerce-beta.vercel.app`).
