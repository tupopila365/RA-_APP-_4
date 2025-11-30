# 🗄️ Database Setup Guide

## ✅ Short Answer: **NO Manual Setup Required!**

MongoDB automatically creates databases and collections. You don't need to create tables or schemas manually!

---

## 🎯 How MongoDB Works (vs SQL)

### Traditional SQL (MySQL, PostgreSQL)
```sql
-- ❌ You MUST do this manually:
CREATE DATABASE roads_authority;
CREATE TABLE news (
  id INT PRIMARY KEY,
  title VARCHAR(255),
  content TEXT,
  ...
);
```

### MongoDB (What We Use)
```javascript
// ✅ This happens AUTOMATICALLY:
// 1. Database created when you first connect
// 2. Collections created when you first insert data
// 3. No schema required upfront!
```

---

## 🚀 Three Ways to Start

### Option 1: Empty Database (Quickest)
**Best for:** Just testing if everything works

```bash
# 1. Start MongoDB
mongod

# 2. Start backend
cd backend
npm run dev

# Result: ✅ Works but shows empty lists
```

**What happens:**
- Database `roads-authority` is created automatically
- Collections are created when needed
- App works but shows "No news found", "No locations found"

---

### Option 2: With Sample Data (Recommended)
**Best for:** Development and testing features

```bash
# 1. Start MongoDB
mongod

# 2. Seed database with sample data
cd backend
npm run seed

# 3. Start backend
npm run dev

# Result: ✅ Works with 3 news articles and 4 locations
```

**What you get:**
- ✅ 3 sample news articles
- ✅ 4 sample office locations
- ✅ Ready to test all features immediately

---

### Option 3: MongoDB Atlas (Cloud - No Local Install)
**Best for:** No local MongoDB installation

```bash
# 1. Create free MongoDB Atlas account
# Go to: https://www.mongodb.com/cloud/atlas

# 2. Create cluster (takes 3-5 minutes)

# 3. Get connection string
# Example: mongodb+srv://user:pass@cluster.mongodb.net/roads-authority

# 4. Update backend/.env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/roads-authority

# 5. Seed database (optional)
cd backend
npm run seed

# 6. Start backend
npm run dev

# Result: ✅ Works with cloud database
```

---

## 📊 What Gets Created Automatically

### Database
```
roads-authority
```

### Collections (Created on First Use)
```
├── news          (News articles)
├── locations     (Office locations)
├── users         (Admin users)
├── tenders       (Tender documents)
├── vacancies     (Job vacancies)
└── banners       (Homepage banners)
```

### Indexes (Created by Mongoose Models)
```javascript
// Automatically created for performance:
news:
  - title (text search)
  - category (filtering)
  - publishedAt (sorting)

locations:
  - region (filtering)
  - name (searching)
```

---

## 🌱 Seeding Database (Adding Sample Data)

### Run Seed Script
```bash
cd backend
npm run seed
```

### What It Does
```
🌱 Starting database seeding...
✅ Connected to MongoDB
🗑️  Clearing existing data...
✅ Existing data cleared
📰 Inserting sample news...
✅ Inserted 3 news articles
📍 Inserting sample locations...
✅ Inserted 4 locations

🎉 Database seeding completed successfully!

📊 Summary:
   - News articles: 3
   - Locations: 4

✨ You can now start the backend and mobile app!
```

### Sample Data Included

**News Articles:**
1. Road Safety Campaign Launched Nationwide
2. New Highway Project Connecting Major Cities
3. Maintenance Schedule Update for National Roads

**Locations:**
1. Roads Authority Head Office (Windhoek)
2. NATIS Windhoek
3. Roads Authority Walvis Bay Office
4. Roads Authority Oshakati Office

---

## 🔍 Verify Database

### Check if Database Exists
```bash
# Connect to MongoDB shell
mongosh

# List databases
show dbs

# Should see: roads-authority

# Use database
use roads-authority

# List collections
show collections

# Should see: news, locations

# Count documents
db.news.countDocuments()
db.locations.countDocuments()

# Exit
exit
```

### Check via Backend API
```bash
# Start backend
cd backend
npm run dev

# Test endpoints
curl http://localhost:5000/api/news
curl http://localhost:5000/api/locations
```

---

## 🔧 Database Configuration

### Local MongoDB
```env
# backend/.env
MONGODB_URI=mongodb://localhost:27017/roads-authority
```

### MongoDB Atlas (Cloud)
```env
# backend/.env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/roads-authority?retryWrites=true&w=majority
```

### With Authentication
```env
# backend/.env
MONGODB_URI=mongodb://admin:password@localhost:27017/roads-authority?authSource=admin
```

---

## 📝 Database Schema (Auto-Created by Mongoose)

### News Collection
```javascript
{
  _id: ObjectId,
  title: String (required),
  content: String (required),
  excerpt: String (required),
  category: String (required),
  author: String (required),
  imageUrl: String (optional),
  published: Boolean (default: false),
  publishedAt: Date (optional),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

### Locations Collection
```javascript
{
  _id: ObjectId,
  name: String (required),
  address: String (required),
  region: String (required),
  coordinates: {
    latitude: Number (required),
    longitude: Number (required)
  },
  contactNumber: String (optional),
  email: String (optional),
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

---

## 🆘 Troubleshooting

### Issue: "MongoServerError: Authentication failed"
```bash
Solution:
1. Check username/password in MONGODB_URI
2. For Atlas: Whitelist your IP address
3. For local: Disable auth or create user
```

### Issue: "Database not created"
```bash
Solution:
1. Database is created on first write operation
2. Run seed script: npm run seed
3. Or add data via admin panel
```

### Issue: "Collection not found"
```bash
Solution:
1. Collections are created on first insert
2. Run seed script: npm run seed
3. Collections appear after first data insert
```

### Issue: "Cannot connect to MongoDB"
```bash
Solution:
1. Check MongoDB is running: mongod --version
2. Check MONGODB_URI in .env
3. For Atlas: Check internet connection
4. Check firewall isn't blocking port 27017
```

---

## 🎯 Recommended Setup Flow

### For Development
```bash
# 1. Install MongoDB locally
# Download from: https://www.mongodb.com/try/download/community

# 2. Start MongoDB
mongod

# 3. Configure backend
cd backend
cp .env.example .env
# Edit .env: MONGODB_URI=mongodb://localhost:27017/roads-authority

# 4. Seed database
npm run seed

# 5. Start backend
npm run dev

# 6. Start mobile app
cd ../app
npm start
```

### For Production
```bash
# 1. Use MongoDB Atlas (cloud)
# Create account: https://www.mongodb.com/cloud/atlas

# 2. Configure backend
MONGODB_URI=mongodb+srv://...

# 3. Seed production database (optional)
npm run seed

# 4. Deploy backend
npm run build
npm start
```

---

## ✅ Checklist

Before starting the app:

- [ ] MongoDB installed (local) OR Atlas account created (cloud)
- [ ] MongoDB running (check with `mongod --version`)
- [ ] Backend `.env` has correct `MONGODB_URI`
- [ ] Database seeded (optional): `npm run seed`
- [ ] Backend can connect (check console logs)
- [ ] Collections created (check with `mongosh`)

---

## 🎉 Summary

**You DON'T need to:**
- ❌ Manually create database
- ❌ Manually create tables/collections
- ❌ Define schemas upfront
- ❌ Run SQL scripts

**MongoDB AUTOMATICALLY:**
- ✅ Creates database on first connection
- ✅ Creates collections on first insert
- ✅ Manages indexes via Mongoose models
- ✅ Handles schema validation

**You ONLY need to:**
1. Install/setup MongoDB (local or Atlas)
2. Configure `MONGODB_URI` in `.env`
3. Optionally run `npm run seed` for sample data
4. Start backend with `npm run dev`

**That's it!** 🚀
