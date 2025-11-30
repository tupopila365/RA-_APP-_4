# ID Mapping Fix

## Problem Found

The backend was sending `id` but the frontend was expecting `_id`. This caused the delete to fail with "News ID is required for deletion".

## Root Cause

**Backend Controller** (`news.controller.ts`):
```typescript
news: result.news.map((article) => ({
  id: article._id,  // ← Sends 'id'
  title: article.title,
  // ...
}))
```

**Frontend Interface** (`news.service.ts`):
```typescript
export interface News {
  _id: string;  // ← Expects '_id'
  // ...
}
```

## Solution Applied

### 1. Updated Frontend Service
Added transformation to map `id` → `_id`:

```typescript
export const getNewsList = async (params) => {
  const response = await apiClient.get('/news', { params });
  
  // Transform: map 'id' to '_id'
  const transformedData = {
    ...response.data,
    data: {
      ...response.data.data,
      news: response.data.data.news.map((item: any) => ({
        ...item,
        _id: item.id || item._id, // Use backend's 'id', fallback to '_id'
      })),
    },
  };
  
  return transformedData;
};
```

### 2. Updated Delete Handler
Added fallback and debugging:

```typescript
const handleDeleteConfirm = async () => {
  // Use _id, but fallback to id if _id is not available
  const idToDelete = newsToDelete._id || (newsToDelete as any).id;
  
  if (!idToDelete) {
    throw new Error('No valid ID found on news item');
  }
  
  await deleteNews(idToDelete);
};
```

### 3. Added Debug Logging
Now logs:
- The full news item
- The `_id` value
- The `id` value
- Which ID is being sent to delete

## Testing

### Step 1: Restart & Refresh
```cmd
# Backend should already be running
# Just refresh the admin panel
```
Press **Ctrl + Shift + R** in your browser

### Step 2: Open Console
Press **F12** → Console tab

### Step 3: Try Deleting
Click delete on a news article. You should see:
```
Deleting news item: {_id: "674a...", title: "...", ...}
News ID (_id): 674a1b2c3d4e5f6g7h8i9j0k
News ID (id): 674a1b2c3d4e5f6g7h8i9j0k
Calling deleteNews with ID: 674a1b2c3d4e5f6g7h8i9j0k
```

### Step 4: Check Result
- ✅ If delete works: The news article disappears
- ❌ If still fails: Check the console logs to see which ID is undefined

## What to Look For

### Success:
```
Deleting news item: {_id: "674a...", ...}
News ID (_id): 674a1b2c3d4e5f6g7h8i9j0k
Calling deleteNews with ID: 674a1b2c3d4e5f6g7h8i9j0k
```

### If _id is undefined:
```
Deleting news item: {id: "674a...", ...}
News ID (_id): undefined
News ID (id): 674a1b2c3d4e5f6g7h8i9j0k
Calling deleteNews with ID: 674a1b2c3d4e5f6g7h8i9j0k
```
This is OK - the fallback will use `id`

### If both are undefined:
```
Deleting news item: {...}
News ID (_id): undefined
News ID (id): undefined
Error: No valid ID found on news item
```
This means the backend isn't sending any ID at all

## Next Steps

1. **Refresh the page** (Ctrl + Shift + R)
2. **Open console** (F12)
3. **Try deleting** a news article
4. **Check the console logs** - what do you see?

Let me know what the console shows and we'll fix it!
