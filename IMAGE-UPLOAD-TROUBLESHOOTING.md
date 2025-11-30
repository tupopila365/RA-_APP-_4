# Image Upload Troubleshooting Guide

## Issue
File upload doesn't work when trying to upload images in the admin panel.

## Possible Causes

### 1. Cloudinary Configuration Missing
The upload service needs Cloudinary credentials configured.

### 2. CORS Issues
Cloudinary might be blocking requests from your domain.

### 3. Upload Preset Not Configured
The Cloudinary upload preset might not exist or be misconfigured.

## Quick Diagnosis

### Step 1: Check Browser Console
1. Open DevTools (F12) → Console tab
2. Try to upload an image
3. Look for errors:
   - **401 Unauthorized** → Upload preset issue
   - **Network error** → CORS or connectivity issue
   - **Validation error** → File size/format issue

### Step 2: Check Environment Variables

**File:** `admin/.env`

Should contain:
```env
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
```

**Check if these are set:**
```cmd
cd RA-_APP-_4\admin
type .env
```

## Solutions

### Solution 1: Configure Cloudinary (Recommended)

#### A. Get Cloudinary Credentials

1. Go to https://cloudinary.com
2. Sign up or log in
3. Go to Dashboard
4. Note your **Cloud Name**

#### B. Create Upload Preset

1. In Cloudinary Dashboard → Settings → Upload
2. Click "Add upload preset"
3. Set:
   - **Preset name:** `roads_authority_admin`
   - **Signing Mode:** `Unsigned`
   - **Folder:** `roads-authority`
   - **Transformations:** 
     - Max width: 1200
     - Max height: 800
     - Quality: Auto
     - Format: Auto
4. Save

#### C. Update Environment Variables

**File:** `admin/.env`

```env
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name_here
VITE_CLOUDINARY_UPLOAD_PRESET=roads_authority_admin
```

#### D. Restart Admin Panel

```cmd
cd RA-_APP-_4\admin
npm run dev
```

### Solution 2: Use Backend Upload API (Alternative)

If you want to use the backend upload endpoint instead of direct Cloudinary upload:

#### A. Update ImageUploadField Component

**File:** `admin/src/components/common/ImageUploadField.tsx`

Change the upload method to use the backend API:

```typescript
// Instead of:
const result = await imageUploadService.uploadImage(file, onProgress);

// Use:
const formData = new FormData();
formData.append('image', file);

const response = await apiClient.post('/upload/image', formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
  onUploadProgress: (progressEvent) => {
    if (progressEvent.total) {
      const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
      onProgress(progress);
    }
  },
});

const result = {
  url: response.data.data.url,
  publicId: response.data.data.publicId,
  // ... other fields
};
```

#### B. Configure Backend Cloudinary

**File:** `backend/.env`

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## Testing Upload

### Test 1: File Validation
1. Try uploading a file > 5MB → Should show error
2. Try uploading a .txt file → Should show error
3. Try uploading a .jpg file < 5MB → Should work

### Test 2: Upload Progress
1. Upload a large image (2-3MB)
2. Watch the progress bar
3. Should show 0% → 100%

### Test 3: Preview
1. After upload completes
2. Should show image preview
3. URL should be visible

## Common Errors

### Error: "Upload authentication failed"
**Cause:** Upload preset doesn't exist or is set to "Signed"
**Fix:** Create unsigned upload preset in Cloudinary

### Error: "Network error"
**Cause:** CORS issue or Cloudinary unreachable
**Fix:** 
1. Check internet connection
2. Verify Cloudinary cloud name is correct
3. Check browser console for CORS errors

### Error: "Invalid file type"
**Cause:** Trying to upload non-image file
**Fix:** Only upload .jpg, .png, .gif, or .webp files

### Error: "File size exceeds 5MB limit"
**Cause:** File is too large
**Fix:** Compress image or use smaller file

## Current Configuration

The app is currently configured to upload directly to Cloudinary using:
- **Cloud Name:** `dmsgvrkp5` (default)
- **Upload Preset:** `roads_authority_admin` (default)
- **Folder:** `roads-authority`

If these don't work, you need to set up your own Cloudinary account and update the environment variables.

## Next Steps

1. **Check if Cloudinary is configured** - Look at `admin/.env`
2. **Try uploading** - Open console and see what error appears
3. **Report the error** - Tell me what you see in the console

**What error do you see when trying to upload?**
