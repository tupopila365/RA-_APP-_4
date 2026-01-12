# Timeout Configuration Update - 60 Second Chatbot Responses

## Changes Made

All chatbot-related timeouts have been standardized to **60 seconds** across the entire system.

### 1. Frontend Mobile App (`app/config/env.js`)
```javascript
// Before:
API_TIMEOUT_STREAM: 120000, // 2 minutes for streaming responses

// After:
API_TIMEOUT_STREAM: 60000, // 60 seconds for streaming responses
```

### 2. Backend Chatbot Controller (`backend/src/modules/chatbot/chatbot.controller.ts`)
```typescript
// Before:
timeout: 120000, // 2 minutes

// After:
timeout: 60000, // 60 seconds
```

### 3. RAG Service Configuration (`rag-service/app/config.py`)
```python
# Before:
streaming_timeout: int = 120  # 2 minutes for streaming responses

# After:
streaming_timeout: int = 60  # 60 seconds for streaming responses
```

### 4. Backend HTTP Client (`backend/src/utils/httpClient.ts`)
```typescript
// Before:
export const ragServiceClient = new HttpClient(env.RAG_SERVICE_URL, 300000); // 5 minutes

// After:
export const ragServiceClient = new HttpClient(env.RAG_SERVICE_URL, 60000); // 60 seconds
```

## Timeout Hierarchy

The system now uses these timeout values:

1. **Regular API calls**: 15 seconds (news, banners, etc.)
2. **Chatbot queries**: 60 seconds (all chatbot interactions)
3. **Streaming responses**: 60 seconds (real-time chatbot responses)
4. **Embedding generation**: 30 seconds (RAG service internal)
5. **Document search**: 30 seconds (RAG service internal)

## Benefits

1. **Consistent User Experience**: All chatbot interactions timeout at the same 60-second mark
2. **Faster Feedback**: Users get timeout messages sooner (60s vs 2+ minutes)
3. **Better Resource Management**: Prevents long-running queries from consuming resources
4. **Improved Performance**: Forces optimization of complex queries

## Impact on User Experience

- **Complex questions** will timeout after 60 seconds with the message: "The request timed out. Please try asking a simpler question."
- **Simple questions** should still respond within 5-15 seconds
- **Medium complexity questions** have 60 seconds to complete

## Restart Required

After making these changes, you need to restart:

1. **Backend server**: `npm run dev` in the backend folder
2. **RAG service**: `python -m uvicorn app.main:app --reload` in the rag-service folder
3. **Mobile app**: Restart Expo development server

## Testing

To test the new timeout:
1. Ask a very complex question that would normally take over 60 seconds
2. Verify you get the timeout message after exactly 60 seconds
3. Ask a simple question to ensure normal functionality still works

## Monitoring

Watch the logs for:
- `Request timeout after 60s` messages in the mobile app
- `TIMEOUT_ERROR` messages in the RAG service
- HTTP 408 responses in the backend

The 60-second timeout provides a good balance between allowing complex queries to complete while preventing the system from hanging on overly complex requests.