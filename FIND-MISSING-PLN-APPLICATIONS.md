# 🔍 Finding Missing PLN Applications

## ⚠️ Important Discovery

Based on the data you showed, you have **property/land applications**, NOT PLN (Personalized License Number) applications!

### Your Data Shows:
```javascript
{
  referenceId: "PLN-2026-MKE1G5I7PR5U8K",
  fullName: "Test User",
  propertyType: "Residential",      // ← Property field
  plotNumber: "TEST-001",            // ← Property field
  propertySize: 500,                 // ← Property field
  propertyAddress: "123 Test Street", // ← Property field
  district: "Maseru",                // ← Location field
  constituency: "Maseru Central",    // ← Location field
  communityCouncil: "Maseru Urban",  // ← Location field
  village: "Ha Abia"                 // ← Location field
}
```

### PLN Applications Should Have:
```javascript
{
  referenceId: "PLN-2026-ABC123DEF456",
  fullName: "Test User",
  idNumber: "1234567890123",
  phoneNumber: "+26771234567",
  plateChoices: [                    // ← PLN field
    { text: "ABC123", meaning: "..." },
    { text: "DEF456", meaning: "..." },
    { text: "GHI789", meaning: "..." }
  ],
  trackingPin: "12345",              // ← PLN field
  vehicleRegisterNumber: "...",      // ← PLN field
  currentLicenceNumber: "..."        // ← PLN field
}
```

---

## 🎯 What's Happening

You have **TWO DIFFERENT APPLICATION SYSTEMS**:

1. **PLN Applications** - For personalized license plates (car registration)
2. **Property Applications** - For land/property registration

The data you showed is from **Property Applications**, but you're trying to track them using the **PLN Tracking System**.

---

## 🔍 Step 1: Check Your Database

Run this to see all collections:

```bash
CHECK-DATABASE-COLLECTIONS.bat
```

This will show:
- All collections in your database
- What type of data each contains
- Whether you have PLN applications or not

---

## 🎯 Step 2: Identify the Issue

### Scenario A: You Have No PLN Applications
**Symptoms:**
- No collection with `plateChoices` field
- All applications have property fields
- No PLN-specific data

**Solution:**
- Create a test PLN application first
- Use the mobile app PLN Application screen
- Or use the admin panel

---

### Scenario B: PLN Applications in Different Collection
**Symptoms:**
- Multiple collections exist
- PLN data is in a different collection
- Wrong collection being queried

**Solution:**
- Check all collections with the script
- Verify which collection has PLN data
- Update backend to query correct collection

---

### Scenario C: Wrong Database
**Symptoms:**
- Connected to wrong database
- Data exists but in different database
- Connection string issue

**Solution:**
- Check `backend/.env` file
- Verify `MONGODB_URI`
- Ensure correct database name

---

## 🔧 Step 3: Fix the Issue

### If You Need PLN Applications

1. **Create a test PLN application:**
   - Open mobile app
   - Go to "PLN Application" screen
   - Fill in the form:
     - Full Name
     - ID Number (13 digits)
     - Phone Number
     - 3 Plate Choices (e.g., ABC123, DEF456, GHI789)
     - Upload certified ID document
   - Submit

2. **Verify it was created:**
   ```bash
   CHECK-DATABASE-COLLECTIONS.bat
   ```

3. **Test tracking:**
   ```bash
   QUICK-CHECK-PLN.bat
   ```

---

### If You're Tracking Property Applications

You need a **different tracking system** for property applications!

The PLN tracking system is specifically for license plate applications and won't work for property applications.

**You need to:**
1. Create a property tracking screen
2. Create a property tracking API endpoint
3. Use property-specific fields

---

## 🗄️ Database Structure

### Correct PLN Collection Structure

**Collection name:** `plns`

**Document structure:**
```javascript
{
  _id: ObjectId("..."),
  referenceId: "PLN-2026-ABC123DEF456",
  trackingPin: "12345",
  
  // Personal Info
  fullName: "John Doe",
  idNumber: "1234567890123",
  phoneNumber: "+26771234567",
  email: "john@example.com",
  
  // Plate Choices
  plateChoices: [
    { text: "ABC123", meaning: "My initials" },
    { text: "DEF456", meaning: "Lucky numbers" },
    { text: "GHI789", meaning: "Birth year" }
  ],
  
  // Vehicle Info
  vehicleRegisterNumber: "ABC123",
  currentLicenceNumber: "DEF456",
  chassisNumber: "...",
  vehicleMake: "Toyota",
  
  // Status
  status: "submitted",
  statusHistory: [...],
  
  // Dates
  createdAt: Date,
  updatedAt: Date,
  paymentDeadline: Date,
  paymentReceivedAt: Date
}
```

---

## 🚨 Common Mistakes

### Mistake 1: Wrong Collection Name
```javascript
// Wrong - looking at property collection
db.properties.find({ referenceId: "PLN-2026-..." })

// Correct - looking at PLN collection
db.plns.find({ referenceId: "PLN-2026-..." })
```

### Mistake 2: Wrong Application Type
```javascript
// Property application (wrong for PLN tracking)
{
  propertyType: "Residential",
  plotNumber: "TEST-001"
}

// PLN application (correct for PLN tracking)
{
  plateChoices: [...],
  trackingPin: "12345"
}
```

### Mistake 3: Wrong Database
```javascript
// Wrong database
mongodb://localhost:27017/property-system

// Correct database
mongodb://localhost:27017/road-authority
```

---

## 🔍 Diagnostic Commands

### Check All Collections
```bash
CHECK-DATABASE-COLLECTIONS.bat
```

### Check MongoDB Directly
```bash
mongosh
use road-authority
show collections
db.plns.countDocuments()
db.plns.findOne()
```

### Check Backend Connection
```bash
# Check backend/.env
type backend\.env

# Look for MONGODB_URI
```

---

## 💡 Quick Fixes

### Fix 1: Create Test PLN Application
```bash
# Use mobile app to create a PLN application
# Then run:
QUICK-CHECK-PLN.bat
```

### Fix 2: Check Correct Collection
```bash
# Run this to see all collections:
CHECK-DATABASE-COLLECTIONS.bat
```

### Fix 3: Verify Database Connection
```bash
# Check backend/.env
type backend\.env

# Verify MONGODB_URI points to correct database
```

---

## 🎯 Next Steps

1. **Run the collection checker:**
   ```bash
   CHECK-DATABASE-COLLECTIONS.bat
   ```

2. **Look at the output:**
   - Do you have a `plns` collection?
   - Does it have documents with `plateChoices`?
   - Or do you only have property applications?

3. **Based on results:**
   - **If no PLN collection:** Create a test PLN application
   - **If wrong collection:** Update backend to query correct one
   - **If property apps only:** You need a different tracking system

---

## 📞 Need Help?

After running `CHECK-DATABASE-COLLECTIONS.bat`, you'll see:
- All collections in your database
- Sample documents from each
- What type of applications you have

Share that output and we can help you identify exactly what's happening!

---

## ✅ Success Indicators

You have PLN applications when you see:
- ✅ Collection named `plns` or similar
- ✅ Documents with `plateChoices` field
- ✅ Documents with `trackingPin` field
- ✅ Documents with vehicle-related fields

You have property applications when you see:
- ✅ Collection named `properties` or similar
- ✅ Documents with `propertyType` field
- ✅ Documents with `plotNumber` field
- ✅ Documents with location fields (district, constituency, etc.)

---

**Run this now:** `CHECK-DATABASE-COLLECTIONS.bat` 🔍
