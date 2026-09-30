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

After changing env vars, redeploy the project.

## Frontend

Set `NEXT_PUBLIC_API_URL` on the Next.js Vercel project to this API URL (e.g. `https://fullstack-e-commerce-beta.vercel.app`).
