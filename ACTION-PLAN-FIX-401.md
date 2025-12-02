# Action Plan: Fix Cloudinary 401 Errors

## ✅ Fixes Applied

All code changes have been implemented:

1. ✅ **Backend Upload Service** - Filename sanitization + signed URLs
2. ✅ **RAG Service** - User-Agent header added
3. ✅ **Upload Options** - `access_mode: 'public'` + `resource_type: 'raw'`
4. ✅ **Tests** - All validation tests passing

## 🚀 Action Steps (Do This Now)

### Step 1: Restart Backend Server

In your backend terminal:
```bash
# Press Ctrl+C to stop the current server
cd backend
npm run dev
```

**Wait for:** "Cloudinary configured successfully"

### Step 2: Restart RAG Service

In your RAG terminal:
```bash
# Press Ctrl+C to stop the current server
cd rag-service
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
```

**Wait for:** "RAG Service startup complete"

### Step 3: Delete Old PDFs

Go to admin panel (http://localhost:3001) and delete these problematic PDFs:
- ❌ "Work Integrated Learning Course Outline WSD721S - Software Development Strand.pdf"
- ❌ "Industry Visit Planner - Group 2 2025 Sem 2 (1).pdf"
- ❌ "NUST-Employment Agreement Internship WIL.pdf"
- ❌ Any other PDFs that were returning 401 errors

**Why?** These were uploaded with the old code and will always return 401.

### Step 4: Re-upload PDFs

Upload the same PDFs again through the admin panel.

**What to look for in backend logs:**
```
PDF upload initiated
  originalFilename: "Work Integrated Learning Course Outline.pdf"

Uploading PDF with access mode
  accessMode: "public"
  uploadType: "upload"
  accessModeExplicit: "public"

Generated signed URL for PDF
  publicId: "roads-authority/pdfs/doc_1234567890_Work_Integrated_Learning_Course_Outline"
  signedUrl: "https://...s--abc123--/..."
  hasSignature: true

PDF upload successful
  urlAccessible: true
```

### Step 5: Verify New URLs

Copy a new PDF URL from the upload response and test it:

```bash
cd backend
node test-pdf-url.js "PASTE_NEW_URL_HERE"
```

**Expected output:**
```
✅ SUCCESS! PDF is publicly accessible
Status: 200 OK
Content-Type: application/pdf
```

### Step 6: Test Document Indexing

1. Go to admin panel
2. Navigate to the re-uploaded document
3. Click "Index Document" or trigger indexing
4. Watch RAG service logs

**Expected RAG logs:**
```
Downloading PDF from https://...s--abc123--/... (attempt 1/3)
Successfully downloaded PDF (1234567 bytes)
Extracted 5000 characters from 10 pages
Document indexing complete
```

## ✅ Success Criteria

- [ ] Backend restarted successfully
- [ ] RAG service restarted successfully
- [ ] Old PDFs deleted from admin panel
- [ ] New PDFs uploaded successfully
- [ ] New URLs contain signature (`s--...--`)
- [ ] New URLs have no spaces (use `_` instead)
- [ ] Test script returns 200 OK
- [ ] RAG service downloads PDFs without 401 errors
- [ ] Document indexing completes successfully

## 🔍 Verification Commands

```bash
# Test all fixes
cd backend
node test-all-fixes.js

# Test specific URL
node test-pdf-url.js "YOUR_URL_HERE"

# Test signed URL generation
node test-signed-url-generation.js

# Test complete flow
node test-complete-flow.js
```

## 📊 What Changed

### Before:
```
URL: https://res.cloudinary.com/.../doc_123_Work%20Integrated%20Learning.pdf
- ❌ No signature
- ❌ Spaces encoded as %20
- ❌ Returns 401 Unauthorized
- ❌ RAG service fails
```

### After:
```
URL: https://res.cloudinary.com/.../s--abc123--/.../doc_123_Work_Integrated_Learning.pdf
- ✅ Has signature (s--abc123--)
- ✅ No spaces (uses underscores)
- ✅ Returns 200 OK
- ✅ RAG service succeeds
```

## 🐛 Troubleshooting

### Still Getting 401?

**Check:**
1. Did you restart BOTH backend and RAG service?
2. Did you delete and re-upload the PDF?
3. Does the new URL have a signature?
4. Does the new URL have no spaces?

**Test:**
```bash
node test-pdf-url.js "YOUR_NEW_URL"
```

### URL Has No Signature?

**Cause:** Backend not restarted

**Fix:**
1. Stop backend (Ctrl+C)
2. Run `npm run dev`
3. Re-upload PDF

### URL Still Has Spaces?

**Cause:** Using old PDF or backend not restarted

**Fix:**
1. Delete old PDF
2. Restart backend
3. Upload new PDF

### RAG Service Still Fails?

**Cause:** RAG service not restarted

**Fix:**
1. Stop RAG service (Ctrl+C)
2. Restart with uvicorn command
3. Try indexing again

## 📝 Summary

**What was fixed:**
1. ✅ Added `access_mode: 'public'` to uploads
2. ✅ Generate signed URLs for all PDFs
3. ✅ Sanitize filenames (remove spaces)
4. ✅ Add User-Agent header to RAG downloads

**What you need to do:**
1. ⏳ Restart backend server
2. ⏳ Restart RAG service
3. ⏳ Delete old PDFs
4. ⏳ Re-upload PDFs
5. ⏳ Test indexing

**Expected result:**
- ✅ PDFs publicly accessible
- ✅ Clean URLs without spaces
- ✅ Signed URLs with signatures
- ✅ RAG service downloads successfully
- ✅ No more 401 errors

---

**Ready to proceed? Follow the steps above in order!**
