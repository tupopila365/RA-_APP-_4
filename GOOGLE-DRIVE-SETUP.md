# Google Drive Integration Setup Guide

## Overview

This guide will help you set up Google Drive integration for PDF storage. PDFs will be uploaded to both Cloudinary (for display) and Google Drive (for RAG service downloads), eliminating 401 errors.

## Benefits

- ✅ **No 401 Errors** - Google Drive links are reliable
- ✅ **Free Storage** - 15GB free storage
- ✅ **Hybrid Approach** - Cloudinary for display, Google Drive for RAG
- ✅ **Automatic Fallback** - If Google Drive fails, uses Cloudinary

## Setup Steps

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Note your Project ID

### Step 2: Enable Google Drive API

1. In Google Cloud Console, go to **APIs & Services** → **Library**
2. Search for "Google Drive API"
3. Click **Enable**

### Step 3: Create OAuth 2.0 Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth client ID**
3. If prompted, configure OAuth consent screen:
   - User Type: **External**
   - App name: "Roads Authority App"
   - User support email: Your email
   - Developer contact: Your email
   - Click **Save and Continue**
   - Scopes: Add `https://www.googleapis.com/auth/drive.file`
   - Test users: Add your email
   - Click **Save and Continue**

4. Create OAuth Client ID:
   - Application type: **Web application**
   - Name: "Roads Authority Backend"
   - Authorized redirect URIs: `http://localhost:5000/auth/google/callback`
   - Click **Create**

5. **Save the credentials:**
   - Client ID: `YOUR_CLIENT_ID`
   - Client Secret: `YOUR_CLIENT_SECRET`

### Step 4: Get Refresh Token

Run this script to get your refresh token:

```bash
cd backend
node get-google-drive-token.js
```

This will:
1. Open a browser window
2. Ask you to authorize the app
3. Display your refresh token

**Save the refresh token** - you'll need it for the `.env` file.

### Step 5: Create Google Drive Folder (Optional)

1. Go to [Google Drive](https://drive.google.com/)
2. Create a folder named "Roads Authority PDFs"
3. Right-click the folder → **Share** → **Anyone with the link** (Viewer)
4. Copy the folder ID from the URL:
   ```
   https://drive.google.com/drive/folders/FOLDER_ID_HERE
   ```

### Step 6: Update Environment Variables

Add these to `backend/.env`:

```env
# Google Drive Configuration
GOOGLE_DRIVE_CLIENT_ID=your_client_id_here
GOOGLE_DRIVE_CLIENT_SECRET=your_client_secret_here
GOOGLE_DRIVE_REDIRECT_URI=http://localhost:5000/auth/google/callback
GOOGLE_DRIVE_REFRESH_TOKEN=your_refresh_token_here
GOOGLE_DRIVE_FOLDER_ID=your_folder_id_here  # Optional
```

### Step 7: Install Dependencies

```bash
cd backend
npm install googleapis
```

### Step 8: Restart Backend

```bash
npm run dev
```

Watch for:
```
Google Drive configured successfully
```

## Testing

### Test 1: Upload a PDF

1. Go to admin panel
2. Upload a PDF
3. Check backend logs for:
   ```
   Uploading PDF to Google Drive for RAG service
   PDF uploaded to Google Drive successfully
     fileId: "abc123..."
     directDownloadLink: "https://drive.google.com/uc?export=download&id=abc123"
   ```

### Test 2: Verify Response

The upload response should include:
```json
{
  "url": "https://res.cloudinary.com/.../doc_123.pdf",
  "googleDriveFileId": "abc123...",
  "googleDriveUrl": "https://drive.google.com/file/d/abc123/view",
  "ragDownloadUrl": "https://drive.google.com/uc?export=download&id=abc123"
}
```

### Test 3: Test RAG Service

The RAG service will automatically use `ragDownloadUrl` (Google Drive) instead of the Cloudinary URL.

## How It Works

### Upload Flow

1. **User uploads PDF** → Admin panel
2. **Backend receives file**
3. **Upload to Cloudinary** → For display in admin panel
4. **Upload to Google Drive** → For RAG service downloads
5. **Return both URLs** → Stored in database

### RAG Indexing Flow

1. **User triggers indexing**
2. **Backend sends `ragDownloadUrl`** → Google Drive direct download link
3. **RAG service downloads** → No 401 errors!
4. **Document indexed successfully**

### Database Schema

Update your document model to include:

```typescript
{
  url: string;  // Cloudinary URL for display
  googleDriveFileId?: string;  // Google Drive file ID
  googleDriveUrl?: string;  // Google Drive web view link
  ragDownloadUrl: string;  // URL for RAG service (Google Drive or Cloudinary)
}
```

## Troubleshooting

### Error: "Google Drive credentials not provided"

**Solution:** Check that all environment variables are set in `.env`

### Error: "Failed to upload to Google Drive"

**Possible causes:**
1. Invalid refresh token
2. API not enabled
3. Insufficient permissions

**Solution:**
1. Regenerate refresh token
2. Verify Google Drive API is enabled
3. Check OAuth scopes include `drive.file`

### Error: "Invalid grant"

**Cause:** Refresh token expired or revoked

**Solution:**
1. Go to Google Account → Security → Third-party apps
2. Remove "Roads Authority App"
3. Regenerate refresh token

### PDFs Still Return 401

**Check:**
1. Is `ragDownloadUrl` being used by RAG service?
2. Is the Google Drive file publicly accessible?
3. Test the URL directly in browser

## Optional: Manual Upload to Google Drive

If you don't want to set up OAuth, you can manually upload PDFs:

1. Upload PDF to Google Drive
2. Right-click → Share → Anyone with the link
3. Copy the sharing link
4. Convert to direct download link:
   ```
   Sharing: https://drive.google.com/file/d/FILE_ID/view
   Direct:  https://drive.google.com/uc?export=download&id=FILE_ID
   ```
5. Use the direct download link for RAG indexing

## Security Considerations

### Public vs Private

**Current Setup:** Files are publicly accessible (anyone with link)

**Why:** RAG service needs to download without authentication

**Alternative:** Use service account for private files (more complex setup)

### Refresh Token Security

- ✅ Store in `.env` (not in code)
- ✅ Add `.env` to `.gitignore`
- ✅ Never commit refresh tokens
- ✅ Rotate tokens periodically

## Cost

- **Google Drive:** Free (15GB)
- **Google Cloud API:** Free (up to quota limits)
- **Cloudinary:** Free tier (10GB storage, 25GB bandwidth/month)

## Summary

- ✅ Google Drive integration implemented
- ✅ Hybrid approach (Cloudinary + Google Drive)
- ✅ Automatic fallback to Cloudinary
- ✅ No code changes needed in RAG service
- ✅ Eliminates 401 errors

**Next:** Follow the setup steps above to configure Google Drive!
