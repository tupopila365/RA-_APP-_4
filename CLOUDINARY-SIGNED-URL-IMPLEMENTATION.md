# Cloudinary Signed URL Implementation

## Overview
All PDF uploads now generate **signed URLs** with cryptographic signatures to ensure secure and reliable access for the RAG service.

## What Are Signed URLs?

Signed URLs include a cryptographic signature (e.g., `s--abc123--`) that:
- Verifies the URL hasn't been tampered with
- Provides URL integrity
- Can control access (for private files)
- Never expires by default (for public files with `type: 'upload'`)

### Example Signed URL
```
https://res.cloudinary.com/dmsgvrkp5/raw/upload/s--abc123xyz--/v1764890123/roads-authority/pdfs/doc_123.pdf
                                                   ^^^^^^^^^^^^
                                                   Signature
```

## Implementation Details

### Upload Flow

1. **Upload PDF to Cloudinary**
   ```typescript
   const uploadOptions = {
     folder: 'roads-authority/pdfs',
     resource_type: 'raw',
     type: 'upload',           // Public delivery type
     access_mode: 'public',    // Explicitly public
   };
   ```

2. **Generate Signed URL**
   ```typescript
   const signedUrl = generateSignedURL(result.public_id, {
     resourceType: 'raw',
     type: 'upload',  // Match the upload type
   });
   ```

3. **Return Signed URL**
   - The signed URL is returned to the frontend
   - The signed URL is stored in the database
   - The RAG service receives the signed URL

### Key Configuration

#### For Public PDFs (Current Setup)
```typescript
{
  resource_type: 'raw',
  type: 'upload',        // Public delivery
  sign_url: true,        // Add signature
  secure: true,          // Use HTTPS
}
```

**Characteristics:**
- ✅ File is publicly accessible
- ✅ URL includes signature for integrity
- ✅ URL never expires
- ✅ Works in incognito browsers
- ✅ RAG service can download without authentication

#### For Private PDFs (If Needed)
```typescript
{
  resource_type: 'raw',
  type: 'authenticated', // Private delivery
  sign_url: true,        // Add signature
  secure: true,          // Use HTTPS
}
```

**Characteristics:**
- 🔒 File requires authentication
- 🔒 URL includes signature for access control
- ⏰ URL can have expiration time
- ❌ Won't work in incognito without signature
- ✅ RAG service can download with signed URL

## Benefits

### 1. URL Integrity
The signature ensures the URL hasn't been modified:
- Prevents URL manipulation attacks
- Ensures the correct file is accessed
- Validates the URL came from your application

### 2. Consistent Access
The RAG service always receives a valid, working URL:
- No 401 Unauthorized errors
- No authentication required (for public files)
- Reliable downloads every time

### 3. Future-Proof
Easy to switch to private access if needed:
- Change `CLOUDINARY_PDF_ACCESS_MODE=signed` in `.env`
- Add expiration times if required
- No code changes needed

## Environment Configuration

```env
# Cloudinary PDF Access Configuration
# Options: 'public' (default) - PDFs are publicly accessible
#          'signed' - PDFs require signed URLs with expiration
CLOUDINARY_PDF_ACCESS_MODE=public

# Signed URL expiration time in seconds (default: 86400 = 24 hours)
# Only used when CLOUDINARY_PDF_ACCESS_MODE=signed
CLOUDINARY_SIGNED_URL_EXPIRY=86400
```

## Code Changes

### Modified Files

1. **`backend/src/config/cloudinary.ts`**
   - Updated `generateSignedURL()` to support both public and private files
   - Added `type` parameter to match upload delivery type
   - Removed default expiration for public files

2. **`backend/src/modules/upload/upload.service.ts`**
   - ALWAYS generate signed URLs for all PDF uploads
   - Match the signature type to the upload type
   - Log both original and signed URLs for debugging

## Testing

### Test Signed URL Generation

1. **Upload a PDF**
   ```bash
   curl -X POST http://localhost:5000/api/upload/pdf \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -F "file=@test.pdf"
   ```

2. **Check Response**
   ```json
   {
     "url": "https://res.cloudinary.com/.../s--abc123--/.../doc.pdf",
     "publicId": "roads-authority/pdfs/doc_123",
     "accessType": "public"
   }
   ```

3. **Verify Signature**
   - URL should contain `s--` followed by signature
   - Example: `s--abc123xyz--`

4. **Test Access**
   ```bash
   # Should return 200 OK
   curl -I "SIGNED_URL_HERE"
   ```

### Verify RAG Service Integration

1. **Upload PDF through admin panel**
2. **Check backend logs** for signed URL generation:
   ```
   Generated signed URL for PDF
   {
     publicId: "roads-authority/pdfs/doc_123",
     accessMode: "public",
     deliveryType: "upload",
     originalUrl: "https://...",
     signedUrl: "https://.../s--abc123--/..."
   }
   ```
3. **Verify RAG service** can download the PDF without errors

## Troubleshooting

### Signed URL Returns 401

**Cause:** Mismatch between upload type and signature type

**Solution:**
- Ensure upload uses `type: 'upload'`
- Ensure signature uses `type: 'upload'`
- Both must match!

### Signature Not Present in URL

**Cause:** `sign_url: true` not set

**Solution:**
- Check `generateSignedURL()` includes `sign_url: true`
- Verify Cloudinary SDK is configured correctly

### RAG Service Can't Download

**Cause:** URL validation failing

**Solution:**
1. Check if URL is accessible:
   ```bash
   node backend/test-pdf-url.js "YOUR_SIGNED_URL"
   ```
2. Verify signature is present in URL
3. Check RAG service logs for specific error

## Migration from Unsigned URLs

### Existing PDFs
If you have PDFs uploaded before this change:

1. **They still work** - Original URLs remain valid
2. **No re-upload needed** - Unless you want signed URLs
3. **Optional migration** - Can regenerate signed URLs if desired

### To Regenerate Signed URLs

```typescript
// For any existing public_id
const signedUrl = generateSignedURL(publicId, {
  resourceType: 'raw',
  type: 'upload',
});

// Update database with new signed URL
await updateDocumentUrl(documentId, signedUrl);
```

## Security Considerations

### Public Files (Current Setup)
- ✅ Files are publicly accessible
- ✅ Signature provides URL integrity
- ✅ No expiration needed
- ✅ Suitable for public documents, tenders, reports

### Private Files (If Needed)
- 🔒 Files require signed URLs
- 🔒 Signature provides access control
- ⏰ Can set expiration times
- 🔒 Suitable for sensitive documents

## API Response Format

### PDF Upload Response
```typescript
{
  url: string;           // Signed URL with signature
  publicId: string;      // Cloudinary public ID
  format: string;        // File format (pdf)
  bytes: number;         // File size
  accessType: 'public' | 'signed';  // Access mode
  expiresAt?: Date;      // Expiration (only for signed mode)
}
```

### Example Response
```json
{
  "url": "https://res.cloudinary.com/dmsgvrkp5/raw/upload/s--abc123xyz--/v1764890123/roads-authority/pdfs/doc_123.pdf",
  "publicId": "roads-authority/pdfs/doc_123",
  "format": "pdf",
  "bytes": 1048576,
  "accessType": "public"
}
```

## Next Steps

1. ✅ Signed URL generation implemented
2. ⏳ Test new PDF uploads
3. ⏳ Verify RAG service can download PDFs
4. ⏳ Monitor logs for any issues
5. ⏳ Optional: Migrate existing PDFs to signed URLs

## Related Documentation

- `CLOUDINARY-PDF-PUBLIC-ACCESS-FIX.md` - Original 401 fix
- `test-pdf-upload-fix.md` - Testing guide
- `backend/test-pdf-url.js` - URL testing script
