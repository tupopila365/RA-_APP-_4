# Quick Test Guide - Chatbot Timeout Fix

## Prerequisites

Make sure you have:
- ✅ Ollama running: `ollama serve`
- ✅ Models downloaded: `ollama pull nomic-embed-text:latest` and `ollama pull llama3.2:1b`
- ✅ MongoDB running
- ✅ All dependencies installed

## Step 1: Start Services

```bash
# Terminal 1: Start main services
cd "C:\Roads Authority Application\RA-_APP-_4"
START-ALL.bat

# Terminal 2: Start RAG service
cd "C:\Roads Authority Application\RA-_APP-_4"
START-RAG.bat
```

Wait for all services to start:
- Backend: http://localhost:5000
- Admin: http://localhost:5173
- RAG Service: http://localhost:8001
- Mobile App: Expo DevTools

## Step 2: Test RAG Service Directly

### Test Regular Endpoint

```bash
curl -X POST http://localhost:8001/api/query ^
  -H "Content-Type: application/json" ^
  -d "{\"question\":\"What is Roads Authority?\",\"top_k\":5}"
```

**Expected:** JSON response with answer and sources

### Test Streaming Endpoint

```bash
curl -X POST http://localhost:8001/api/query/stream ^
  -H "Content-Type: application/json" ^
  -d "{\"question\":\"What is Roads Authority?\",\"top_k\":5}"
```

**Expected:** Streaming response with:
1. Metadata event (sources, confidence)
2. Multiple chunk events (answer parts)
3. Done event (completion)

## Step 3: Test Backend Proxy

### Test Regular Endpoint

```bash
curl -X POST http://localhost:5000/api/chatbot/query ^
  -H "Content-Type: application/json" ^
  -d "{\"question\":\"What is Roads Authority?\"}"
```

**Expected:** JSON response with success=true and data

### Test Streaming Endpoint

```bash
curl -X POST http://localhost:5000/api/chatbot/query/stream ^
  -H "Content-Type: application/json" ^
  -d "{\"question\":\"What is Roads Authority?\"}"
```

**Expected:** Streaming SSE response

## Step 4: Test Mobile App

### Option A: Use Existing Query Method

If your mobile app already has chatbot functionality:

1. Open the app on your device/emulator
2. Navigate to the chatbot screen
3. Ask a question: "What is Roads Authority?"
4. **Expected:** Answer appears within 60 seconds (no timeout)

### Option B: Test Streaming (Recommended)

Update your chatbot screen to use streaming:

```javascript
import { chatbotService } from '../services/chatbotService';

const ChatbotScreen = () => {
  const [answer, setAnswer] = useState('');
  const [sources, setSources] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);

  const handleQuery = async (question) => {
    setIsStreaming(true);
    setAnswer('');
    
    try {
      await chatbotService.queryStream(question, {
        onMetadata: ({ sources, confidence }) => {
          console.log('Received metadata:', sources, confidence);
          setSources(sources);
        },
        onChunk: (chunk, fullAnswer) => {
          console.log('Received chunk:', chunk);
          setAnswer(fullAnswer);
        },
        onComplete: (fullAnswer) => {
          console.log('Streaming complete:', fullAnswer);
          setIsStreaming(false);
        },
        onError: (error) => {
          console.error('Streaming error:', error);
          setIsStreaming(false);
          Alert.alert('Error', error.message);
        }
      });
    } catch (error) {
      setIsStreaming(false);
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View>
      <TextInput
        placeholder="Ask a question..."
        onSubmitEditing={(e) => handleQuery(e.nativeEvent.text)}
      />
      {isStreaming && <ActivityIndicator />}
      <Text>{answer}</Text>
      {sources.map((source, index) => (
        <Text key={index}>{source.title}</Text>
      ))}
    </View>
  );
};
```

## Step 5: Verify Improvements

### Test Scenarios

1. **First Query (Cold Start)**
   - Ask: "What is Roads Authority?"
   - **Before fix:** Timeout after 10s
   - **After fix:** Answer in 8-10s (with warmup) or 15-20s (without)

2. **Subsequent Queries**
   - Ask: "What services do you provide?"
   - **Before fix:** 8-12s
   - **After fix:** 5-8s

3. **Complex Query**
   - Ask: "Tell me about road maintenance procedures and tender processes"
   - **Before fix:** Timeout
   - **After fix:** Answer in 10-15s

4. **Streaming Experience**
   - Ask any question using streaming
   - **Expected:** See answer appear word by word in real-time

## Expected Results

### ✅ Success Indicators

- No timeout errors
- Answers appear within 60 seconds
- Streaming shows real-time progress
- Sources are displayed correctly
- Confidence scores are shown

### ❌ Failure Indicators

- Timeout after 10 seconds
- "Request timeout" error
- No response from server
- Connection errors

## Troubleshooting

### Issue: Still getting timeouts

**Check:**
```bash
# 1. Verify Ollama is running
curl http://localhost:11434/api/tags

# 2. Verify RAG service is running
curl http://localhost:8001/health

# 3. Verify backend is running
curl http://localhost:5000/api/health

# 4. Check mobile app timeout setting
# Open: app/config/env.js
# Verify: API_TIMEOUT: 60000
```

### Issue: Streaming not working

**Check:**
```bash
# Test streaming endpoint directly
curl -N -X POST http://localhost:8001/api/query/stream ^
  -H "Content-Type: application/json" ^
  -d "{\"question\":\"test\",\"top_k\":3}"
```

**Expected:** Should see streaming events

### Issue: Slow responses

**Solution 1: Warm up models**
```bash
# Run these commands to pre-load models
ollama run nomic-embed-text "test"
ollama run llama3.2:1b "test"
```

**Solution 2: Check model warmup**
```bash
# Check RAG service logs
# Should see: "Warming up Ollama models..."
# Should see: "Model warmup complete"
```

**Solution 3: Use smaller model**
```bash
# Edit rag-service/.env
OLLAMA_LLM_MODEL=llama3.2:1b  # Already using smallest model
```

## Performance Benchmarks

### Regular Query (Non-Streaming)

| Scenario | Before Fix | After Fix |
|----------|-----------|-----------|
| First query | Timeout (10s) | 8-10s (with warmup) |
| Subsequent | 8-12s | 5-8s |
| Complex query | Timeout | 10-15s |

### Streaming Query

| Scenario | Time to First Chunk | Time to Complete |
|----------|-------------------|------------------|
| First query | 2-3s | 8-10s |
| Subsequent | 1-2s | 5-8s |
| Complex query | 2-3s | 10-15s |

## Debug Commands

### Check Service Status

```bash
# Backend health
curl http://localhost:5000/api/health

# RAG service health
curl http://localhost:8001/health

# Chatbot health
curl http://localhost:5000/api/chatbot/health

# Ollama status
curl http://localhost:11434/api/tags
```

### View Logs

```bash
# RAG service logs (in the terminal where START-RAG.bat is running)
# Look for:
# - "Warming up Ollama models..."
# - "Model warmup complete"
# - "Processing query: ..."
# - "Successfully generated answer"

# Backend logs (in the terminal where START-ALL.bat is running)
# Look for:
# - "Server running on port 5000"
# - "MongoDB connected"
# - Chatbot query logs
```

### Test with Python Script

Create `test-streaming.py`:

```python
import requests
import json

url = "http://localhost:8001/api/query/stream"
data = {"question": "What is Roads Authority?", "top_k": 5}

response = requests.post(url, json=data, stream=True)

for line in response.iter_lines():
    if line:
        line = line.decode('utf-8')
        if line.startswith('data: '):
            data = json.loads(line[6:])
            print(f"Type: {data.get('type')}")
            if data.get('type') == 'chunk':
                print(f"Content: {data.get('content')}")
            elif data.get('type') == 'metadata':
                print(f"Sources: {len(data.get('sources', []))}")
                print(f"Confidence: {data.get('confidence')}")
```

Run:
```bash
cd RA-_APP-_4
python test-streaming.py
```

## Success Checklist

- [ ] All services started successfully
- [ ] Regular query works (no timeout)
- [ ] Streaming query works (real-time chunks)
- [ ] Mobile app receives answers
- [ ] Sources are displayed
- [ ] No timeout errors
- [ ] Response time < 60 seconds
- [ ] Streaming shows progress

## Next Steps

Once testing is complete:

1. **Implement streaming UI in mobile app**
   - Show typing indicator
   - Display answer as it streams
   - Show sources after metadata

2. **Add error handling**
   - Timeout fallback
   - Retry logic
   - User-friendly error messages

3. **Optimize performance**
   - Cache common queries
   - Pre-load models on startup
   - Use connection pooling

4. **Monitor in production**
   - Track response times
   - Monitor timeout rates
   - Collect user feedback

## Support

If you encounter issues:

1. Check the logs in all terminal windows
2. Verify all services are running
3. Test each endpoint individually
4. Review the main documentation: `CHATBOT-TIMEOUT-FIX-COMPLETE.md`

## Summary

The timeout fix includes:
- ✅ Streaming support for real-time answers
- ✅ Increased timeouts (60s regular, 120s streaming)
- ✅ Model warmup for faster first queries
- ✅ Better error handling
- ✅ Comprehensive testing guide

**Expected Result:** Chatbot works reliably with no timeout issues!
