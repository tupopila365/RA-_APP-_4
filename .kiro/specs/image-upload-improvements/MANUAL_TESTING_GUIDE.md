# Manual Testing Guide
## Image Upload Improvements - Quick Verification

This guide provides step-by-step instructions for manually testing the image upload improvements feature.

---

## Prerequisites

### Admin Dashboard
1. Start the backend server:
   ```bash
   cd backend
   npm run dev
   ```

2. Start the admin dashboard:
   ```bash
   cd admin
   npm run dev
   ```

3. Login with admin credentials

### Mobile App
1. Start the backend server (if not already running)

2. Start the mobile app:
   ```bash
   cd app
   npm start
   ```

3. Open in Expo Go or simulator

---

## Test Scenario 1: Complete Upload Flow (5 minutes)

### Admin Dashboard - News Article

1. **Navigate to News Management**
   - Click "News" in the sidebar
   - Click "Create New Article" button

2. **Upload an Image**
   - Fill in article title: "Test Article"
   - Click "Browse Files" or drag an image to the upload area
   - Select a JPEG image (< 5MB)

3. **Verify Progress Tracking**
   - ✅ Progress bar should appear
   - ✅ Percentage should increase from 0% to 100%
   - ✅ "Browse Files" button should be disabled during upload
   - ✅ Success message should appear when complete

4. **Verify Preview**
   - ✅ Image thumbnail should display
   - ✅ Filename should be shown
   - ✅ File size should be shown
   - ✅ "Remove Image" button should be visible

5. **Submit Form**
   - Fill in remaining required fields
   - Click "Save" or "Submit"
   - ✅ Article should be created with image

6. **Verify in List View**
   - Return to news list
   - ✅ Your article should show the thumbnail image

---

## Test Scenario 2: Error Handling (3 minutes)

### Test Invalid File Type

1. **Try to Upload PDF**
   - Go to News > Create New Article
   - Try to upload a PDF file
   - ✅ Error message: "Invalid file type. Supported formats: JPEG, PNG, GIF, WebP"
   - ✅ Upload should not proceed

### Test Oversized File

1. **Try to Upload Large File**
   - Try to upload an image > 5MB
   - ✅ Error message: "File size exceeds 5MB limit"
   - ✅ Upload should not proceed

### Test Network Error Recovery

1. **Simulate Network Issue**
   - Start uploading an image
   - Disconnect network (or stop backend server)
   - ✅ Error message should appear
   - ✅ "Retry" button should be visible
   - Reconnect network
   - Click "Retry"
   - ✅ Upload should succeed

---

## Test Scenario 3: Mobile App Display (5 minutes)

### View Images in News List

1. **Open Mobile App**
   - Navigate to "News" tab
   - ✅ News articles with images should show thumbnails
   - ✅ Loading skeleton should appear briefly
   - ✅ Images should load progressively

2. **Test Scrolling Performance**
   - Scroll through the news list
   - ✅ Scrolling should be smooth (60 FPS)
   - ✅ Images should load as you scroll
   - ✅ No lag or stuttering

### View Full Image in Detail

1. **Open News Article**
   - Tap on a news article with an image
   - ✅ Full-size image should display
   - ✅ Loading indicator should show briefly
   - ✅ Image should be high quality

2. **Test Error Handling**
   - Find an article with a broken image URL (or modify one)
   - ✅ Placeholder icon should display
   - ✅ Rest of content should still be visible
   - ✅ No app crash

### Test Image Caching

1. **First Load**
   - Open a news article with an image
   - Note the loading time
   - Go back to list

2. **Second Load**
   - Open the same article again
   - ✅ Image should load instantly (from cache)
   - ✅ No loading indicator

3. **Offline Test**
   - Enable airplane mode
   - Navigate to previously viewed articles
   - ✅ Cached images should still display
   - ✅ New images should show placeholder

---

## Test Scenario 4: Slow Network (3 minutes)

### Simulate Slow Connection

1. **Enable Network Throttling**
   - In browser DevTools: Network tab > Throttling > Slow 3G
   - Or use system network settings

2. **Upload Image**
   - Go to News > Create New Article
   - Upload a 2-3MB image
   - ✅ Progress bar should update smoothly
   - ✅ Percentage should increase gradually
   - ✅ Upload should complete successfully (may take 30-60 seconds)

3. **Verify User Experience**
   - ✅ No timeout errors
   - ✅ Progress indicator provides feedback
   - ✅ User can see upload is progressing

---

## Test Scenario 5: Multiple Uploads (2 minutes)

### Sequential Uploads

1. **Upload First Image**
   - Create a news article
   - Upload image A
   - ✅ Preview shows image A

2. **Replace with Second Image**
   - Click "Remove Image"
   - Upload image B
   - ✅ Preview shows image B (not image A)

3. **Verify Independence**
   - ✅ Each upload has its own progress tracking
   - ✅ No interference between uploads

---

## Test Scenario 6: All Image Formats (2 minutes)

### Test Supported Formats

1. **JPEG**
   - Upload a .jpg file
   - ✅ Should work

2. **PNG**
   - Upload a .png file
   - ✅ Should work

3. **GIF**
   - Upload a .gif file
   - ✅ Should work

4. **WebP**
   - Upload a .webp file
   - ✅ Should work

---

## Test Scenario 7: Banner Upload (2 minutes)

### Test Banner Form

1. **Navigate to Banners**
   - Click "Banners" in sidebar
   - Click "Create New Banner"

2. **Upload Banner Image**
   - Upload an image
   - ✅ All upload features should work (progress, preview, etc.)

3. **Verify in List**
   - Return to banners list
   - ✅ Banner image should display

---

## Quick Smoke Test (2 minutes)

If you're short on time, run this quick test:

1. **Admin Dashboard**
   - [ ] Upload one image to a news article
   - [ ] Verify preview displays
   - [ ] Verify image shows in list

2. **Mobile App**
   - [ ] Open news list
   - [ ] Verify images display
   - [ ] Open one article
   - [ ] Verify full image displays

3. **Error Test**
   - [ ] Try to upload a PDF
   - [ ] Verify error message

---

## Expected Results Summary

### ✅ All Tests Should Pass

- Upload progress tracking works
- Image previews display correctly
- Error handling is graceful
- Mobile images load and cache properly
- All supported formats work
- Performance is acceptable

### 🚨 Report Issues If:

- Upload fails without error message
- Progress bar doesn't update
- Images don't display in mobile app
- App crashes on image load
- Caching doesn't work
- Performance is poor (< 30 FPS scrolling)

---

## Troubleshooting

### Upload Fails Silently
- Check browser console for errors
- Verify backend is running
- Check Cloudinary credentials in .env

### Images Don't Display in Mobile
- Check network connectivity
- Verify image URLs are accessible
- Check mobile app console logs

### Slow Performance
- Check image file sizes
- Verify Cloudinary optimization is working
- Check network speed

---

## Test Completion Checklist

- [ ] Scenario 1: Complete Upload Flow
- [ ] Scenario 2: Error Handling
- [ ] Scenario 3: Mobile App Display
- [ ] Scenario 4: Slow Network
- [ ] Scenario 5: Multiple Uploads
- [ ] Scenario 6: All Image Formats
- [ ] Scenario 7: Banner Upload

**Estimated Total Time:** 20-25 minutes

---

## Next Steps

After completing manual testing:

1. Review the FINAL_TESTING_REPORT.md for detailed test results
2. Report any issues found
3. If all tests pass, feature is ready for production deployment

---

**Last Updated:** November 27, 2025
