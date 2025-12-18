# API Timeout Configuration

## ✅ What I've Fixed

I've optimized the API timeout configuration for different types of requests to improve performance and user experience.

## 📊 Timeout Settings

### Current Configuration

| Request Type | Timeout | Use Case |
|-------------|---------|----------|
| **Regular API Calls** | 15 seconds | News, Banners, Vacancies, Tenders, Locations |
| **Chatbot Queries** | 60 seconds | AI chatbot responses (longer processing time) |
| **Streaming Responses** | 2 minutes (120s) | Chatbot streaming responses |

### Configuration File

**File:** `app/config/env.js`

```javascript
const ENV = {
  development: {
    API_BASE_URL: 'http://192.168.12.166:5000/api',
    API_TIMEOUT: 15000,           // 15 seconds for regular calls
    API_TIMEOUT_LONG: 60000,     // 60 seconds for chatbot
    API_TIMEOUT_STREAM: 120000,  // 2 minutes for streaming
  },
  production: {
    API_BASE_URL: 'https://api.roadsauthority.na/api',
    API_TIMEOUT: 15000,
    API_TIMEOUT_LONG: 60000,
    API_TIMEOUT_STREAM: 120000,
  },
};
```

## 🔧 How It Works

### 1. Regular API Calls (15 seconds)

All standard GET/POST requests use the default 15-second timeout:

```javascript
// News, Banners, Vacancies, Tenders, Locations
const response = await ApiClient.get('/news');
// Uses: API_TIMEOUT (15 seconds)
```

**Why 15 seconds?**
- Most API calls should complete in 1-3 seconds
- 15 seconds allows for slow networks
- Prevents users waiting too long for simple requests
- Faster error feedback

### 2. Chatbot Queries (60 seconds)

Chatbot queries use a longer timeout:

```javascript
// Chatbot service automatically uses longer timeout
const response = await chatbotService.query(question);
// Uses: API_TIMEOUT_LONG (60 seconds)
```

**Why 60 seconds?**
- AI processing takes longer
- RAG (Retrieval Augmented Generation) needs time to search and generate
- Better user experience than timing out too early

### 3. Streaming Responses (2 minutes)

Streaming responses have the longest timeout:

```javascript
// Chatbot streaming
await chatbotService.queryStream(question, {
  onChunk: (chunk) => { ... },
  onComplete: (answer) => { ... }
});
// Uses: API_TIMEOUT_STREAM (120 seconds)
```

**Why 2 minutes?**
- Streaming can take time to complete
- User sees progress as chunks arrive
- Prevents premature timeout during long responses

## 🎯 Custom Timeouts

You can also specify custom timeouts for specific requests:

```javascript
// Use custom timeout for a specific request
const response = await ApiClient.requestWithTimeout(
  '/some-endpoint',
  30000, // 30 seconds
  { method: 'GET' }
);

// Or pass timeout in options
const response = await ApiClient.get('/endpoint', {
  timeout: 20000 // 20 seconds
});
```

## 📱 Services Using Timeouts

### Regular Timeout (15s)
- ✅ `newsService` - News articles
- ✅ `bannersService` - Homepage banners
- ✅ `vacanciesService` - Job vacancies
- ✅ `tendersService` - Tender listings
- ✅ `locationsService` - Office locations
- ✅ `chatbotService.checkHealth()` - Health checks

### Long Timeout (60s)
- ✅ `chatbotService.query()` - Chatbot queries

### Streaming Timeout (120s)
- ✅ `chatbotService.queryStream()` - Streaming chatbot responses

## 🐛 Error Handling

When a timeout occurs, you'll see:

```javascript
// Error message
"Request timeout after 15s" // or 60s, 120s depending on request type

// Error object
{
  message: "Request timeout after 15s",
  status: 408,
  details: {
    timeout: true,
    timeoutMs: 15000
  }
}
```

## 🔍 Debugging

The enhanced logging shows timeout information:

```
🌐 API Configuration: {
  API_BASE_URL: 'http://192.168.12.166:5000/api',
  endpoint: '/news',
  fullUrl: 'http://192.168.12.166:5000/api/news',
  timeout: 15000,  // Shows the timeout being used
  method: 'GET'
}
```

If timeout occurs:
```
⏱️ Request timeout after 15000 ms
```

## ⚙️ Adjusting Timeouts

If you need to adjust timeouts, edit `app/config/env.js`:

```javascript
const ENV = {
  development: {
    API_TIMEOUT: 20000,        // Increase to 20 seconds
    API_TIMEOUT_LONG: 90000,   // Increase to 90 seconds
    API_TIMEOUT_STREAM: 180000, // Increase to 3 minutes
  },
};
```

**Recommendations:**
- **Regular API:** 10-20 seconds (15s is good balance)
- **Chatbot:** 45-90 seconds (60s is good balance)
- **Streaming:** 90-180 seconds (120s is good balance)

## 📋 Benefits

1. **Faster Error Feedback** - Users don't wait 60 seconds for simple requests
2. **Better UX** - Appropriate timeouts for different request types
3. **Network Efficiency** - Fails fast on network issues
4. **Flexible** - Can override timeout per request if needed
5. **Clear Logging** - Shows which timeout is being used

## 🚀 Next Steps

1. **Restart the mobile app** to apply new timeout settings:
   ```powershell
   cd app
   npx expo start -c
   ```

2. **Monitor console logs** to see timeout values being used

3. **Test different endpoints** to verify appropriate timeouts

4. **Adjust if needed** based on your network conditions

## 📝 Notes

- Timeouts are in milliseconds (ms)
- All timeouts are configurable via `env.js`
- Default timeout is 15 seconds if not specified
- Chatbot automatically uses longer timeout
- Streaming uses longest timeout automatically



