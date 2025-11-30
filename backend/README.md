# Roads Authority Backend API

Node.js + Express + TypeScript backend API for the Roads Authority Namibia application.

## Project Structure

```
backend/
├── src/
│   ├── config/           # Configuration modules
│   │   ├── env.ts        # Environment variables
│   │   ├── db.ts         # MongoDB connection
│   │   ├── redis.ts      # Redis client
│   │   └── cloudinary.ts # Cloudinary configuration
│   ├── middlewares/      # Express middlewares
│   │   ├── auth.ts       # JWT authentication
│   │   ├── roleGuard.ts  # Permission-based access control
│   │   ├── upload.ts     # File upload (Multer)
│   │   └── errorHandler.ts # Global error handling
│   ├── modules/          # Feature modules (to be implemented)
│   ├── utils/            # Utility functions
│   │   ├── logger.ts     # Winston logging
│   │   ├── validators.ts # Input validation helpers
│   │   └── httpClient.ts # HTTP client for RAG service
│   └── constants/        # Constants and enums
│       ├── roles.ts      # Role and permission definitions
│       └── errors.ts     # Error codes
├── package.json
├── tsconfig.json
└── .env.example
```

## Setup

1. Install dependencies:
```bash
npm install
```

2. Copy `.env.example` to `.env` and configure:
```bash
cp .env.example .env
```

3. Update environment variables in `.env`:
   - MongoDB connection string
   - Redis configuration
   - JWT secret
   - Cloudinary credentials
   - RAG service URL

## Development

Run in development mode with hot reload:
```bash
npm run dev
```

## Build

Compile TypeScript to JavaScript:
```bash
npm run build
```

## Production

Run compiled JavaScript:
```bash
npm start
```

## Testing

Run tests:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

## Features Implemented

### Configuration
- ✅ Environment variable management
- ✅ MongoDB connection with error handling
- ✅ Redis client initialization
- ✅ Cloudinary SDK configuration

### Middleware
- ✅ JWT token verification
- ✅ Role-based access control (RBAC)
- ✅ File upload handling (images and PDFs)
- ✅ Global error handler

### Utilities
- ✅ Winston logger with file and console transports
- ✅ Joi validation helpers
- ✅ HTTP client for RAG service integration

### Constants
- ✅ Role definitions (super-admin, admin)
- ✅ Permission definitions (news:manage, tenders:manage, etc.)
- ✅ Error codes and messages

## Next Steps

The following modules need to be implemented:
- Authentication module (login, token refresh, logout)
- Documents module (PDF upload and RAG indexing)
- News module (CRUD operations)
- Vacancies module (CRUD operations)
- Tenders module (CRUD operations)
- Banners module (CRUD operations)
- Locations module (CRUD operations)
- Chatbot module (RAG query forwarding)
- User management module (super-admin only)
