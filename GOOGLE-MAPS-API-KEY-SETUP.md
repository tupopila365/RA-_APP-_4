# How to Get Google Maps API Key - Step by Step Guide

## 🎯 **Overview**

To enable the interactive map features in your admin panel, you need a Google Maps API key. This guide walks you through the entire process.

## 📋 **Prerequisites**

- Google account (Gmail account)
- Credit card (for verification - Google provides $200 free credit monthly)
- 10-15 minutes of time

## 🚀 **Step-by-Step Instructions**

### **Step 1: Go to Google Cloud Console**

1. Open your web browser
2. Go to: **https://console.cloud.google.com/**
3. Sign in with your Google account

### **Step 2: Create a New Project (or Select Existing)**

#### **Option A: Create New Project**
1. Click the **project dropdown** at the top (next to "Google Cloud")
2. Click **"New Project"**
3. Enter project details:
   - **Project name**: `Roads Authority Maps` (or any name you prefer)
   - **Organization**: Leave as default
   - **Location**: Leave as default
4. Click **"Create"**
5. Wait for project creation (30-60 seconds)
6. Select your new project from the dropdown

#### **Option B: Use Existing Project**
1. Click the **project dropdown** at the top
2. Select an existing project you want to use

### **Step 3: Enable Billing (Required)**

1. In the left sidebar, click **"Billing"**
2. If no billing account exists:
   - Click **"Link a billing account"**
   - Click **"Create billing account"**
   - Enter your details and credit card information
   - **Note**: Google provides $200 free credit per month for Maps APIs
3. Link the billing account to your project

### **Step 4: Enable Required APIs**

1. In the left sidebar, click **"APIs & Services"** → **"Library"**
2. Search for and enable these 3 APIs (one by one):

#### **Enable Maps JavaScript API:**
1. Search: `Maps JavaScript API`
2. Click on **"Maps JavaScript API"**
3. Click **"Enable"**
4. Wait for activation

#### **Enable Places API:**
1. Go back to Library (click "Library" in breadcrumb)
2. Search: `Places API`
3. Click on **"Places API"**
4. Click **"Enable"**
5. Wait for activation

#### **Enable Geocoding API:**
1. Go back to Library
2. Search: `Geocoding API`
3. Click on **"Geocoding API"**
4. Click **"Enable"**
5. Wait for activation

### **Step 5: Create API Key**

1. In the left sidebar, click **"APIs & Services"** → **"Credentials"**
2. Click **"+ Create Credentials"** at the top
3. Select **"API Key"**
4. Your API key will be generated and displayed
5. **IMPORTANT**: Copy the API key immediately and save it somewhere safe

### **Step 6: Restrict API Key (Recommended for Security)**

1. In the API key dialog, click **"Restrict Key"** (or click the edit icon next to your key)
2. Give your key a name: `Roads Authority Admin Maps`

#### **Set Application Restrictions:**
1. Under **"Application restrictions"**:
   - Select **"HTTP referrers (web sites)"**
   - Click **"Add an item"**
   - Add: `http://localhost:3001/*` (for development)
   - Add: `https://yourdomain.com/*` (replace with your actual domain for production)

#### **Set API Restrictions:**
1. Under **"API restrictions"**:
   - Select **"Restrict key"**
   - Check these 3 APIs:
     - ✅ **Maps JavaScript API**
     - ✅ **Places API**
     - ✅ **Geocoding API**
2. Click **"Save"**

### **Step 7: Add API Key to Your Project**

1. Open your project folder
2. Navigate to: `admin/.env`
3. Add this line (replace with your actual API key):
   ```bash
   VITE_GOOGLE_MAPS_API_KEY=AIzaSyBxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
   ```
4. Save the file

### **Step 8: Restart Your Server**

```bash
cd admin
# Stop the server (Ctrl+C if running)
npm start
```

### **Step 9: Test the Integration**

1. Go to your admin panel: `http://localhost:3001`
2. Navigate to: **Road Status** → **Add New Roadwork**
3. Scroll to **"Location Coordinates"** section
4. Click **"Show Map"** button
5. You should see an interactive Google Map!

## 💰 **Cost Information**

### **Free Tier (Monthly):**
- **$200 credit** per month from Google
- **28,000+ map loads** covered by free credit
- **40,000+ geocoding requests** covered
- **100,000+ places requests** covered

### **Typical Usage for Admin Panel:**
- **10-50 roadworks per month** = Very minimal cost
- **Admin usage only** = Well within free limits
- **Expected monthly cost**: $0 (covered by free credit)

### **If You Exceed Free Limits:**
- Maps JavaScript API: $7 per 1,000 loads
- Geocoding API: $5 per 1,000 requests
- Places API: $17 per 1,000 requests

## 🔒 **Security Best Practices**

### **✅ DO:**
- Restrict API key to specific domains
- Restrict API key to only needed APIs
- Monitor usage in Google Cloud Console
- Use different keys for development and production

### **❌ DON'T:**
- Share your API key publicly
- Commit API keys to version control
- Use unrestricted API keys
- Use the same key for multiple unrelated projects

## 🛠️ **Troubleshooting**

### **"This page can't load Google Maps correctly"**
- Check if all 3 APIs are enabled
- Verify API key is correct in `.env` file
- Check domain restrictions match your localhost
- Restart development server

### **"API key not valid"**
- Double-check the API key in `.env` file
- Ensure no extra spaces or characters
- Verify API restrictions include your domain

### **"Quota exceeded"**
- Check usage in Google Cloud Console
- Verify billing is enabled
- Check if you've exceeded free limits

### **Map not loading**
- Check browser console for errors
- Verify internet connection
- Check if APIs are enabled in Google Cloud

## 📞 **Need Help?**

### **Google Cloud Support:**
- Documentation: https://cloud.google.com/maps-platform/docs
- Support: https://cloud.google.com/support

### **Common Issues:**
1. **Billing not enabled**: Enable billing even for free usage
2. **APIs not enabled**: Must enable all 3 required APIs
3. **Domain restrictions**: Add localhost for development
4. **Wrong environment variable**: Use `VITE_` prefix, not `REACT_APP_`

## ✅ **Success Checklist**

- [ ] Google Cloud project created
- [ ] Billing enabled (required even for free usage)
- [ ] Maps JavaScript API enabled
- [ ] Places API enabled  
- [ ] Geocoding API enabled
- [ ] API key created and copied
- [ ] API key restrictions configured
- [ ] API key added to `admin/.env` file
- [ ] Development server restarted
- [ ] Map loads successfully in admin panel

## 🎉 **You're Done!**

Once you complete these steps, your admin panel will have full interactive map functionality:

- **Click-to-select locations** on the map
- **Auto-detection of road names** and areas
- **Search functionality** for addresses
- **GPS location detection**
- **Drag markers** to fine-tune positions

The map integration will make creating roadwork entries much faster and more accurate!