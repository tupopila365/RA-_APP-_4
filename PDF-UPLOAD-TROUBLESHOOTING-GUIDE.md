# PDF Upload Not Working - Troubleshooting Guide

## Issue
PDFs don't upload in Vacancies and Tenders, and no preview appears.

## Quick Diagnosis

### Step 1: Check Browser Console
1. Open DevTools (F12)
2. Go to Console tab
3. Try to upload a PDF
4. Look for errors

**Common errors:**
- `401 Unauthorized` → Cloudinary credentials issue
- `Network error` → Backend not running or CORS issue
- `Failed to upload PDF` → Backend error

### Step 2: Check Backend Logs
Look at your backend terminal for errors when you try to upload.

### Step 3: Check Network Tab
1. Open DevTools (F12) → Network tab
2. Try to upload
3. Look for `/api/upload/pdf` request
4. Check status code and response

## Most Likely Issues

### Issue 1: Cloudinary API Key Has Space

**Problem:** Your `.env` file has a space in the API key:
```
CLOUDINARY_API_KEY= 438349465744638
                  ↑ Space here!
```

**Fix:**
```env
CLOUDINARY_API_KEY=438349465744638
```

Remove the space before the number.

### Issue 2: Cloudinary API Secret is Hidden

**Problem:** The API secret shows as `**********`

**Fix:** You need the actual secret from Cloudinary dashboard.

1. Go to https://cloudinary.com
2. Log in
3. Go to Dashboard
4. Copy the **API Secret** (click the eye icon to reveal it)
5. Update `.env`:
```env
CLOUDINARY_API_SECRET=your_actual_secret_here
```

### Issue 3: Wrong Environment Variable Name

**Problem:** There's a typo in your `.env`:
```
ITE_CLOUDINARY_UPLOAD_PRESET=roads_authority_admin
↑ Missing 'V' at the start
```

**Fix:** This variable is for frontend, not backend. Remove it from backend `.env`.

## Complete Fix

### Step 1: Update Backend `.env`

**File:** `backend/.env`

```env
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=dmsgvrkp5
CLOUDINARY_API_KEY=438349465744638
CLOUDINARY_API_SECRET=your_actual_secret_from_cloudinary_dashboard
```

**Important:**
- ✅ No spaces before or after values
- ✅ Use actual API secret (not asterisks)
- ✅ Remove the `ITE_CLOUDINARY_UPLOAD_PRESET` line (it's not needed in backend)

### Step 2: Get Your Cloudinary API Secret

1. Go to https://cloudinary.com/console
2. Log in with your account
3. On the Dashboard, you'll see:
   ```
   Cloud name: dmsgvrkp5
   API Key: 438349465744638
   API Secret: **************** [👁️ Show]
   ```
4. Click the eye icon (👁️) to reveal the secret
5. Copy it
6. Paste it in your `.env` file

### Step 3: Restart Backend

```cmd
cd RA-_APP-_4\backend

# Stop the current server (Ctrl+C)

# Start it again
npm run dev
```

### Step 4: Test Upload

1. Refresh admin panel (Ctrl + Shift + R)
2. Go to Tenders or Vacancies
3. Try uploading a PDF
4. Check browser console for any errors

## Verification Checklist

Before testing, verify:

- [ ] Backend `.env` has correct Cloudinary credentials
- [ ] No spaces in API key or secret
- [ ] API secret is the actual value (not asterisks)
- [ ] Backend server restarted after changing `.env`
- [ ] Browser refreshed (Ctrl + Shift + R)

## Testing Steps

### Test 1: Check Backend is Running
```cmd
curl http://localhost:5000/api/health
```
Should return: `{"status":"ok"}`

### Test 2: Check Cloudinary Connection
Look at backend logs when it starts. Should see:
```
✅ Server running on port 5000
```

No Cloudinary errors.

### Test 3: Upload Small PDF
1. Create or find a small PDF (< 1MB)
2. Go to Tenders → Create
3. Click "Upload PDF"
4. Select the PDF
5. Watch for:
   - Progress bar (0% → 100%)
   - Success message
   - PDF preview appears

## Common Error Messages

### "Cloudinary is not configured"
**Cause:** Missing or invalid Cloudinary credentials
**Fix:** Check `.env` file has all three values (cloud name, API key, API secret)

### "Upload authentication failed"
**Cause:** Invalid API key or secret
**Fix:** Double-check credentials from Cloudinary dashboard

### "Network error"
**Cause:** Backend not running or CORS issue
**Fix:** 
1. Check backend is running
2. Check CORS_ORIGIN in `.env` matches your admin URL

### "Failed to upload PDF: Unknown error"
**Cause:** Generic error, check backend logs
**Fix:** Look at backend terminal for detailed error

## Alternative: Use Direct Cloudinary Upload (Frontend)

If backend upload continues to fail, you can configure frontend to upload directly to Cloudinary:

### Step 1: Create Upload Preset in Cloudinary

1. Go to Cloudinary Dashboard
2. Settings → Upload
3. Click "Add upload preset"
4. Set:
   - Name: `roads_authority_admin`
   - Signing Mode: **Unsigned**
   - Folder: `roads-authority/pdfs`
5. Save

### Step 2: Update Frontend `.env`

**File:** `admin/.env`

```env
VITE_CLOUDINARY_CLOUD_NAME=dmsgvrkp5
VITE_CLOUDINARY_UPLOAD_PRESET=roads_authority_admin
```

### Step 3: Update PDF Upload Service

This would require modifying `pdfUploadService` to upload directly to Cloudinary instead of through backend. (Let me know if you want this approach)

## Still Not Working?

If upload still fails after trying all fixes:

1. **Share the error message** from browser console
2. **Share backend logs** when you try to upload
3. **Share Network tab** screenshot showing the failed request

With this information, I can provide a specific fix!

## Quick Fix Summary

**Most likely fix:**
1. Remove space from `CLOUDINARY_API_KEY` in `backend/.env`
2. Get actual API secret from Cloudinary dashboard
3. Update `CLOUDINARY_API_SECRET` in `backend/.env`
4. Restart backend server
5. Refresh browser
6. Try upload again

**Try this now and let me know what error you see!**
