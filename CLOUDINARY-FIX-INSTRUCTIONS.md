# Cloudinary Invalid Signature Fix

## Problem
You're getting an "Invalid Signature" error from Cloudinary, which means the API credentials don't match.

## Solution Steps

### 1. Get Your Correct Credentials

1. Go to: https://console.cloudinary.com/
2. Log in to your account
3. Go to **Settings** → **Access Keys** (or the Dashboard home page)
4. You'll see:
   - **Cloud Name**: Should be `dmsgvrkp5`
   - **API Key**: Should be `438349465744638`
   - **API Secret**: Click the "eye" icon to reveal it

### 2. Update Your Backend .env File

Open `RA-_APP-_4/backend/.env` and update these lines:

```env
CLOUDINARY_CLOUD_NAME=dmsgvrkp5
CLOUDINARY_API_KEY=438349465744638
CLOUDINARY_API_SECRET=<paste-your-actual-secret-here>
```

**Important**: 
- Make sure there are NO spaces before or after the values
- The API Secret is case-sensitive
- Copy it exactly as shown in the Cloudinary dashboard

### 3. Restart Your Backend Server

After updating the .env file:

```bash
cd backend
# Stop the current server (Ctrl+C)
npm run dev
```

### 4. Test the Connection

Run the verification script:

```bash
cd backend
node verify-cloudinary.js
```

You should see: ✅ SUCCESS: Cloudinary connection is working!

## Alternative: Regenerate API Secret

If the above doesn't work, you can regenerate your API Secret:

1. Go to Cloudinary Dashboard → Settings → Access Keys
2. Click "Generate New API Secret"
3. Copy the new secret
4. Update your .env file with the new secret
5. Restart your backend server

## Common Issues

- **Whitespace**: Make sure there are no spaces in your .env file like `API_SECRET= value ` (wrong) vs `API_SECRET=value` (correct)
- **Wrong Account**: Make sure you're logged into the correct Cloudinary account
- **Old Credentials**: If you recently changed your API secret, make sure you're using the new one

## Verify It's Working

Try uploading a PDF through the admin dashboard. If it works, you'll see the file in your Cloudinary Media Library under the `roads-authority/pdfs` folder.
