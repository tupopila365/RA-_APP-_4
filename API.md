# Roads Authority Namibia - API Documentation

## Table of Contents

1. [Overview](#overview)
2. [Base URL](#base-url)
3. [Authentication](#authentication)
4. [Error Handling](#error-handling)
5. [API Endpoints](#api-endpoints)
   - [Authentication](#authentication-endpoints)
   - [User Management](#user-management-endpoints)
   - [Documents](#documents-endpoints)
   - [News](#news-endpoints)
   - [Vacancies](#vacancies-endpoints)
   - [Tenders](#tenders-endpoints)
   - [Banners](#banners-endpoints)
   - [Locations](#locations-endpoints)
   - [Chatbot](#chatbot-endpoints)
6. [RAG Service](#rag-service-endpoints)
7. [Data Models](#data-models)

---

## Overview

This document provides comprehensive documentation for the Roads Authority Namibia backend API. The API is built with Node.js, Express, and TypeScript, and provides endpoints for content management, authentication, and AI-powered chatbot functionality.

**Key Features:**
- JWT-based authentication with role-based access control (RBAC)
- RESTful API design
- Comprehensive error handling
- File upload support (PDFs, images)
- Integration with RAG service for AI chatbot
- Pagination and filtering support

---

## Base URL

**Development:** `http://localhost:5000`
**Production:** `https://api.roadsauthority.na` (example)

All API endpoints are prefixed with `/api` unless otherwise specified.

---

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Most endpoints require authentication and specific permissions.

### Token Types

1. **Access Token**
   - Expires in 15 minutes
   - Used for API requests
   - Sent in Authorization header

2. **Refresh Token**
   - Expires in 7 days
   - Used to obtain new access tokens
   - Stored in Redis for revocation capability

### Authentication Header

Include the access token in the Authorization header for protected endpoints:

```
Authorization: Bearer <access_token>
```

### Roles and Permissions

**Roles:**
- `super-admin`: Full system access including user management
- `admin`: Content management access based on assigned permissions

**Permissions:**
- `news:manage` - Create, edit, delete news articles
- `tenders:manage` - Create, edit, delete tenders
- `vacancies:manage` - Create, edit, delete vacancies
- `documents:upload` - Upload and manage PDF documents
- `banners:manage` - Create, edit, delete banners
- `locations:manage` - Create, edit, delete office locations
- `users:manage` - Manage admin users (super-admin only)

---

## Error Handling

All API responses follow a consistent format for both success and error cases.

### Success Response Format

```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": { ... }
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### HTTP Status Codes

- `200 OK` - Request succeeded
- `201 Created` - Resource created successfully
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Authentication required or failed
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `409 Conflict` - Resource already exists
- `500 Internal Server Error` - Server error
- `503 Service Unavailable` - External service unavailable

### Error Codes

| Code | Description |
|------|-------------|
| `AUTH_001` | Invalid credentials |
| `AUTH_002` | Token expired |
| `AUTH_003` | Insufficient permissions |
| `AUTH_004` | Invalid token |
| `AUTH_005` | Missing token |
| `AUTH_006` | Unauthorized |
| `VALIDATION_001` | Validation error |
| `VALIDATION_002` | Invalid input data |
| `UPLOAD_001` | File upload failed |
| `UPLOAD_002` | Invalid file type |
| `UPLOAD_003` | File size exceeded |
| `UPLOAD_004` | Upload error |
| `DB_001` | Database operation failed |
| `DB_002` | Database connection error |
| `DB_003` | Duplicate resource |
| `RAG_001` | RAG service unavailable |
| `RAG_002` | Document indexing failed |
| `RAG_003` | Query processing failed |
| `NOT_FOUND` | Resource not found |
| `SERVER_ERROR` | Internal server error |
| `BAD_REQUEST` | Bad request |

---

## API Endpoints

### Health Check

#### Check Server Health

```
GET /health
```

**Access:** Public

**Description:** Check if the server is running.

**Response:**

```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

## Authentication Endpoints

### Login

```
POST /api/auth/login
```

**Access:** Public

**Description:** Authenticate admin user and receive JWT tokens.

**Request Body:**

```json
{
  "email": "admin@roadsauthority.na",
  "password": "SecurePassword123"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "507f1f77bcf86cd799439011",
      "email": "admin@roadsauthority.na",
      "role": "super-admin",
      "permissions": [
        "news:manage",
        "tenders:manage",
        "vacancies:manage",
        "documents:upload",
        "banners:manage",
        "locations:manage",
        "users:manage"
      ]
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  },
  "message": "Login successful",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Error Response (401):**

```json
{
  "success": false,
  "error": {
    "code": "AUTH_001",
    "message": "Invalid email or password"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

### Refresh Token

```
POST /api/auth/refresh
```

**Access:** Public

**Description:** Obtain a new access token using a refresh token.

**Request Body:**

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Token refreshed successfully",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Error Response (401):**

```json
{
  "success": false,
  "error": {
    "code": "AUTH_002",
    "message": "Token has expired"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

### Logout

```
POST /api/auth/logout
```

**Access:** Private (requires authentication)

**Description:** Invalidate the refresh token and log out the user.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Logout successful",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

## User Management Endpoints

**Note:** All user management endpoints require `users:manage` permission (super-admin only).

### Create User

```
POST /api/users
```

**Access:** Private (super-admin only)

**Description:** Create a new admin user with assigned role and permissions.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**

```json
{
  "email": "newadmin@roadsauthority.na",
  "password": "SecurePassword123",
  "role": "admin",
  "permissions": ["news:manage", "banners:manage"]
}
```

**Success Response (201):**

```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "email": "newadmin@roadsauthority.na",
    "role": "admin",
    "permissions": ["news:manage", "banners:manage"],
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  },
  "message": "User created successfully",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Error Response (409):**

```json
{
  "success": false,
  "error": {
    "code": "DB_003",
    "message": "Resource already exists",
    "details": "User with this email already exists"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

### List Users

```
GET /api/users
```

**Access:** Private (super-admin only)

**Description:** List all admin users with pagination.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 10 | Items per page (max: 100) |

**Example Request:**
```
GET /api/users?page=1&limit=20
```

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "users": [
      {
        "_id": "507f1f77bcf86cd799439011",
        "email": "admin@roadsauthority.na",
        "role": "super-admin",
        "permissions": ["news:manage", "tenders:manage", "users:manage"],
        "createdAt": "2024-01-01T10:00:00.000Z",
        "updatedAt": "2024-01-01T10:00:00.000Z"
      },
      {
        "_id": "507f1f77bcf86cd799439012",
        "email": "newsmanager@roadsauthority.na",
        "role": "admin",
        "permissions": ["news:manage"],
        "createdAt": "2024-01-10T14:30:00.000Z",
        "updatedAt": "2024-01-10T14:30:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalItems": 2,
      "itemsPerPage": 20
    }
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

### Get User by ID

```
GET /api/users/:id
```

**Access:** Private (super-admin only)

**Description:** Get details of a specific user.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "email": "newsmanager@roadsauthority.na",
    "role": "admin",
    "permissions": ["news:manage"],
    "createdAt": "2024-01-10T14:30:00.000Z",
    "updatedAt": "2024-01-10T14:30:00.000Z"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

### Update User

```
PUT /api/users/:id
```

**Access:** Private (super-admin only)

**Description:** Update user details, role, or permissions.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**

```json
{
  "email": "updated@roadsauthority.na",
  "role": "admin",
  "permissions": ["news:manage", "banners:manage", "locations:manage"]
}
```

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "email": "updated@roadsauthority.na",
    "role": "admin",
    "permissions": ["news:manage", "banners:manage", "locations:manage"],
    "createdAt": "2024-01-10T14:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  },
  "message": "User updated successfully",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

### Delete User

```
DELETE /api/users/:id
```

**Access:** Private (super-admin only)

**Description:** Delete an admin user.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "User deleted successfully",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

### Assign Permissions

```
POST /api/users/:id/permissions
```

**Access:** Private (super-admin only)

**Description:** Assign specific permissions to a user.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**

```json
{
  "permissions": ["news:manage", "vacancies:manage", "tenders:manage"]
}
```

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439012",
    "email": "admin@roadsauthority.na",
    "role": "admin",
    "permissions": ["news:manage", "vacancies:manage", "tenders:manage"],
    "updatedAt": "2024-01-15T10:30:00.000Z"
  },
  "message": "Permissions assigned successfully",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

## Documents Endpoints

**Note:** All document endpoints require `documents:upload` permission.

### Upload Document

```
POST /api/documents
```

**Access:** Private (requires `documents:upload` permission)

**Description:** Upload a PDF document and trigger RAG indexing.

**Headers:**
```
Authorization: Bearer <access_token>
Content-Type: multipart/form-data
```

**Request Body (multipart/form-data):**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `file` | File | Yes | PDF file (max 10MB) |
| `title` | string | Yes | Document title |
| `description` | string | No | Document description |
| `category` | string | Yes | One of: policy, tender, report, other |

**Example Request:**
```
POST /api/documents
Content-Type: multipart/form-data

file: [PDF file]
title: "Road Safety Policy 2024"
description: "Updated road safety guidelines"
category: "policy"
```

**Success Response (201):**

```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439013",
    "title": "Road Safety Policy 2024",
    "description": "Updated road safety guidelines",
    "fileUrl": "https://cloudinary.com/documents/road-safety-2024.pdf",
    "fileType": "application/pdf",
    "fileSize": 2048576,
    "category": "policy",
    "indexed": false,
    "uploadedBy": "507f1f77bcf86cd799439011",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  },
  "message": "Document uploaded successfully. Indexing in progress.",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

**Error Response (400):**

```json
{
  "success": false,
  "error": {
    "code": "UPLOAD_002",
    "message": "Invalid file type",
    "details": "Only PDF files are allowed"
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

---

### List Documents

```
GET /api/documents
```

**Access:** Private (requires `documents:upload` permission)

**Description:** List all documents with pagination and filtering.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 10 | Items per page (max: 100) |
| `category` | string | - | Filter by category (policy, tender, report, other) |
| `indexed` | boolean | - | Filter by indexed status |
| `search` | string | - | Search in title and description |

**Example Request:**
```
GET /api/documents?page=1&limit=20&category=policy&indexed=true&search=safety
```

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "documents": [
      {
        "_id": "507f1f77bcf86cd799439013",
        "title": "Road Safety Policy 2024",
        "description": "Updated road safety guidelines",
        "fileUrl": "https://cloudinary.com/documents/road-safety-2024.pdf",
        "fileType": "application/pdf",
        "fileSize": 2048576,
        "category": "policy",
        "indexed": true,
        "uploadedBy": {
          "_id": "507f1f77bcf86cd799439011",
          "email": "admin@roadsauthority.na"
        },
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-15T10:35:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalItems": 1,
      "itemsPerPage": 20
    }
  },
  "timestamp": "2024-01-15T10:40:00.000Z"
}
```

---

### Get Document by ID

```
GET /api/documents/:id
```

**Access:** Private (requires `documents:upload` permission)

**Description:** Get details of a specific document.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439013",
    "title": "Road Safety Policy 2024",
    "description": "Updated road safety guidelines",
    "fileUrl": "https://cloudinary.com/documents/road-safety-2024.pdf",
    "fileType": "application/pdf",
    "fileSize": 2048576,
    "category": "policy",
    "indexed": true,
    "uploadedBy": {
      "_id": "507f1f77bcf86cd799439011",
      "email": "admin@roadsauthority.na"
    },
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:35:00.000Z"
  },
  "timestamp": "2024-01-15T10:40:00.000Z"
}
```

---

### Delete Document

```
DELETE /api/documents/:id
```

**Access:** Private (requires `documents:upload` permission)

**Description:** Delete a document and remove it from the RAG index.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Document deleted successfully",
  "timestamp": "2024-01-15T10:40:00.000Z"
}
```

---

## News Endpoints

### Create News Article

```
POST /api/news
```

**Access:** Private (requires `news:manage` permission)

**Description:** Create a new news article.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**

```json
{
  "title": "New Highway Construction Project Announced",
  "content": "The Roads Authority has announced a major highway construction project...",
  "excerpt": "Major highway project to improve connectivity",
  "category": "Infrastructure",
  "author": "John Doe",
  "imageUrl": "https://cloudinary.com/images/highway-project.jpg",
  "published": true
}
```

**Success Response (201):**

```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439014",
    "title": "New Highway Construction Project Announced",
    "content": "The Roads Authority has announced a major highway construction project...",
    "excerpt": "Major highway project to improve connectivity",
    "category": "Infrastructure",
    "author": "John Doe",
    "imageUrl": "https://cloudinary.com/images/highway-project.jpg",
    "published": true,
    "publishedAt": "2024-01-15T10:40:00.000Z",
    "createdAt": "2024-01-15T10:40:00.000Z",
    "updatedAt": "2024-01-15T10:40:00.000Z"
  },
  "message": "News article created successfully",
  "timestamp": "2024-01-15T10:40:00.000Z"
}
```

---

### List News Articles

```
GET /api/news
```

**Access:** Public (mobile app users can view published news)

**Description:** List news articles with pagination, filtering, and search.

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 10 | Items per page (max: 100) |
| `category` | string | - | Filter by category |
| `published` | boolean | - | Filter by published status |
| `search` | string | - | Search in title, content, and excerpt |

**Example Request:**
```
GET /api/news?page=1&limit=20&category=Infrastructure&published=true&search=highway
```

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "news": [
      {
        "_id": "507f1f77bcf86cd799439014",
        "title": "New Highway Construction Project Announced",
        "content": "The Roads Authority has announced a major highway construction project...",
        "excerpt": "Major highway project to improve connectivity",
        "category": "Infrastructure",
        "author": "John Doe",
        "imageUrl": "https://cloudinary.com/images/highway-project.jpg",
        "published": true,
        "publishedAt": "2024-01-15T10:40:00.000Z",
        "createdAt": "2024-01-15T10:40:00.000Z",
        "updatedAt": "2024-01-15T10:40:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalItems": 1,
      "itemsPerPage": 20
    }
  },
  "timestamp": "2024-01-15T10:45:00.000Z"
}
```

---

### Get News Article by ID

```
GET /api/news/:id
```

**Access:** Public

**Description:** Get details of a specific news article.

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439014",
    "title": "New Highway Construction Project Announced",
    "content": "The Roads Authority has announced a major highway construction project...",
    "excerpt": "Major highway project to improve connectivity",
    "category": "Infrastructure",
    "author": "John Doe",
    "imageUrl": "https://cloudinary.com/images/highway-project.jpg",
    "published": true,
    "publishedAt": "2024-01-15T10:40:00.000Z",
    "createdAt": "2024-01-15T10:40:00.000Z",
    "updatedAt": "2024-01-15T10:40:00.000Z"
  },
  "timestamp": "2024-01-15T10:45:00.000Z"
}
```

---

### Update News Article

```
PUT /api/news/:id
```

**Access:** Private (requires `news:manage` permission)

**Description:** Update a news article.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**

```json
{
  "title": "Updated Highway Construction Project",
  "content": "Updated content...",
  "published": true
}
```

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439014",
    "title": "Updated Highway Construction Project",
    "content": "Updated content...",
    "excerpt": "Major highway project to improve connectivity",
    "category": "Infrastructure",
    "author": "John Doe",
    "imageUrl": "https://cloudinary.com/images/highway-project.jpg",
    "published": true,
    "publishedAt": "2024-01-15T10:40:00.000Z",
    "createdAt": "2024-01-15T10:40:00.000Z",
    "updatedAt": "2024-01-15T11:00:00.000Z"
  },
  "message": "News article updated successfully",
  "timestamp": "2024-01-15T11:00:00.000Z"
}
```

---

### Delete News Article

```
DELETE /api/news/:id
```

**Access:** Private (requires `news:manage` permission)

**Description:** Delete a news article.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "News article deleted successfully",
  "timestamp": "2024-01-15T11:00:00.000Z"
}
```

---

## Vacancies Endpoints

### Create Vacancy

```
POST /api/vacancies
```

**Access:** Private (requires `vacancies:manage` permission)

**Description:** Create a new job vacancy.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**

```json
{
  "title": "Senior Civil Engineer",
  "type": "full-time",
  "department": "Engineering",
  "location": "Windhoek",
  "description": "We are seeking an experienced civil engineer...",
  "requirements": [
    "Bachelor's degree in Civil Engineering",
    "5+ years of experience",
    "Professional registration with ECN"
  ],
  "responsibilities": [
    "Design and oversee road construction projects",
    "Manage project teams",
    "Ensure compliance with safety standards"
  ],
  "salary": "N$50,000 - N$70,000 per month",
  "closingDate": "2024-02-28T23:59:59.000Z",
  "pdfUrl": "https://cloudinary.com/documents/engineer-application-form.pdf",
  "published": true
}
```

**Success Response (201):**

```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439015",
    "title": "Senior Civil Engineer",
    "type": "full-time",
    "department": "Engineering",
    "location": "Windhoek",
    "description": "We are seeking an experienced civil engineer...",
    "requirements": [
      "Bachelor's degree in Civil Engineering",
      "5+ years of experience",
      "Professional registration with ECN"
    ],
    "responsibilities": [
      "Design and oversee road construction projects",
      "Manage project teams",
      "Ensure compliance with safety standards"
    ],
    "salary": "N$50,000 - N$70,000 per month",
    "closingDate": "2024-02-28T23:59:59.000Z",
    "pdfUrl": "https://cloudinary.com/documents/engineer-application-form.pdf",
    "published": true,
    "createdAt": "2024-01-15T11:00:00.000Z",
    "updatedAt": "2024-01-15T11:00:00.000Z"
  },
  "message": "Vacancy created successfully",
  "timestamp": "2024-01-15T11:00:00.000Z"
}
```

---

### List Vacancies

```
GET /api/vacancies
```

**Access:** Public

**Description:** List vacancies with pagination, filtering, and search.

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 10 | Items per page (max: 100) |
| `type` | string | - | Filter by type (full-time, part-time, bursary, internship) |
| `department` | string | - | Filter by department |
| `location` | string | - | Filter by location |
| `published` | boolean | - | Filter by published status |
| `search` | string | - | Search in title and description |

**Example Request:**
```
GET /api/vacancies?page=1&limit=20&type=full-time&location=Windhoek&published=true
```

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "vacancies": [
      {
        "_id": "507f1f77bcf86cd799439015",
        "title": "Senior Civil Engineer",
        "type": "full-time",
        "department": "Engineering",
        "location": "Windhoek",
        "description": "We are seeking an experienced civil engineer...",
        "requirements": ["Bachelor's degree in Civil Engineering", "5+ years of experience"],
        "responsibilities": ["Design and oversee road construction projects"],
        "salary": "N$50,000 - N$70,000 per month",
        "closingDate": "2024-02-28T23:59:59.000Z",
        "pdfUrl": "https://cloudinary.com/documents/engineer-application-form.pdf",
        "published": true,
        "createdAt": "2024-01-15T11:00:00.000Z",
        "updatedAt": "2024-01-15T11:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalItems": 1,
      "itemsPerPage": 20
    }
  },
  "timestamp": "2024-01-15T11:05:00.000Z"
}
```

---

### Get Vacancy by ID

```
GET /api/vacancies/:id
```

**Access:** Public

**Description:** Get details of a specific vacancy.

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439015",
    "title": "Senior Civil Engineer",
    "type": "full-time",
    "department": "Engineering",
    "location": "Windhoek",
    "description": "We are seeking an experienced civil engineer...",
    "requirements": ["Bachelor's degree in Civil Engineering", "5+ years of experience"],
    "responsibilities": ["Design and oversee road construction projects"],
    "salary": "N$50,000 - N$70,000 per month",
    "closingDate": "2024-02-28T23:59:59.000Z",
    "pdfUrl": "https://cloudinary.com/documents/engineer-application-form.pdf",
    "published": true,
    "createdAt": "2024-01-15T11:00:00.000Z",
    "updatedAt": "2024-01-15T11:00:00.000Z"
  },
  "timestamp": "2024-01-15T11:05:00.000Z"
}
```

---

### Update Vacancy

```
PUT /api/vacancies/:id
```

**Access:** Private (requires `vacancies:manage` permission)

**Description:** Update a vacancy.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**

```json
{
  "title": "Senior Civil Engineer (Updated)",
  "salary": "N$55,000 - N$75,000 per month",
  "published": true
}
```

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439015",
    "title": "Senior Civil Engineer (Updated)",
    "type": "full-time",
    "department": "Engineering",
    "location": "Windhoek",
    "description": "We are seeking an experienced civil engineer...",
    "requirements": ["Bachelor's degree in Civil Engineering"],
    "responsibilities": ["Design and oversee road construction projects"],
    "salary": "N$55,000 - N$75,000 per month",
    "closingDate": "2024-02-28T23:59:59.000Z",
    "pdfUrl": "https://cloudinary.com/documents/engineer-application-form.pdf",
    "published": true,
    "createdAt": "2024-01-15T11:00:00.000Z",
    "updatedAt": "2024-01-15T11:10:00.000Z"
  },
  "message": "Vacancy updated successfully",
  "timestamp": "2024-01-15T11:10:00.000Z"
}
```

---

### Delete Vacancy

```
DELETE /api/vacancies/:id
```

**Access:** Private (requires `vacancies:manage` permission)

**Description:** Delete a vacancy.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Vacancy deleted successfully",
  "timestamp": "2024-01-15T11:10:00.000Z"
}
```

---

## Tenders Endpoints

### Create Tender

```
POST /api/tenders
```

**Access:** Private (requires `tenders:manage` permission)

**Description:** Create a new tender.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**

```json
{
  "referenceNumber": "RA/T/2024/001",
  "title": "Construction of B1 Highway Extension",
  "description": "Tender for the construction of 50km highway extension...",
  "category": "Construction",
  "value": 150000000,
  "status": "open",
  "openingDate": "2024-01-20T09:00:00.000Z",
  "closingDate": "2024-03-15T17:00:00.000Z",
  "pdfUrl": "https://cloudinary.com/documents/tender-ra-t-2024-001.pdf",
  "published": true
}
```

**Success Response (201):**

```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439016",
    "referenceNumber": "RA/T/2024/001",
    "title": "Construction of B1 Highway Extension",
    "description": "Tender for the construction of 50km highway extension...",
    "category": "Construction",
    "value": 150000000,
    "status": "open",
    "openingDate": "2024-01-20T09:00:00.000Z",
    "closingDate": "2024-03-15T17:00:00.000Z",
    "pdfUrl": "https://cloudinary.com/documents/tender-ra-t-2024-001.pdf",
    "published": true,
    "createdAt": "2024-01-15T11:10:00.000Z",
    "updatedAt": "2024-01-15T11:10:00.000Z"
  },
  "message": "Tender created successfully",
  "timestamp": "2024-01-15T11:10:00.000Z"
}
```

---

### List Tenders

```
GET /api/tenders
```

**Access:** Public

**Description:** List tenders with pagination, filtering, and search.

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number |
| `limit` | number | 10 | Items per page (max: 100) |
| `status` | string | - | Filter by status (open, closed, upcoming) |
| `category` | string | - | Filter by category |
| `published` | boolean | - | Filter by published status |
| `search` | string | - | Search in title and description |

**Example Request:**
```
GET /api/tenders?page=1&limit=20&status=open&category=Construction&published=true
```

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "tenders": [
      {
        "_id": "507f1f77bcf86cd799439016",
        "referenceNumber": "RA/T/2024/001",
        "title": "Construction of B1 Highway Extension",
        "description": "Tender for the construction of 50km highway extension...",
        "category": "Construction",
        "value": 150000000,
        "status": "open",
        "openingDate": "2024-01-20T09:00:00.000Z",
        "closingDate": "2024-03-15T17:00:00.000Z",
        "pdfUrl": "https://cloudinary.com/documents/tender-ra-t-2024-001.pdf",
        "published": true,
        "createdAt": "2024-01-15T11:10:00.000Z",
        "updatedAt": "2024-01-15T11:10:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalItems": 1,
      "itemsPerPage": 20
    }
  },
  "timestamp": "2024-01-15T11:15:00.000Z"
}
```

---

### Get Tender by ID

```
GET /api/tenders/:id
```

**Access:** Public

**Description:** Get details of a specific tender.

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439016",
    "referenceNumber": "RA/T/2024/001",
    "title": "Construction of B1 Highway Extension",
    "description": "Tender for the construction of 50km highway extension...",
    "category": "Construction",
    "value": 150000000,
    "status": "open",
    "openingDate": "2024-01-20T09:00:00.000Z",
    "closingDate": "2024-03-15T17:00:00.000Z",
    "pdfUrl": "https://cloudinary.com/documents/tender-ra-t-2024-001.pdf",
    "published": true,
    "createdAt": "2024-01-15T11:10:00.000Z",
    "updatedAt": "2024-01-15T11:10:00.000Z"
  },
  "timestamp": "2024-01-15T11:15:00.000Z"
}
```

---

### Update Tender

```
PUT /api/tenders/:id
```

**Access:** Private (requires `tenders:manage` permission)

**Description:** Update a tender.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**

```json
{
  "status": "closed",
  "closingDate": "2024-03-10T17:00:00.000Z"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439016",
    "referenceNumber": "RA/T/2024/001",
    "title": "Construction of B1 Highway Extension",
    "description": "Tender for the construction of 50km highway extension...",
    "category": "Construction",
    "value": 150000000,
    "status": "closed",
    "openingDate": "2024-01-20T09:00:00.000Z",
    "closingDate": "2024-03-10T17:00:00.000Z",
    "pdfUrl": "https://cloudinary.com/documents/tender-ra-t-2024-001.pdf",
    "published": true,
    "createdAt": "2024-01-15T11:10:00.000Z",
    "updatedAt": "2024-01-15T11:20:00.000Z"
  },
  "message": "Tender updated successfully",
  "timestamp": "2024-01-15T11:20:00.000Z"
}
```

---

### Delete Tender

```
DELETE /api/tenders/:id
```

**Access:** Private (requires `tenders:manage` permission)

**Description:** Delete a tender.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Tender deleted successfully",
  "timestamp": "2024-01-15T11:20:00.000Z"
}
```

---

## Banners Endpoints

### Create Banner

```
POST /api/banners
```

**Access:** Private (requires `banners:manage` permission)

**Description:** Create a new banner for the mobile app homepage.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**

```json
{
  "title": "Road Safety Campaign 2024",
  "description": "Join our road safety awareness campaign",
  "imageUrl": "https://cloudinary.com/images/safety-campaign-banner.jpg",
  "linkUrl": "https://roadsauthority.na/safety-campaign",
  "order": 1,
  "active": true
}
```

**Success Response (201):**

```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439017",
    "title": "Road Safety Campaign 2024",
    "description": "Join our road safety awareness campaign",
    "imageUrl": "https://cloudinary.com/images/safety-campaign-banner.jpg",
    "linkUrl": "https://roadsauthority.na/safety-campaign",
    "order": 1,
    "active": true,
    "createdAt": "2024-01-15T11:20:00.000Z",
    "updatedAt": "2024-01-15T11:20:00.000Z"
  },
  "message": "Banner created successfully",
  "timestamp": "2024-01-15T11:20:00.000Z"
}
```

---

### List Banners

```
GET /api/banners
```

**Access:** Public (returns only active banners for unauthenticated requests)

**Description:** List banners. Returns only active banners for public access, all banners for authenticated admins.

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `active` | boolean | - | Filter by active status (admin only) |

**Example Request:**
```
GET /api/banners
```

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "banners": [
      {
        "_id": "507f1f77bcf86cd799439017",
        "title": "Road Safety Campaign 2024",
        "description": "Join our road safety awareness campaign",
        "imageUrl": "https://cloudinary.com/images/safety-campaign-banner.jpg",
        "linkUrl": "https://roadsauthority.na/safety-campaign",
        "order": 1,
        "active": true,
        "createdAt": "2024-01-15T11:20:00.000Z",
        "updatedAt": "2024-01-15T11:20:00.000Z"
      }
    ]
  },
  "timestamp": "2024-01-15T11:25:00.000Z"
}
```

---

### Get Banner by ID

```
GET /api/banners/:id
```

**Access:** Public

**Description:** Get details of a specific banner.

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439017",
    "title": "Road Safety Campaign 2024",
    "description": "Join our road safety awareness campaign",
    "imageUrl": "https://cloudinary.com/images/safety-campaign-banner.jpg",
    "linkUrl": "https://roadsauthority.na/safety-campaign",
    "order": 1,
    "active": true,
    "createdAt": "2024-01-15T11:20:00.000Z",
    "updatedAt": "2024-01-15T11:20:00.000Z"
  },
  "timestamp": "2024-01-15T11:25:00.000Z"
}
```

---

### Update Banner

```
PUT /api/banners/:id
```

**Access:** Private (requires `banners:manage` permission)

**Description:** Update a banner.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**

```json
{
  "title": "Road Safety Campaign 2024 - Extended",
  "active": false,
  "order": 2
}
```

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439017",
    "title": "Road Safety Campaign 2024 - Extended",
    "description": "Join our road safety awareness campaign",
    "imageUrl": "https://cloudinary.com/images/safety-campaign-banner.jpg",
    "linkUrl": "https://roadsauthority.na/safety-campaign",
    "order": 2,
    "active": false,
    "createdAt": "2024-01-15T11:20:00.000Z",
    "updatedAt": "2024-01-15T11:30:00.000Z"
  },
  "message": "Banner updated successfully",
  "timestamp": "2024-01-15T11:30:00.000Z"
}
```

---

### Delete Banner

```
DELETE /api/banners/:id
```

**Access:** Private (requires `banners:manage` permission)

**Description:** Delete a banner.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Banner deleted successfully",
  "timestamp": "2024-01-15T11:30:00.000Z"
}
```

---

## Locations Endpoints

### Create Location

```
POST /api/locations
```

**Access:** Private (requires `locations:manage` permission)

**Description:** Create a new office location.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**

```json
{
  "name": "Roads Authority Head Office",
  "address": "123 Independence Avenue, Windhoek",
  "region": "Khomas",
  "coordinates": {
    "latitude": -22.5609,
    "longitude": 17.0658
  },
  "contactNumber": "+264 61 284 7000",
  "email": "info@roadsauthority.na"
}
```

**Success Response (201):**

```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439018",
    "name": "Roads Authority Head Office",
    "address": "123 Independence Avenue, Windhoek",
    "region": "Khomas",
    "coordinates": {
      "latitude": -22.5609,
      "longitude": 17.0658
    },
    "contactNumber": "+264 61 284 7000",
    "email": "info@roadsauthority.na",
    "createdAt": "2024-01-15T11:30:00.000Z",
    "updatedAt": "2024-01-15T11:30:00.000Z"
  },
  "message": "Location created successfully",
  "timestamp": "2024-01-15T11:30:00.000Z"
}
```

---

### List Locations

```
GET /api/locations
```

**Access:** Public

**Description:** List all office locations with optional region filtering.

**Query Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `region` | string | - | Filter by region |

**Example Request:**
```
GET /api/locations?region=Khomas
```

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "locations": [
      {
        "_id": "507f1f77bcf86cd799439018",
        "name": "Roads Authority Head Office",
        "address": "123 Independence Avenue, Windhoek",
        "region": "Khomas",
        "coordinates": {
          "latitude": -22.5609,
          "longitude": 17.0658
        },
        "contactNumber": "+264 61 284 7000",
        "email": "info@roadsauthority.na",
        "createdAt": "2024-01-15T11:30:00.000Z",
        "updatedAt": "2024-01-15T11:30:00.000Z"
      }
    ]
  },
  "timestamp": "2024-01-15T11:35:00.000Z"
}
```

---

### Get Location by ID

```
GET /api/locations/:id
```

**Access:** Public

**Description:** Get details of a specific location.

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439018",
    "name": "Roads Authority Head Office",
    "address": "123 Independence Avenue, Windhoek",
    "region": "Khomas",
    "coordinates": {
      "latitude": -22.5609,
      "longitude": 17.0658
    },
    "contactNumber": "+264 61 284 7000",
    "email": "info@roadsauthority.na",
    "createdAt": "2024-01-15T11:30:00.000Z",
    "updatedAt": "2024-01-15T11:30:00.000Z"
  },
  "timestamp": "2024-01-15T11:35:00.000Z"
}
```

---

### Update Location

```
PUT /api/locations/:id
```

**Access:** Private (requires `locations:manage` permission)

**Description:** Update a location.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Request Body:**

```json
{
  "contactNumber": "+264 61 284 7001",
  "email": "headoffice@roadsauthority.na"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "_id": "507f1f77bcf86cd799439018",
    "name": "Roads Authority Head Office",
    "address": "123 Independence Avenue, Windhoek",
    "region": "Khomas",
    "coordinates": {
      "latitude": -22.5609,
      "longitude": 17.0658
    },
    "contactNumber": "+264 61 284 7001",
    "email": "headoffice@roadsauthority.na",
    "createdAt": "2024-01-15T11:30:00.000Z",
    "updatedAt": "2024-01-15T11:40:00.000Z"
  },
  "message": "Location updated successfully",
  "timestamp": "2024-01-15T11:40:00.000Z"
}
```

---

### Delete Location

```
DELETE /api/locations/:id
```

**Access:** Private (requires `locations:manage` permission)

**Description:** Delete a location.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Location deleted successfully",
  "timestamp": "2024-01-15T11:40:00.000Z"
}
```

---

## Chatbot Endpoints

### Query Chatbot

```
POST /api/chatbot/query
```

**Access:** Public (no authentication required for mobile users)

**Description:** Send a question to the AI chatbot and receive an answer based on indexed documents.

**Request Body:**

```json
{
  "question": "What are the requirements for a driver's license?",
  "sessionId": "optional-session-id-for-tracking"
}
```

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "answer": "According to the Road Safety Policy, the requirements for a driver's license include: 1) Being at least 18 years old, 2) Passing a written test on traffic rules, 3) Completing a practical driving test, 4) Providing proof of identity and residence, and 5) Passing a medical examination.",
    "sources": [
      {
        "documentId": "507f1f77bcf86cd799439013",
        "title": "Road Safety Policy 2024",
        "relevance": 0.92
      }
    ],
    "confidence": 0.89,
    "timestamp": "2024-01-15T11:45:00.000Z"
  },
  "timestamp": "2024-01-15T11:45:00.000Z"
}
```

**Error Response (503):**

```json
{
  "success": false,
  "error": {
    "code": "RAG_001",
    "message": "RAG service is unavailable",
    "details": "Unable to connect to the RAG service. Please try again later."
  },
  "timestamp": "2024-01-15T11:45:00.000Z"
}
```

---

### Check Chatbot Health

```
GET /api/chatbot/health
```

**Access:** Public

**Description:** Check the health status of the chatbot service.

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "ragServiceConnected": true,
    "indexedDocuments": 15
  },
  "timestamp": "2024-01-15T11:45:00.000Z"
}
```

---

## RAG Service Endpoints

The RAG (Retrieval-Augmented Generation) service is a separate Python FastAPI microservice that handles document indexing and query processing. It is typically accessed internally by the backend API, but the endpoints are documented here for reference.

**Base URL:** `http://localhost:8000` (development)

### Index Document

```
POST /index
```

**Access:** Internal (called by backend API)

**Description:** Download, process, and index a PDF document for chatbot queries.

**Request Body:**

```json
{
  "document_url": "https://cloudinary.com/documents/road-safety-2024.pdf",
  "document_id": "507f1f77bcf86cd799439013",
  "title": "Road Safety Policy 2024"
}
```

**Success Response (200):**

```json
{
  "status": "success",
  "document_id": "507f1f77bcf86cd799439013",
  "chunks_indexed": 42,
  "processing_time_seconds": 8.5,
  "message": "Document indexed successfully"
}
```

**Error Response (400):**

```json
{
  "status": "error",
  "error": "Failed to download PDF",
  "details": "The provided URL is not accessible"
}
```

**Error Response (500):**

```json
{
  "status": "error",
  "error": "Indexing failed",
  "details": "Failed to extract text from PDF"
}
```

---

### Query RAG System

```
POST /query
```

**Access:** Internal (called by backend API)

**Description:** Process a user question and generate an AI-powered answer using indexed documents.

**Request Body:**

```json
{
  "question": "What are the requirements for a driver's license?",
  "top_k": 5
}
```

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `question` | string | required | User's question |
| `top_k` | number | 5 | Number of relevant chunks to retrieve |

**Success Response (200):**

```json
{
  "answer": "According to the Road Safety Policy, the requirements for a driver's license include: 1) Being at least 18 years old, 2) Passing a written test on traffic rules, 3) Completing a practical driving test, 4) Providing proof of identity and residence, and 5) Passing a medical examination.",
  "sources": [
    {
      "document_id": "507f1f77bcf86cd799439013",
      "document_title": "Road Safety Policy 2024",
      "chunk_index": 5,
      "relevance_score": 0.92
    },
    {
      "document_id": "507f1f77bcf86cd799439013",
      "document_title": "Road Safety Policy 2024",
      "chunk_index": 6,
      "relevance_score": 0.87
    }
  ],
  "confidence": 0.89,
  "processing_time_seconds": 2.3
}
```

**Error Response (500):**

```json
{
  "status": "error",
  "error": "Query processing failed",
  "details": "Ollama service is not responding"
}
```

---

### Check RAG Service Health

```
GET /health
```

**Access:** Public

**Description:** Check the health status of the RAG service and its dependencies.

**Success Response (200):**

```json
{
  "status": "healthy",
  "ollama_connected": true,
  "chromadb_connected": true,
  "indexed_documents": 15,
  "total_chunks": 630,
  "models": {
    "embedding": "nomic-embed-text:latest",
    "llm": "llama3.2:1b"
  }
}
```

**Error Response (503):**

```json
{
  "status": "unhealthy",
  "ollama_connected": false,
  "chromadb_connected": true,
  "error": "Ollama service is not responding"
}
```

---

## Data Models

### User

```typescript
{
  _id: string;
  email: string;
  password: string; // bcrypt hashed, not returned in responses
  role: "super-admin" | "admin";
  permissions: string[];
  createdAt: Date;
  updatedAt: Date;
}
```

### Document

```typescript
{
  _id: string;
  title: string;
  description: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  category: "policy" | "tender" | "report" | "other";
  indexed: boolean;
  uploadedBy: string; // User ID
  createdAt: Date;
  updatedAt: Date;
}
```

### News

```typescript
{
  _id: string;
  title: string;
  content: string;
  excerpt: string;
  category: string;
  author: string;
  imageUrl?: string;
  published: boolean;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

### Vacancy

```typescript
{
  _id: string;
  title: string;
  type: "full-time" | "part-time" | "bursary" | "internship";
  department: string;
  location: string;
  description: string;
  requirements: string[];
  responsibilities: string[];
  salary?: string;
  closingDate: Date;
  pdfUrl?: string;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Tender

```typescript
{
  _id: string;
  referenceNumber: string;
  title: string;
  description: string;
  category: string;
  value?: number;
  status: "open" | "closed" | "upcoming";
  openingDate: Date;
  closingDate: Date;
  pdfUrl: string;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Banner

```typescript
{
  _id: string;
  title: string;
  description?: string;
  imageUrl: string;
  linkUrl?: string;
  order: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Location

```typescript
{
  _id: string;
  name: string;
  address: string;
  region: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  contactNumber?: string;
  email?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

---

## Common Patterns

### Pagination

Most list endpoints support pagination with the following query parameters:

- `page` (number, default: 1) - Page number
- `limit` (number, default: 10, max: 100) - Items per page

Pagination response format:

```json
{
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalItems": 47,
    "itemsPerPage": 10
  }
}
```

### Filtering

Many endpoints support filtering by specific fields. Filters are passed as query parameters:

```
GET /api/news?category=Infrastructure&published=true
GET /api/vacancies?type=full-time&location=Windhoek
GET /api/tenders?status=open
```

### Search

Search functionality is available on most content endpoints using the `search` query parameter:

```
GET /api/news?search=highway
GET /api/vacancies?search=engineer
GET /api/tenders?search=construction
```

The search typically covers title, description, and content fields.

### File Uploads

File upload endpoints use `multipart/form-data` encoding. Maximum file sizes:

- PDF documents: 10MB
- Images: 5MB

Supported file types:
- Documents: PDF only
- Images: JPEG, PNG, WebP

---

## Rate Limiting

**Note:** Rate limiting is not currently implemented but is recommended for production deployment.

Suggested limits:
- Public endpoints: 100 requests per 15 minutes per IP
- Authenticated endpoints: 1000 requests per 15 minutes per user
- File upload endpoints: 10 uploads per hour per user

---

## CORS Configuration

The API supports Cross-Origin Resource Sharing (CORS) for the following origins:

- Admin Dashboard: `http://localhost:3000` (development)
- Mobile App: All origins (for development)

Production CORS configuration should be restricted to specific domains.

---

## Environment Variables

The backend API requires the following environment variables:

```env
# Server
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb://localhost:27017/roads-authority
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-secret-key
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# Cloudinary (optional, for file storage)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# RAG Service
RAG_SERVICE_URL=http://localhost:8000

# CORS
CORS_ORIGIN=http://localhost:3000
```

---

## Support and Contact

For API support or questions, please contact:

- Email: dev@roadsauthority.na
- Documentation: https://docs.roadsauthority.na
- GitHub: https://github.com/roadsauthority/api

---

**Last Updated:** January 15, 2024  
**API Version:** 1.0.0
