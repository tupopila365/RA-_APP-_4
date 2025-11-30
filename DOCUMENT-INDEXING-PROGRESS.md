# Document Indexing Progress Feature

## Overview

Added a visual progress indicator to show the status of document upload and indexing in real-time.

## Features Added

### 1. Upload Progress Bar

When uploading a document, users now see:

- **Progress Bar**: A visual linear progress bar showing 0-100%
- **Stage Indicators**: Icons and text showing current stage
- **Percentage Display**: Numeric percentage (e.g., "45%")
- **Stage Descriptions**: Helpful text explaining what's happening

### 2. Upload Stages

The upload process is divided into two main stages:

#### Stage 1: Uploading (0-50%)
- **Icon**: Cloud upload icon
- **Status**: "Uploading document..."
- **Description**: "Uploading file to cloud storage..."
- **Progress**: 0% → 50%

#### Stage 2: Indexing (50-100%)
- **Icon**: AI/Magic wand icon
- **Status**: "Indexing document for AI chatbot..."
- **Description**: "Processing document and creating embeddings for AI search..."
- **Progress**: 50% → 100%

#### Stage 3: Complete (100%)
- **Icon**: Success icon (green)
- **Status**: "Complete!"
- **Description**: "Document is ready for chatbot queries!"
- **Progress**: 100%

### 3. Document List Enhancements

In the document list, documents that are being indexed now show:
- **"Indexing" chip** with warning color
- **Spinning progress indicator** next to the status
- **Tooltip**: "Document is being processed for indexing. This may take a few minutes."

## User Experience

### Before Upload
```
[Upload Document Button]
```

### During Upload (Stage 1)
```
┌─────────────────────────────────────────┐
│ 🌥️ Uploading document...               │
│ ████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░   │
│                                     25% │
│ Uploading file to cloud storage...     │
└─────────────────────────────────────────┘
```

### During Indexing (Stage 2)
```
┌─────────────────────────────────────────┐
│ ✨ Indexing document for AI chatbot...  │
│ ████████████████████████░░░░░░░░░░░░░   │
│                                     75% │
│ Processing document and creating        │
│ embeddings for AI search...             │
└─────────────────────────────────────────┘
```

### Complete
```
┌─────────────────────────────────────────┐
│ ✅ Complete!   