# Testing the Cloudinary PDF Public Access Fix

## Quick Test Steps

### 1. Restart the Backend Server
```bash
cd backend
npm run dev
```

### 2. Upload a Test PDF
Use the admin panel or API to upload a new PDF:

**Via Admin Panel:**
1. Login to admin panel (http://localhost:3001)
2. Go to Documents, Tenders, or Vacancies
3. Upload a new PDF file
4. Copy the PDF URL from the response

**Via API (using curl):**
```bash
curl -X POST http://localhost:5000/api/upload/pdf \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@/path/to/test.pdf"
```

### 3. Verify Public Access
Copy the PDF URL from the upload response and test it:

**Method 1: Browser Test**
1. Open an incognito/private browser window
2. Paste the PDF URL
3. The PDF should download immediately without any authentication

**Method 2: Verification Script**
```bash
cd backend
node verify-cloudinary-pdf-access.js
```
(Update the URL in the script first)

**Method 3: curl Test**
```bash
curl -I "YOUR_PDF_URL_HERE"
```
Should return `HTTP/2 200` instead of `HTTP/2 401`

### 4. Test RAG Service Integration
After uploading a new PDF, test if the RAG service can process it:

```bash
# Check RAG service logs
cd rag-service
# The service should successfully download and process the PDF
```

## Expected Results

### ✅ Success Indicators
- PDF URL returns **200 OK** status
- PDF downloads in incognito browser without login
- RAG service successfully processes the PDF
- No 401 Unauthorized errors in logs

### ❌ Failure Indicators
- PDF URL returns **401 Unauthorized**
- Browser prompts for authentication
- RAG service fails with "401 Unauthorized" after retries

## Troubleshooting

### If New PDFs Still Return 401
1. Check backend logs for upload options:
   ```
   Look for: "Uploading PDF with access mode"
   Should show: accessModeExplicit: 'public'
   ```

2. Verify environment variable:
   ```bash
   # In backend/.env
   CLOUDINARY_PDF_ACCESS_MODE=public
   ```

3. Check Cloudinary dashboard:
   - Login to cloudinary.com
   - Go to Media Library
   - Find the uploaded PDF
   - Check "Access Control" - should be "Public"

### If Backend Won't Start
```bash
cd backend
npm install
npm run build
npm run dev
```

## Re-uploading Existing PDFs

### For the Failing PDF
The PDF in your error message needs to be re-uploaded:
```
doc_1764616065760_Industry Visit Planner - Group 2 2025 Sem 2 (1).pdf
```

**Steps:**
1. Download the original file (if you still have it)
2. Delete the existing entry in the admin panel
3. Re-upload the file
4. The new URL will be publicly accessible

### Bulk Re-upload (if needed)
If you have many PDFs that need re-uploading, let me know and I can create a migration script.

## Verification Checklist
- [ ] Backend server restarted
- [ ] New PDF uploaded successfully
- [ ] PDF URL returns 200 OK (not 401)
- [ ] PDF downloads in incognito browser
- [ ] RAG service can process the PDF
- [ ] Existing problematic PDFs re-uploaded

## Need Help?
If the fix doesn't work:
1. Share the backend logs from the upload
2. Share the PDF URL that was generated
3. Share the result of the verification script
