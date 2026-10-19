# PromptPic Hub — starter project

This is a starter website for sharing AI prompts and images. It includes:
- responsive homepage and gallery
- image + prompt submission form
- Supabase database connection
- Supabase Storage upload
- approved-only public gallery
- copy prompt and open/download image actions
- submissions are pending by default

## Before using publicly

This is a starter, not a fully hardened production platform. Before accepting public uploads at scale, add:
- authenticated admin moderation screen to approve/reject submissions
- CAPTCHA or bot protection and per-IP/account rate limits
- reporting and copyright/takedown process
- content moderation and abuse handling
- privacy policy, terms, and contact page
- secure rules for storage uploads and retention
- backups and monitoring

## 1. Install Node.js

Install the current LTS version from https://nodejs.org/

## 2. Install project dependencies

Unzip the project, open a terminal in the project folder, and run:

```bash
npm install
```

## 3. Create Supabase project

1. Go to https://supabase.com/ and create a project.
2. In Project Settings > API, copy the Project URL and publishable/anon key.
3. Copy `.env.example` to a new file named `.env.local`.
4. Paste your Supabase URL and public key into `.env.local`.
5. Never put a Supabase service-role key in browser/client code.

## 4. Create database table

In Supabase, open SQL Editor, paste the contents of `supabase-schema.sql`, and run it.

## 5. Create image bucket

In Supabase > Storage, create a bucket named `community-images`.
For this starter, configure the bucket as public so approved image URLs can display.
Before production, carefully configure upload policies and abuse protections.

## 6. Run locally

```bash
npm run dev
```

Open http://localhost:3000

## Important moderation note

Uploads are stored and inserted as `pending`; they will not show in the public gallery until an administrator approves them. This starter intentionally does not include an admin approval screen yet. Add that screen with authenticated admin access before launch, or approve records through the Supabase dashboard during testing.

## 7. Deploy

A common deployment path is GitHub + Vercel:
1. Push the project to a private or public GitHub repository.
2. Import it into Vercel.
3. Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in Vercel Project Environment Variables.
4. Deploy and test upload, moderation, and downloads.

## Monetization

Add ads only after the site has original, useful content and a working moderation process. Ad approval and earnings are not guaranteed. Image generation APIs may cost money, so introduce AI generation only after choosing a provider, setting usage limits, and planning abuse prevention.
