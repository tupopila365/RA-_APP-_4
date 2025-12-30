# Chatbot Fine-Tuning Guide

This guide explains how to fine-tune your RAG chatbot for better performance, accuracy, and user experience.

## Table of Contents

1. [Quick Start](#quick-start)
2. [Prompt Engineering](#prompt-engineering)
3. [Model Selection](#model-selection)
4. [RAG Pipeline Tuning](#rag-pipeline-tuning)
5. [Generation Parameters](#generation-parameters)
6. [Advanced: Model Fine-Tuning](#advanced-model-fine-tuning)

---

## Quick Start

The easiest way to improve your chatbot is to **customize the system prompt**. Edit this file:

**File:** `RA-_APP-_4/rag-service/app/services/llm.py`

**Location:** Lines 50-55

```python
system_instruction = (
    "You are a helpful assistant for Roads Authority Namibia. "
    "Answer the question based on the provided context from official documents. "
    "If the answer is not in the context, say so clearly. "
    "Be concise and accurate in your responses."
)
```

After editing, restart the RAG service to apply changes.

---

## 1. Prompt Engineering

### Current Prompt Structure

The chatbot uses this prompt template:

```
[System Instructions]

Context:
[Source 1: Document Title]
{chunk text}

[Source 2: Document Title]
{chunk text}

Question: {user question}

Answer:
```

### Customizing System Instructions

**File:** `RA-_APP-_4/rag-service/app/services/llm.py`

**Method:** `_build_prompt()` (lines 34-77)

#### Example: More Detailed Instructions

```python
system_instruction = (
    "You are an expert assistant for Roads Authority Namibia (RA). "
    "Your role is to help citizens with questions about:\n"
    "- Driver's licenses and vehicle registration (NATIS)\n"
    "- Road maintenance and infrastructure\n"
    "- Traffic regulations and safety\n"
    "- RA services and procedures\n\n"
    "Guidelines:\n"
    "1. Answer ONLY based on the provided context from official RA documents\n"
    "2. If the answer is not in the context, politely say: 'I don't have that information in my knowledge base. Please contact RA directly at [contact info]'\n"
    "3. Be friendly, professional, and use simple language\n"
    "4. If asked about procedures, provide step-by-step instructions when available\n"
    "5. Always cite the source document when possible\n"
    "6. Keep answers concise but complete (2-4 sentences for simple questions, up to a paragraph for complex ones)"
)
```

#### Example: Specialized for Technical Questions

```python
system_instruction = (
    "You are a technical support assistant for Roads Authority Namibia. "
    "Provide accurate, detailed answers based on official documentation. "
    "When explaining procedures:\n"
    "- List steps in numbered format\n"
    "- Include required documents or prerequisites\n"
    "- Mention fees or costs if mentioned in the context\n"
    "- Provide contact information if available in the context\n"
    "If information is missing, clearly state what is not available."
)
```

### Customizing Context Format

You can also modify how context chunks are formatted:

**File:** `RA-_APP-_4/rag-service/app/services/llm.py`

**Lines 57-65:**

```python
# Current format:
context_parts.append(f"[Source {i}: {document_title}]\n{chunk_text}")

# Alternative: More detailed format
context_parts.append(
    f"--- Source {i} ---\n"
    f"Document: {document_title}\n"
    f"Page: {chunk.get('metadata', {}).get('page_number', 'N/A')}\n"
    f"Content:\n{chunk_text}\n"
)
```

---

## 2. Model Selection

### Current Configuration

**File:** `RA-_APP-_4/rag-service/app/config.py` or `.env`

```python
ollama_llm_model: str = "llama3.2:1b"  # or "mistral:7b"
```

### Available Models

| Model | Size | Speed | Quality | Best For |
|-------|------|-------|---------|----------|
| `llama3.2:1b` | 1.3GB | ⚡⚡⚡ Fast | ⭐⭐ Good | Quick responses, CPU-only |
| `llama3.2:3b` | 2.0GB | ⚡⚡ Medium | ⭐⭐⭐ Better | Balanced performance |
| `mistral:7b` | 4.1GB | ⚡ Slow | ⭐⭐⭐⭐ Excellent | High-quality answers |
| `llama3.1:8b` | 4.7GB | ⚡ Slow | ⭐⭐⭐⭐⭐ Best | Best quality, needs GPU |

### Switching Models

1. **Install the model:**
   ```bash
   ollama pull llama3.2:3b
   ```

2. **Update configuration:**
   
   **Option A: Environment Variable (Recommended)**
   
   Create/edit `RA-_APP-_4/rag-service/.env`:
   ```env
   OLLAMA_LLM_MODEL=llama3.2:3b
   ```
   
   **Option B: Config File**
   
   Edit `RA-_APP-_4/rag-service/app/config.py`:
   ```python
   ollama_llm_model: str = "llama3.2:3b"
   ```

3. **Restart RAG service:**
   ```bash
   # Stop current service (Ctrl+C)
   # Restart
   python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
   ```

### Model Comparison Test

Test different models with the same question:

```bash
# Test llama3.2:1b
curl -X POST http://localhost:8001/api/query \
  -H "Content-Type: application/json" \
  -d '{"question": "How do I apply for a driver license?"}'

# Switch model, restart service, test again
```

---

## 3. RAG Pipeline Tuning

### Chunk Size and Overlap

**File:** `RA-_APP-_4/rag-service/app/config.py`

```python
chunk_size: int = 500      # Tokens per chunk
chunk_overlap: int = 50     # Overlapping tokens between chunks
top_k_results: int = 5     # Number of chunks to retrieve
```

### Tuning Guidelines

#### Chunk Size

- **Small (200-300 tokens):** More precise, but may miss context
- **Medium (500-800 tokens):** Good balance (current default)
- **Large (1000+ tokens):** More context, but slower and less focused

**When to increase:**
- Questions need more context
- Documents have long paragraphs
- Answers are incomplete

**When to decrease:**
- Very specific questions
- Need faster responses
- Documents are dense

#### Chunk Overlap

- **Low (20-50 tokens):** Less redundancy, faster
- **Medium (50-100 tokens):** Good balance (current default)
- **High (100+ tokens):** More context continuity, slower

**When to increase:**
- Important information spans chunk boundaries
- Need better context flow

#### Top K Results

- **Low (3-5):** Faster, more focused (current default)
- **Medium (5-10):** More comprehensive
- **High (10+):** Slower, may include irrelevant chunks

**Example Configuration:**

```python
# For detailed, comprehensive answers
chunk_size: int = 800
chunk_overlap: int = 100
top_k_results: int = 7

# For quick, focused answers
chunk_size: int = 300
chunk_overlap: int = 30
top_k_results: int = 3
```

### Updating Configuration

1. **Edit config file:**
   ```python
   # RA-_APP-_4/rag-service/app/config.py
   chunk_size: int = 800
   chunk_overlap: int = 100
   top_k_results: int = 7
   ```

2. **Or use environment variables:**
   ```env
   # RA-_APP-_4/rag-service/.env
   CHUNK_SIZE=800
   CHUNK_OVERLAP=100
   TOP_K_RESULTS=7
   ```

3. **Re-index documents** (important!):
   ```bash
   # Documents need to be re-indexed with new chunk settings
   # Use the index_local_pdf.py script or re-upload via admin panel
   ```

---

## 4. Generation Parameters

### Temperature

Controls randomness/creativity of responses.

**File:** `RA-_APP-_4/rag-service/app/routers/query.py` (line 130)

```python
temperature=0.7  # Current default
```

**Values:**
- **0.0-0.3:** Very deterministic, factual (best for Q&A)
- **0.4-0.7:** Balanced (current default)
- **0.8-1.0:** More creative, varied responses

**Recommended for RAG:**
```python
temperature=0.3  # More factual, consistent answers
```

### Max Tokens

Controls maximum response length.

**File:** `RA-_APP-_4/rag-service/app/routers/query.py` (line 131)

```python
max_tokens=500  # Current default
```

**Values:**
- **200-300:** Short, concise answers
- **500-800:** Medium length (current default)
- **1000+:** Longer, detailed answers

**Example:**
```python
# For detailed explanations
max_tokens=1000

# For quick answers
max_tokens=300
```

### Updating Generation Parameters

**File:** `RA-_APP-_4/rag-service/app/routers/query.py`

**Lines 127-132:**

```python
answer = llm_service.generate_answer(
    question=request.question,
    context_chunks=search_results,
    temperature=0.3,      # Changed from 0.7
    max_tokens=800       # Changed from 500
)
```

**Also update streaming endpoint** (line 334 in `query_stream.py`):

```python
temperature=0.3  # Match the non-streaming endpoint
```

---

## 5. Advanced: Model Fine-Tuning

### What is Model Fine-Tuning?

Fine-tuning trains the base LLM on your specific domain data to improve performance on Roads Authority questions.

### Prerequisites

- GPU recommended (CPU fine-tuning is very slow)
- Training dataset (Q&A pairs from RA documents)
- Time (several hours to days)

### Option 1: Ollama Modelfile (Simpler)

Create a custom model with improved system prompt:

1. **Create Modelfile:**
   ```bash
   # Create file: RA_MODEL_Modelfile
   FROM llama3.2:1b
   
   SYSTEM """You are an expert assistant for Roads Authority Namibia.
   You help citizens with questions about driver licenses, vehicle registration,
   road maintenance, and RA services. Always be professional, accurate, and helpful."""
   ```

2. **Create custom model:**
   ```bash
   ollama create ra-chatbot -f RA_MODEL_Modelfile
   ```

3. **Update config:**
   ```env
   OLLAMA_LLM_MODEL=ra-chatbot
   ```

### Option 2: Full Fine-Tuning (Advanced)

Requires:
- Training script (Python)
- Q&A dataset
- LoRA or full fine-tuning framework

**Resources:**
- [Ollama Fine-Tuning Guide](https://github.com/ollama/ollama/blob/main/docs/training.md)
- [Llama Fine-Tuning Tutorial](https://huggingface.co/docs/transformers/training)

---

## Testing Your Changes

### 1. Test with Sample Questions

```bash
# Test question
curl -X POST http://localhost:8001/api/query \
  -H "Content-Type: application/json" \
  -d '{"question": "How do I apply for a driver license?"}'
```

### 2. Compare Before/After

1. Note current response quality
2. Make changes
3. Restart service
4. Test same question
5. Compare results

### 3. Monitor Logs

Watch RAG service logs for:
- Response times
- Token usage
- Error messages

```bash
# In RAG service terminal
# Look for:
# - "Successfully generated answer"
# - Response times
# - Any warnings
```

---

## Recommended Fine-Tuning Steps

### Step 1: Start with Prompt Engineering (Easiest)

1. Customize system instructions in `llm.py`
2. Test with 5-10 questions
3. Iterate based on results

### Step 2: Adjust Generation Parameters

1. Lower temperature to 0.3 for more factual answers
2. Increase max_tokens if answers are cut off
3. Test again

### Step 3: Tune RAG Pipeline (If Needed)

1. If answers miss context → increase chunk_size
2. If answers are too generic → decrease top_k
3. Re-index documents after changing chunk settings

### Step 4: Consider Better Model (If Quality Issues)

1. Test with `llama3.2:3b` or `mistral:7b`
2. Compare quality vs speed
3. Choose based on your needs

---

## Configuration Summary

### Quick Reference

| Setting | File | Current | Recommended |
|---------|------|---------|-------------|
| System Prompt | `llm.py:50-55` | Basic | Customized for RA |
| Model | `config.py:17` | `llama3.2:1b` | `llama3.2:3b` (if quality needed) |
| Chunk Size | `config.py:27` | 500 | 500-800 |
| Chunk Overlap | `config.py:28` | 50 | 50-100 |
| Top K | `config.py:29` | 5 | 5-7 |
| Temperature | `query.py:130` | 0.7 | 0.3-0.5 |
| Max Tokens | `query.py:131` | 500 | 500-800 |

---

## Troubleshooting

### Answers are too generic
- Lower temperature (0.3)
- Increase top_k (7-10)
- Improve system prompt

### Answers are incomplete
- Increase max_tokens (800-1000)
- Increase chunk_size (800)
- Increase top_k (7)

### Answers are slow
- Use smaller model (`llama3.2:1b`)
- Decrease top_k (3-5)
- Decrease chunk_size (300)

### Answers don't use context
- Improve system prompt (emphasize using context)
- Lower temperature (0.3)
- Check if documents are properly indexed

---

## Next Steps

1. **Start with prompt engineering** - Easiest and most impactful
2. **Test thoroughly** - Use real user questions
3. **Iterate** - Make small changes and test
4. **Monitor** - Watch logs and user feedback
5. **Document** - Keep notes on what works

For questions or issues, check the logs in `RA-_APP-_4/rag-service/` or backend logs.






