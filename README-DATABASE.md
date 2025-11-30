# 🗄️ Database - Quick Answer

## ❓ Do I need to create a database and tables?

### **NO! MongoDB does it automatically.** ✅

---

## 🚀 Just Do This:

### 1. Start MongoDB
```bash
mongod
```

### 2. Configure Backend
```bash
cd backend
cp .env.example .env
# Edit .env: Set MONGODB_URI=mongodb://localhost:27017/roads-authority
```

### 3. Add Sample Data (Optional but Recommended)
```bash
npm run seed
```

This adds:
- ✅ 3 news articles
- ✅ 4 office locations

### 4. Start Backend
```bash
npm run dev
```

**Done!** Database and collections are created automatically. 🎉

---

## 📊 What Happens Automatically:

```
When backend starts:
├── ✅ Database "roads-authority" created
├── ✅ Connection established
└── ✅ Ready to use

When you add data:
├── ✅ Collection "news" created
├── ✅ Collection "locations" created
└── ✅ Indexes created automatically
```

---

## 🌐 Alternative: Use Cloud (No Local Install)

**MongoDB Atlas** (Free tier available):

1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create free account
3. Create cluster (3-5 minutes)
4. Get connection string
5. Update `MONGODB_URI` in `.env`
6. Run `npm run seed`
7. Start backend

**No local MongoDB installation needed!**

---

## 🔍 Verify It Works:

```bash
# After starting backend, test:
curl http://localhost:5000/api/news
curl http://localhost:5000/api/locations

# Should return JSON data
```

---

## 📖 Need More Details?

See `DATABASE-SETUP.md` for complete guide.

---

**TL;DR: MongoDB creates everything automatically. Just start it and go!** 🚀
