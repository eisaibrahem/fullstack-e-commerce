# Cloudinary image uploads

Product and profile images are stored in Cloudinary via [`src/cloudinary/cloudinary.service.ts`](src/cloudinary/cloudinary.service.ts).

## Required environment variables

| Variable | Description |
| --- | --- |
| `CLOUDINARY_CLOUD_NAME` | Product environment cloud name |
| `CLOUDINARY_API_KEY` | API key (must allow **upload / create**) |
| `CLOUDINARY_API_SECRET` | Matching API secret |

Set these locally in `.env` and on Vercel (backend project) for Production and Preview.

## API key must allow uploads

Cloudinary’s **Roles and Permissions** model defaults to deny. An API key can pass **Admin `ping`** but still return **403** on upload if it lacks **create** (upload assets) permission.

Symptoms:

- `Image upload failed: Server returned unexpected status code - 403`
- Raw API: `Request forbidden due to missing permissions (actions=["create"])`

### Fix in Cloudinary Console

This project uses API key **`e-commerce-fullstack`** (`CLOUDINARY_API_KEY` in `.env`). New keys are often created **without upload permission**; Admin `ping` still succeeds.

1. Open the key settings page (while logged into Cloudinary):  
   [Edit API key 262987398297839](https://console.cloudinary.com/app/c-81e018f571120f052248ee0024c01d/settings/api-keys/262987398297839)
2. Under **Global roles** (product environment scope), add **Contributor** or **Master Admin** — both include **upload assets**.
3. Save. Run `npm run verify:cloudinary` locally until it exits `0`.
4. Ensure the same `CLOUDINARY_*` values exist on the **Vercel backend** project and **Redeploy**.

Alternatively, use the older **Untitled Root** key (if it already has upload rights): reveal its secret in **API Keys**, update `.env` / Vercel, and redeploy.

## Verify locally

```bash
npm run verify:cloudinary
```

Exit code `0` means ping and a test upload both succeeded.
