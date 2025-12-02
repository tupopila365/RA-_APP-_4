# Cloudinary PDF Access Migration Guide

## Overview

This guide provides step-by-step instructions for migrating existing deployments to use the new Cloudinary PDF access configuration. The migration ensures that all PDF documents (both existing and new) are accessible to the RAG service for indexing.

## What Changed

### Before the Fix
- PDFs were uploaded to Cloudinary as "raw" resource type without explicit access configuration
- Generated URLs were private by default, requiring authentication
- RAG service received 401 Unauthorized errors when attempting to download PDFs
- Documents could not be indexed or searched

### After the Fix
- PDFs are uploaded with explicit access configuration (`type: 'upload'`)
- URLs are publicly accessible or use signed URLs with time-limited access
- RAG service can successfully download and index PDFs
- Comprehensive error handling and logging for authentication issues

## Migration Options

Choose the migration approach that best fits your security requirements and operational constraints:

### Option A: Public Access Mode (Recommended)

**Best for**: Applications where documents are not sensitive and simplicity is preferred

**Pros**:
- Simplest implementation
- No URL expiration concerns
- Best performance (no signature generation overhead)
- Minimal maintenance

**Cons**:
- PDFs are publicly accessible if URL is known
- Not suitable for sensitive documents

### Option B: Signed URL Mode

**Best for**: Applications requiring time-limited access to documents

**Pros**:
- Time-limited access (default 24 hours)
- More secure than public access
- URLs expire automatically

**Cons**:
- Requires URL regeneration before expiry
- More complex implementation
- Slight performance overhead

### Option C: Authenticated Mode

**Best for**: Applications with highly sensitive documents

**Pros**:
- Most secure option
- Full access control
- No URL expiration

**Cons**:
- Requires credential management in RAG service
- Most complex implementation
- Requires RAG service configuration

## Pre-Migration Checklist

Before starting the migration, ensure you have:

- [ ] Backup of your MongoDB database
- [ ] List of all existing documents in the system
- [ ] Access to Cloudinary dashboard
- [ ] Cloudinary API credentials (cloud name, API key, API secret)
- [ ] Access to backend and RAG service configuration files
- [ ] Ability to restart backend and RAG services

## Migration Steps

### Step 1: Update Configuration

#### For Public Access Mode (Recommended)

1. Update `backend/.env`:
```env
CLOUDINARY_PDF_ACCESS_MODE=public
```

2. No changes needed to `rag-service/.env`

3. Restart backend service:
```bash
cd backend
npm run dev
```

#### For Signed URL Mode

1. Update `backend/.env`:
```env
CLOUDINARY_PDF_ACCESS_MODE=signed
CLOUDINARY_SIGNED_URL_EXPIRY=86400  # 24 hours in seconds
```

2. No changes needed to `rag-service/.env`

3. Restart backend service

#### For Authenticated Mode

1. Update `backend/.env`:
```env
CLOUDINARY_PDF_ACCESS_MODE=authenticated
```

2. Update `rag-service/.env`:
```env
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

3. Restart both backend and RAG services

### Step 2: Handle Existing Documents

Existing documents uploaded before the fix may have inaccessible URLs. Choose one of the following approaches:

#### Approach A: Update Cloudinary Resource Access (Recommended for Public Mode)

This approach updates the access permissions of existing Cloudinary resources without changing URLs.

1. Create a migration script `backend/src/scripts/migrateCloudinaryAccess.ts`:

```typescript
import { v2 as cloudinary } from 'cloudinary';
import mongoose from 'mongoose';
import Document from '../modules/documents/document.model';
import { config } from '../config/env';

// Configure Cloudinary
cloudinary.config({
  cloud_name: config.cloudinary.cloudName,
  api_key: config.cloudinary.apiKey,
  api_secret: config.cloudinary.apiSecret,
});

async function migrateCloudinaryAccess() {
  try {
    // Connect to MongoDB
    await mongoose.connect(config.mongoUri);
    console.log('Connected to MongoDB');

    // Get all documents with PDF URLs
    const documents = await Document.find({
      pdfUrl: { $exists: true, $ne: null }
    });

    console.log(`Found ${documents.length} documents to migrate`);

    let successCount = 0;
    let errorCount = 0;

    for (const doc of documents) {
      try {
        // Extract public_id from Cloudinary URL
        const urlMatch = doc.pdfUrl.match(/\/upload\/(?:v\d+\/)?(.+)\.\w+$/);
        if (!urlMatch) {
          console.error(`Could not extract public_id from URL: ${doc.pdfUrl}`);
          errorCount++;
          continue;
        }

        const publicId = urlMatch[1];

        // Update resource access mode
        await cloudinary.api.update(publicId, {
          resource_type: 'raw',
          type: 'upload',
          access_mode: 'public'
        });

        console.log(`✓ Updated access for document: ${doc.title} (${doc._id})`);
        successCount++;
      } catch (error) {
        console.error(`✗ Error updating document ${doc._id}:`, error.message);
        errorCount++;
      }
    }

    console.log('\nMigration complete!');
    console.log(`Success: ${successCount}`);
    console.log(`Errors: ${errorCount}`);

  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
  }
}

migrateCloudinaryAccess();
```

2. Run the migration script:
```bash
cd backend
npx ts-node src/scripts/migrateCloudinaryAccess.ts
```

3. Verify the migration by checking a few document URLs in your browser

#### Approach B: Regenerate URLs (For Signed URL Mode)

This approach generates new signed URLs for all existing documents.

1. Create a migration script `backend/src/scripts/regenerateSignedUrls.ts`:

```typescript
import mongoose from 'mongoose';
import Document from '../modules/documents/document.model';
import { generateSignedURL } from '../config/cloudinary';
import { config } from '../config/env';

async function regenerateSignedUrls() {
  try {
    await mongoose.connect(config.mongoUri);
    console.log('Connected to MongoDB');

    const documents = await Document.find({
      pdfUrl: { $exists: true, $ne: null }
    });

    console.log(`Found ${documents.length} documents to update`);

    let successCount = 0;
    let errorCount = 0;

    for (const doc of documents) {
      try {
        // Extract public_id from existing URL
        const urlMatch = doc.pdfUrl.match(/\/upload\/(?:v\d+\/)?(.+)\.\w+$/);
        if (!urlMatch) {
          console.error(`Could not extract public_id from URL: ${doc.pdfUrl}`);
          errorCount++;
          continue;
        }

        const publicId = urlMatch[1];

        // Generate new signed URL
        const signedUrl = generateSignedURL(publicId, {
          expiresIn: config.cloudinary.signedUrlExpiry || 86400
        });

        // Update document with new URL
        doc.pdfUrl = signedUrl;
        await doc.save();

        console.log(`✓ Updated URL for document: ${doc.title} (${doc._id})`);
        successCount++;
      } catch (error) {
        console.error(`✗ Error updating document ${doc._id}:`, error.message);
        errorCount++;
      }
    }

    console.log('\nMigration complete!');
    console.log(`Success: ${successCount}`);
    console.log(`Errors: ${errorCount}`);

  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    await mongoose.disconnect();
  }
}

regenerateSignedUrls();
```

2. Run the migration script:
```bash
cd backend
npx ts-node src/scripts/regenerateSignedUrls.ts
```

#### Approach C: Hybrid (No Migration Required)

If you prefer not to migrate existing documents:

1. New uploads will use the new configuration automatically
2. Existing documents will remain with their current URLs
3. Users can manually re-upload critical documents if needed
4. Old documents will gradually be replaced over time

### Step 3: Re-index Documents in RAG Service

After updating document URLs or access permissions, re-index all documents:

1. Create a re-indexing script `backend/src/scripts/reindexDocuments.ts`:

```typescript
import mongoose from 'mongoose';
import axios from 'axios';
import Document from '../modules/documents/document.model';
import { config } from '../config/env';

async function reindexDocuments() {
  try {
    await mongoose.connect(config.mongoUri);
    console.log('Connected to MongoDB');

    const documents = await Document.find({
      pdfUrl: { $exists: true, $ne: null }
    });

    console.log(`Found ${documents.length} documents to re-index`);

    let successCount = 0;
    let errorCount = 0;

    for (const doc of documents) {
      try {
        // Send indexing request to RAG service
        await axios.post(`${config.ragServiceUrl}/index`, {
          document_url: doc.pdfUrl,
          document_id: doc._id.toString(),
          title: doc.title
        });

        console.log(`✓ Re-indexed document: ${doc.title} (${doc._id})`);
        successCount++;

        // Add delay to avoid overwhelming the RAG service
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`✗ Error re-indexing document ${doc._id}:`, error.message);
        errorCount++;
      }
    }

    console.log('\nRe-indexing complete!');
    console.log(`Success: ${successCount}`);
    console.log(`Errors: ${errorCount}`);

  } catch (error) {
    console.error('Re-indexing failed:', error);
  } finally {
    await mongoose.disconnect();
  }
}

reindexDocuments();
```

2. Run the re-indexing script:
```bash
cd backend
npx ts-node src/scripts/reindexDocuments.ts
```

3. Monitor RAG service logs for any errors:
```bash
cd rag-service
tail -f logs/app.log
```

### Step 4: Verify Migration

1. **Test New Upload**:
   - Upload a new PDF through the admin panel
   - Check backend logs for successful upload
   - Verify RAG service indexes the document without errors
   - Query the chatbot about the new document

2. **Test Existing Document**:
   - Select an existing document from the database
   - Attempt to download the PDF URL directly in a browser
   - Check RAG service logs for successful indexing
   - Query the chatbot about the existing document

3. **Check Error Logs**:
   - Review backend logs: `backend/logs/error.log`
   - Review RAG service logs: `rag-service/logs/app.log`
   - Ensure no 401 Unauthorized errors appear

4. **Verify Chatbot Functionality**:
   - Ask questions about various documents
   - Verify chatbot can retrieve relevant information
   - Test with both new and old documents

## Troubleshooting

### Issue: Still Getting 401 Errors

**Possible Causes**:
1. Configuration not applied (service not restarted)
2. Cloudinary credentials incorrect
3. Migration script didn't run successfully
4. Cached URLs in RAG service

**Solutions**:
1. Restart both backend and RAG services
2. Verify Cloudinary credentials in `.env` files
3. Re-run migration script with verbose logging
4. Clear RAG service cache and re-index documents

### Issue: Signed URLs Expiring Too Quickly

**Possible Causes**:
1. `CLOUDINARY_SIGNED_URL_EXPIRY` set too low
2. Long document processing times

**Solutions**:
1. Increase expiry time in `backend/.env`:
   ```env
   CLOUDINARY_SIGNED_URL_EXPIRY=172800  # 48 hours
   ```
2. Consider switching to public access mode

### Issue: Migration Script Fails

**Possible Causes**:
1. MongoDB connection issues
2. Cloudinary API rate limits
3. Invalid public_id extraction

**Solutions**:
1. Verify MongoDB connection string
2. Add delays between API calls (already included in scripts)
3. Check document URL format and adjust regex if needed
4. Run script in batches for large datasets

### Issue: Some Documents Not Indexing

**Possible Causes**:
1. Invalid PDF format
2. Corrupted files
3. Network timeouts
4. RAG service resource constraints

**Solutions**:
1. Check RAG service logs for specific errors
2. Verify PDF files are valid (open in PDF reader)
3. Increase timeout settings in RAG service
4. Process documents in smaller batches

## Rollback Procedure

If you need to rollback the changes:

### Step 1: Revert Configuration

1. Update `backend/.env` to previous values or remove new variables
2. Update `rag-service/.env` to previous values
3. Restart both services

### Step 2: Revert Code Changes

```bash
cd backend
git revert <commit-hash>
npm install
npm run build
```

### Step 3: Restore Database (if needed)

If you modified document URLs:

```bash
mongorestore --db roads-authority --drop /path/to/backup
```

### Step 4: Verify Rollback

1. Test document upload
2. Check that system behaves as before
3. Monitor logs for any issues

## Post-Migration Monitoring

After migration, monitor the following for at least 24 hours:

1. **Backend Logs**: Watch for upload errors or Cloudinary API errors
2. **RAG Service Logs**: Monitor for download or indexing errors
3. **Chatbot Performance**: Verify responses are accurate and timely
4. **Error Rates**: Track 401 errors (should be zero after migration)
5. **Document Count**: Verify all documents are indexed in RAG service

## Maintenance

### For Public Access Mode
- No ongoing maintenance required
- Monitor Cloudinary storage usage
- Periodically verify URLs are accessible

### For Signed URL Mode
- Set up automated URL regeneration before expiry
- Monitor URL expiration times
- Consider implementing URL refresh mechanism

### For Authenticated Mode
- Rotate Cloudinary credentials periodically
- Monitor credential usage and access logs
- Keep credentials secure and encrypted

## Support

If you encounter issues during migration:

1. Check the troubleshooting section above
2. Review backend and RAG service logs
3. Verify Cloudinary dashboard for resource status
4. Test with a single document before batch migration
5. Contact the development team with specific error messages

## Summary

This migration guide provides three approaches to handle existing documents:

1. **Update Access Permissions** (Recommended for public mode): Simplest, no URL changes
2. **Regenerate URLs** (Required for signed mode): Updates all URLs in database
3. **Hybrid Approach**: No migration, gradual replacement

Choose the approach that best fits your requirements and follow the steps carefully. Always backup your data before starting the migration.
