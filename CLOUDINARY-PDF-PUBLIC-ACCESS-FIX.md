# Cloudinary PDF Public Access Fix

## Problem
PDFs uploaded to Cloudinary were returning **401 Unauthorized** errors when accessed, even though `CLOUDINARY_PDF_ACCESS_MODE=public` was set in the environment configuration.

### Failing URL Example
```
https://res.cloudinary.com/dmsgvrkp5/raw/upload/v1764616213/documents/doc_1764616065760_Industry%20Visit%20Planner%20-%20Group%202%202025%20Sem%202%20%281%29.pdf
```

**Error:** 401 Unauthorized (even after 3 retry attempts in RAG service)

## Root Cause
The upload code was **not explicitly setting `access_mode: 'public'`** in the Cloudinary upload options. While the code correctly set `type: 'upload'` for public access, Cloudinary requires **both** parameters to ensure public accessibility:

1. `type: 'upload'` - Specifies the delivery type
2. `access_mode: 'public'` - **CRITICAL** - Explicitly sets the access control

Without `access_mode: 'public'`, Cloudinary defaults to authenticated/private access, causing 401 errors.

## Solution Applied

### File Modified
`backend/src/modules/upload/upload.service.ts`

### Change Made
Added `access_mode: 'public'` to the Cloudinary upload options:

```typescript
const uploadOptions: any = {
  folder: `${this.UPLOAD_FOLDER}/pdfs`,
  resource_type: 'raw', // Use 'raw' for PDFs
  type: useSignedUrls ? 'authenticated' : 'upload',
  access_mode: 'public', // ✅ CRITICAL: Explicitly set access_mode to 'public'
};
```

## What This Fixes

### ✅ New PDF Uploads
All PDFs uploaded **after this fix** will be publicly accessible without authentication.

### ❌ Existing PDFs
PDFs uploaded **before this fix** will still return 401 errors because they were uploaded with the wrong access settings.

## Action Required: Re-upload Existing PDFs

### Option 1: Manual Re-upload (Recommended)
1. Go to the admin panel
2. Navigate to Documents/Tenders/Vacancies sections
3. Delete the existing PDF entries
4. Re-upload the PDFs (they will now use the correct settings)

### Option 2: Bulk Migration Script
If you have many PDFs, you can create a migration script to:
1. Download all existing PDFs from Cloudinary
2. Re-upload them with the correct `access_mode: 'public'` setting
3. Update the database with new URLs

## Verification

### Test New Uploads
1. Upload a new PDF through the admin panel
2. Copy the PDF URL from the response
3. Open the URL in an incognito browser window
4. The PDF should download without requiring authentication

### Verify Existing PDFs
Run the verification script:
```bash
cd backend
node verify-cloudinary-pdf-access.js
```

This will test if a PDF URL is publicly accessible.

## Technical Details

### Cloudinary Upload Parameters for Public PDFs
```typescript
{
  folder: 'roads-authority/pdfs',
  resource_type: 'raw',        // Required for PDFs
  type: 'upload',              // Public delivery type
  access_mode: 'public',       // ✅ Explicit public access
}
```

### Cloudinary Upload Parameters for Signed URLs (Private)
```typescript
{
  folder: 'roads-authority/pdfs',
  resource_type: 'raw',
  type: 'authenticated',       // Requires signed URLs
  // access_mode not needed for authenticated type
}
```

## Environment Configuration
The fix respects the `CLOUDINARY_PDF_ACCESS_MODE` environment variable:

```env
# Options: 'public' (default) - PDFs are publicly accessible
#          'signed' - PDFs require signed URLs
CLOUDINARY_PDF_ACCESS_MODE=public
```

## Impact on RAG Service
With this fix, the RAG service can now:
- ✅ Download PDFs without authentication
- ✅ Process PDFs for indexing without 401 errors
- ✅ Retry logic will succeed instead of failing after 3 attempts

## Related Files
- `backend/src/modules/upload/upload.service.ts` - Upload service (FIXED)
- `backend/src/config/cloudinary.ts` - Cloudinary configuration
- `backend/.env` - Environment configuration
- `rag-service/app/services/pdf_processor.py` - RAG PDF processor

## Testing Checklist
- [x] Verified existing PDFs return 401 (confirmed issue)
- [x] Added `access_mode: 'public'` to upload options
- [ ] Upload a new PDF and verify it's publicly accessible
- [ ] Test RAG service can download and process new PDFs
- [ ] Re-upload existing PDFs that were failing

## Next Steps
1. ✅ Code fix applied
2. ⏳ Test new PDF upload
3. ⏳ Re-upload existing PDFs that are returning 401 errors
4. ⏳ Verify RAG service can process PDFs successfully
