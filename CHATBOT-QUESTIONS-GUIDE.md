# What Questions Can I Ask the Chatbot?

This guide explains what types of questions work best with your Roads Authority chatbot and provides examples based on your indexed documents.

## 📚 Currently Indexed Documents

Based on your system, you have indexed:
- **RA NATIS FAQ** - Information about driver's licenses, vehicle registration, and NATIS system

## ✅ Best Types of Questions

### 1. **Factual Questions** (Best Results)
Ask about specific facts, procedures, or information from the documents.

**Examples:**
- "What is NATIS?"
- "How do I apply for a driver's license?"
- "What documents do I need for vehicle registration?"
- "How do I renew my driver's license?"
- "What are the requirements for a driver's license?"
- "Where can I apply for a driver's license?"

### 2. **Procedural Questions** (Good Results)
Ask about step-by-step processes or procedures.

**Examples:**
- "What is the process to register a vehicle?"
- "How do I renew my license online?"
- "What steps do I need to follow to get a driver's license?"
- "What is the procedure for vehicle registration?"

### 3. **Definition/Explanation Questions** (Good Results)
Ask about what something means or how it works.

**Examples:**
- "What does NATIS stand for?"
- "What is the Roads Authority?"
- "Explain what NATIS is"
- "What is vehicle registration?"

### 4. **Requirements Questions** (Good Results)
Ask about what's needed for a service or process.

**Examples:**
- "What documents do I need for a driver's license?"
- "What are the requirements for vehicle registration?"
- "What do I need to bring to renew my license?"
- "What fees are required for registration?"

## ⚠️ Questions That May Not Work Well

### 1. **Very Short Queries** (Limited Results)
- ❌ "Hi"
- ❌ "Hello"
- ❌ "Help"
- ✅ Better: "Hello, how can I apply for a driver's license?"

### 2. **Questions Outside Document Scope** (No Results)
- ❌ "What's the weather today?"
- ❌ "Tell me a joke"
- ❌ "What time is it?"
- ✅ Better: Ask about Roads Authority services

### 3. **Opinion or Subjective Questions** (Limited Results)
- ❌ "What do you think about..."
- ❌ "Should I..."
- ✅ Better: "What are the requirements for..."

### 4. **Questions About Future Events** (No Results)
- ❌ "When will the new office open?"
- ❌ "What are your hours tomorrow?"
- ✅ Better: Ask about documented procedures

## 💡 Tips for Better Results

### 1. **Be Specific**
- ❌ "Tell me about licenses"
- ✅ "How do I apply for a driver's license in Namibia?"

### 2. **Use Complete Questions**
- ❌ "license"
- ✅ "How do I renew my driver's license?"

### 3. **Ask About Documented Information**
- ✅ Questions about procedures in the indexed documents
- ✅ Questions about services mentioned in documents
- ✅ Questions about requirements or steps

### 4. **Rephrase if No Results**
If you don't get a good answer, try:
- Using different keywords
- Being more specific
- Asking about a related topic

## 📋 Example Questions Based on Your Documents

### About NATIS
- "What is NATIS?"
- "What does NATIS stand for?"
- "How does NATIS work?"
- "What is the NATIS system used for?"

### About Driver's Licenses
- "How do I apply for a driver's license?"
- "What are the requirements for a driver's license?"
- "How do I renew my driver's license?"
- "Can I renew my license online?"
- "What documents do I need for a driver's license?"
- "Where can I apply for a driver's license?"

### About Vehicle Registration
- "How do I register a vehicle?"
- "What is the process for vehicle registration?"
- "What documents are needed for vehicle registration?"
- "What are the requirements for registering a vehicle?"

### General Roads Authority Questions
- "What services does Roads Authority provide?"
- "How can I contact Roads Authority?"
- "What does Roads Authority do?"

## 🎯 Question Format Examples

### Good Question Formats:
1. **"How do I..."** - For procedures
   - "How do I apply for a driver's license?"
   - "How do I renew my license?"

2. **"What is..."** - For definitions
   - "What is NATIS?"
   - "What is vehicle registration?"

3. **"What are..."** - For requirements/lists
   - "What are the requirements for a driver's license?"
   - "What documents do I need?"

4. **"Where can I..."** - For locations/services
   - "Where can I apply for a license?"
   - "Where can I register my vehicle?"

5. **"Can I..."** - For capabilities
   - "Can I renew my license online?"
   - "Can I apply online?"

## 🔍 Testing Your Questions

### Quick Test
Try these questions to see what works:

1. **Basic Question:**
   ```
   "What is NATIS?"
   ```

2. **Procedural Question:**
   ```
   "How do I apply for a driver's license?"
   ```

3. **Requirements Question:**
   ```
   "What documents do I need for vehicle registration?"
   ```

### Check the Response
A good response should:
- ✅ Answer your question directly
- ✅ Include source documents
- ✅ Be relevant to Roads Authority
- ✅ Be based on the indexed documents

A poor response might:
- ❌ Say "I couldn't find relevant information"
- ❌ Have 0 sources
- ❌ Give a generic answer
- ❌ Not relate to your question

## 📊 Understanding the Response

### Response Structure
```json
{
  "answer": "The answer to your question...",
  "sources": [
    {
      "documentId": "...",
      "title": "RA NATIS FAQ",
      "relevance": 0.85
    }
  ],
  "confidence": 0.85
}
```

### What the Numbers Mean:
- **Relevance (0.0 - 1.0):** How relevant the source is to your question
  - 0.7+ = Very relevant
  - 0.4-0.7 = Somewhat relevant
  - <0.4 = Low relevance
- **Confidence (0.0 - 1.0):** Overall confidence in the answer
  - 0.7+ = High confidence
  - 0.4-0.7 = Medium confidence
  - <0.4 = Low confidence

## 🚀 Improving Your Questions

### If You Get 0 Sources:
1. **Check if documents are indexed:**
   - Ask: "What is NATIS?" (should work if documents are indexed)

2. **Try a more specific question:**
   - Instead of: "license"
   - Try: "How do I apply for a driver's license?"

3. **Use keywords from the documents:**
   - NATIS, driver's license, vehicle registration, Roads Authority

### If You Get Low Relevance:
1. **Rephrase your question**
2. **Be more specific**
3. **Use different keywords**

## 📝 Quick Reference

### ✅ DO:
- Ask complete, specific questions
- Use keywords from Roads Authority documents
- Ask about procedures, requirements, or definitions
- Be clear and direct

### ❌ DON'T:
- Ask very short questions (1-2 words)
- Ask about topics not in the documents
- Ask for opinions or predictions
- Use vague or ambiguous language

## 🎓 Example Conversation Flow

**User:** "Hello, I need help with my driver's license"

**Chatbot:** [Responds with general information]

**User:** "How do I apply for a driver's license?"

**Chatbot:** [Provides step-by-step procedure from documents]

**User:** "What documents do I need?"

**Chatbot:** [Lists required documents from indexed documents]

**User:** "Can I do this online?"

**Chatbot:** [Answers based on available information]

## 💬 Need More Help?

If you're not getting good results:
1. Check that documents are indexed (ask "What is NATIS?")
2. Try rephrasing your question
3. Be more specific
4. Use keywords from Roads Authority services

Remember: The chatbot can only answer questions based on the documents that have been indexed. To answer more questions, upload and index more documents through the admin panel!


