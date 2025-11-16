# Deployment Setup Guide - Supabase Storage

This guide explains how to set up portfolio deployments using **Supabase Storage** instead of AWS S3/CloudFront.

## Why Supabase Storage?

Since you're already using Supabase as your database, using Supabase Storage keeps everything in one ecosystem:

- ✅ **No AWS configuration needed** - No S3 buckets, no CloudFront distributions
- ✅ **Automatic CDN** - Supabase provides built-in CDN for fast global delivery
- ✅ **Unified authentication** - Uses your existing Supabase setup
- ✅ **Simple pricing** - Pay for storage and bandwidth, no complex AWS billing
- ✅ **Easy management** - Everything in one Supabase dashboard

## Prerequisites

1. **Supabase Account**: Create an account at [supabase.com](https://supabase.com)
2. **Supabase Project**: Create a new project or use an existing one
3. **Environment Variables**: Get your keys from the Supabase dashboard

## Step 1: Get Your Supabase Credentials

1. Go to your Supabase project dashboard: https://supabase.com/dashboard
2. Navigate to **Settings** → **API**
3. Copy the following values:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **Anon/Public Key** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Service Role Key** → `SUPABASE_SERVICE_ROLE_KEY` ⚠️ Keep this secret!

## Step 2: Configure Environment Variables

1. Copy the example file:
   ```bash
   cd apps/web
   cp .env.example .env.local
   ```

2. Edit `.env.local` and add your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   ```

## Step 3: Create Storage Bucket in Supabase

You have two options: **automatic** (recommended) or **manual**.

### Option A: Automatic (Recommended)

The `DeploymentService` will automatically create the bucket when you first deploy a portfolio. Just make sure your `SUPABASE_SERVICE_ROLE_KEY` is set in `.env.local`.

### Option B: Manual Setup

1. Go to **Storage** in your Supabase dashboard
2. Click **New Bucket**
3. Configure the bucket:
   - **Name**: `portfolios`
   - **Public bucket**: ✅ **Yes** (portfolios need to be publicly accessible)
   - **File size limit**: `50 MB` (or adjust as needed)
4. Click **Create bucket**

## Step 4: Set Up Storage Policies (Important!)

For public access to portfolios, you need to create storage policies:

1. Go to **Storage** → **Policies** in Supabase dashboard
2. Click **New Policy** for the `portfolios` bucket
3. Create a **SELECT policy** (for reading files):
   - **Policy name**: "Public read access"
   - **Allowed operation**: SELECT
   - **Target roles**: public
   - **USING expression**: `true`
4. Create an **INSERT policy** (for uploading):
   - **Policy name**: "Authenticated users can upload"
   - **Allowed operation**: INSERT
   - **Target roles**: authenticated
   - **WITH CHECK expression**: `(bucket_id = 'portfolios')`
5. Create an **UPDATE policy** (for updating):
   - **Policy name**: "Authenticated users can update"
   - **Allowed operation**: UPDATE
   - **Target roles**: authenticated
   - **USING expression**: `(bucket_id = 'portfolios')`
6. Create a **DELETE policy** (for deleting):
   - **Policy name**: "Authenticated users can delete"
   - **Allowed operation**: DELETE
   - **Target roles**: authenticated
   - **USING expression**: `(bucket_id = 'portfolios')`

### Quick SQL Alternative

Run this in your Supabase SQL editor to create all policies at once:

```sql
-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Public read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'portfolios');

-- Authenticated users can upload
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'portfolios');

-- Authenticated users can update
CREATE POLICY "Authenticated users can update"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'portfolios');

-- Authenticated users can delete
CREATE POLICY "Authenticated users can delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'portfolios');
```

## Step 5: Test the Setup

1. Start your development server:
   ```bash
   npm run dev
   ```

2. Try deploying a test portfolio through your app
3. Check the Supabase Storage dashboard to see uploaded files

## How It Works

When you deploy a portfolio:

1. **Build**: The `BuildService` generates static HTML/CSS/JS files
2. **Upload**: The `DeploymentService` uploads files to Supabase Storage:
   ```
   Bucket: portfolios
   Path: {portfolioId}/index.html
   Path: {portfolioId}/styles.css
   Path: {portfolioId}/script.js
   Path: {portfolioId}/images/*
   ```
3. **CDN URL**: Supabase returns a CDN URL:
   ```
   https://your-project.supabase.co/storage/v1/object/public/portfolios/{portfolioId}/index.html
   ```

## Accessing Deployed Portfolios

After deployment, portfolios are accessible via:

- **Direct URL**: `https://{your-project}.supabase.co/storage/v1/object/public/portfolios/{portfolioId}/index.html`
- **Custom subdomain** (if configured): `https://{subdomain}.rolerabbit.com`
- **Custom domain** (if configured): `https://{yourdomain.com}`

## Storage Costs

Supabase Storage pricing (as of 2024):

- **Free tier**: 1 GB storage + 2 GB bandwidth/month
- **Pro tier**: $25/month includes 100 GB storage + 200 GB bandwidth
- **Overage**: $0.021/GB storage, $0.09/GB bandwidth

For reference:
- Average portfolio: ~2-5 MB
- Free tier can host ~200-500 portfolios
- Pro tier can host ~20,000-50,000 portfolios

## Troubleshooting

### "Error: Bucket not found"
- Create the `portfolios` bucket in Supabase dashboard
- Or ensure `SUPABASE_SERVICE_ROLE_KEY` is set for automatic creation

### "Error: Permission denied"
- Check storage policies are configured correctly
- Ensure the bucket is set to **public**
- Verify RLS policies allow public SELECT

### "Error: File too large"
- Increase file size limit in bucket settings
- Or compress images before upload

### "Files not accessible publicly"
- Ensure bucket is marked as **public**
- Check the SELECT policy allows public access
- Verify the URL format is correct

## Alternative: Keep Using AWS S3/CloudFront

If you prefer AWS S3/CloudFront over Supabase Storage, you can still use it! Just set these environment variables instead:

```env
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_REGION=us-east-1
S3_BUCKET_NAME=your-bucket-name
CLOUDFRONT_DISTRIBUTION_ID=your-distribution-id
```

Then uncomment the AWS SDK code in `apps/web/src/services/deployment.service.ts`.

## Next Steps

- ✅ Set up custom domains (see `CustomDomain` in `DeploymentService`)
- ✅ Configure SSL certificates (automatic with Let's Encrypt)
- ✅ Set up CDN caching (Supabase handles this automatically)
- ✅ Monitor storage usage in Supabase dashboard

## Support

For issues:
- **Supabase**: https://supabase.com/docs/guides/storage
- **RoleRabbit**: Check the main README.md
