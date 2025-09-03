# Vercel Blob Setup Guide

## Overview
This project now uses Vercel Blob for image storage instead of local file storage. This provides better scalability and performance.

## Setup Steps

### 1. Install Vercel Blob (Already Done)
The `@vercel/blob` package is already installed in `package.json`.

### 2. Create Environment Variables
Create a `.env.local` file in your project root with the following:

```bash
# Vercel Blob Configuration
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token_here

# Next.js Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Get Your Vercel Blob Token
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Navigate to your project
3. Go to Storage → Blob
4. Create a new Blob store if you don't have one
5. Copy the `BLOB_READ_WRITE_TOKEN`

### 4. How It Works
- **File Upload Flow**:
  1. User selects images in the car listing form
  2. Images are uploaded directly to Vercel Blob via `/api/upload-file`
  3. Vercel Blob returns public URLs for the uploaded images
  4. These URLs are stored with the car listing

- **API Routes**:
  - `/api/upload` - Generates unique filenames for uploads
  - `/api/upload-file` - Handles actual file uploads to Vercel Blob

### 5. Benefits
- **Scalability**: No local storage limitations
- **Performance**: CDN-backed image delivery
- **Reliability**: Vercel-managed infrastructure
- **Cost-effective**: Pay only for what you use

### 6. Troubleshooting
- **"BLOB_READ_WRITE_TOKEN not found"**: Check your `.env.local` file
- **Upload failures**: Verify your Vercel Blob token is valid
- **CORS issues**: Ensure your domain is allowed in Vercel settings

## File Structure
```
app/
├── api/
│   ├── upload/
│   │   └── route.ts          # Generates unique filenames
│   └── upload-file/
│       └── route.ts          # Handles Vercel Blob uploads
└── cars/
    └── listing/
        └── page.tsx          # Updated to use Vercel Blob
```

## Testing
1. Start your development server: `npm run dev`
2. Navigate to `/cars/listing`
3. Select some images and try to publish a listing
4. Check the Network tab to see upload requests to `/api/upload-file`
5. Verify images are accessible via the returned URLs
