# Artiq Backend Deployment

This Laravel backend is separate from the Kirtanraw backend. Do not point it at the Kirtanraw database or Supabase bucket.

## Supabase

Create a new Supabase project for Artiq and a **public** Storage bucket named `artwork`. Keep the database password and service-role key private.

## Render Web Service

Create a Docker Web Service from `qsihanwa-crypto/Artiq`, branch `main`:

- Root Directory: `backend`
- Dockerfile Path: `Dockerfile`
- Docker Build Context Directory: `.`
- Health Check Path: `/up`

Set these environment variables in Render. Use values from the **new Artiq Supabase project**:

```text
APP_NAME=Artiq Gallery
APP_ENV=production
APP_DEBUG=false
APP_KEY=<generate a unique Laravel key>
APP_URL=<Render service URL>
DB_CONNECTION=pgsql
DB_HOST=<Artiq Supabase database host>
DB_PORT=5432
DB_DATABASE=postgres
DB_USERNAME=postgres
DB_PASSWORD=<Artiq Supabase database password>
DB_SSLMODE=require
SUPABASE_URL=<Artiq Supabase project URL>
SUPABASE_STORAGE_BUCKET=artwork
SUPABASE_SERVICE_ROLE_KEY=<Artiq Supabase service-role key>
ADMIN_NAME=Dennis Liew
ADMIN_EMAIL=<private admin email>
ADMIN_PASSWORD=<strong unique password>
```

Never commit `.env` or paste secret values into chat. The container runs migrations and seeds only the Artiq admin and Artiq site defaults; it does not seed Kirtanraw artwork.

## Connect the Frontend

After Render creates the service URL, set `VITE_API_URL` in the Artiq frontend's production build environment to that URL, then rebuild and deploy the frontend. Verify `/api/artworks`, `/api/settings`, `/admin/login`, and an image upload before switching the exhibition catalogue from local data to the CMS.