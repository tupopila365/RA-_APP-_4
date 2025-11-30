# Roads Authority Namibia - Full Stack Monorepo

A comprehensive full-stack application for Roads Authority Namibia, featuring a Node.js backend API, React admin dashboard, React Native mobile app, and Python RAG microservice for AI-powered chatbot functionality.

## 🏗️ Architecture Overview

This monorepo contains four interconnected projects:

- **backend/** - Node.js + Express + TypeScript REST API
- **admin/** - React + TypeScript admin dashboard
- **app/** - React Native + TypeScript mobile application
- **rag-service/** - Python + FastAPI RAG microservice with Ollama

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

### Required for All Projects
- **Git** - Version control
- **Docker & Docker Compose** - For local development orchestration

### Backend & Admin Dashboard
- **Node.js** - v18.x or higher
- **npm** or **yarn** - Package manager
- **MongoDB** - v6.x or higher (or use Docker)
- **Redis** - v7.x or higher (or use Docker)

### Mobile App
- **Node.js** - v18.x or higher
- **React Native CLI** or **Expo CLI**
- **Android Studio** (for Android development)
- **Xcode** (for iOS development, macOS only)

### RAG Service
- **Python** - v3.10 or higher
- **pip** - Python package manager
- **Ollama** - Local LLM runtime ([Installation Guide](https://ollama.ai))

## 🚀 Quick Start with Docker

The easiest way to run all services locally is using Docker Compose:

```bash
# Clone the repository
git clone <repository-url>
cd roads-authority-monorepo

# Copy environment files
cp .env.example .env
cp backend/.env.example backend/.env
cp admin/.env.example admin/.env
cp rag-service/.env.example rag-service/.env

# Edit .env files with your configuration

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f
```

### Service URLs (Docker)
- Backend API: http://localhost:3000
- Admin Dashboard: http://localhost:5173
- RAG Service: http://localhost:8000
- MongoDB: localhost:27017
- Redis: localhost:6379

## 📦 Manual Setup

### 1. Backend API Setup

```bash
cd backend

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your configuration
# Required: MONGODB_URI, REDIS_URL, JWT_SECRET, CLOUDINARY_*

# Run database migrations (if any)
npm run migrate

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build

# Start production server
npm start
```

**Backend runs on:** http://localhost:3000

### 2. Admin Dashboard Setup

```bash
cd admin

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with backend API URL
# VITE_API_BASE_URL=http://localhost:3000

# Start development server
npm run dev

# Run tests
npm test

# Build for production
npm run build

# Preview production build
npm run preview
```

**Admin Dashboard runs on:** http://localhost:5173

### 3. Mobile App Setup

```bash
cd app

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with backend API URL
# API_BASE_URL=http://localhost:3000

# Start Metro bundler
npm start

# Run on Android
npm run android

# Run on iOS (macOS only)
npm run ios

# Run tests
npm test
```

### 4. RAG Service Setup

```bash
cd rag-service

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy environment file
cp .env.example .env

# Edit .env with configuration
# OLLAMA_BASE_URL=http://localhost:11434

# Pull required Ollama models
ollama pull nomic-embed-text
ollama pull llama3.1:8b
# or
ollama pull qwen2.5:7b

# Start development server
uvicorn app.main:app --reload --port 8000

# Run tests
pytest

# Start production server
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

**RAG Service runs on:** http://localhost:8000

## 🔧 Environment Configuration

### Backend (.env)
```env
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/roads-authority
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-secret-key-change-in-production
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
RAG_SERVICE_URL=http://localhost:8000
```

### Admin Dashboard (.env)
```env
VITE_API_BASE_URL=http://localhost:3000
```

### Mobile App (.env)
```env
API_BASE_URL=http://localhost:3000
```

### RAG Service (.env)
```env
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_EMBEDDING_MODEL=nomic-embed-text
OLLAMA_LLM_MODEL=llama3.1:8b
CHROMADB_PATH=./data/chromadb
LOG_LEVEL=INFO
```

## 📚 Project Structure

```
roads-authority-monorepo/
├── backend/                 # Node.js + Express + TypeScript API
│   ├── src/
│   │   ├── config/         # Configuration files
│   │   ├── middlewares/    # Express middlewares
│   │   ├── modules/        # Feature modules
│   │   ├── utils/          # Utility functions
│   │   └── constants/      # Constants and enums
│   ├── package.json
│   └── tsconfig.json
│
├── admin/                   # React + TypeScript admin dashboard
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── hooks/          # Custom hooks
│   │   ├── context/        # React context
│   │   └── utils/          # Utility functions
│   ├── package.json
│   └── vite.config.ts
│
├── app/                     # React Native + TypeScript mobile app
│   ├── components/         # React Native components
│   ├── screens/            # Screen components
│   ├── services/           # API services
│   ├── navigation/         # Navigation configuration
│   └── package.json
│
├── rag-service/             # Python + FastAPI RAG microservice
│   ├── app/
│   │   ├── models/         # Pydantic models
│   │   ├── services/       # Business logic
│   │   ├── routers/        # API routes
│   │   └── utils/          # Utility functions
│   ├── requirements.txt
│   └── Dockerfile
│
├── docker-compose.yml       # Docker orchestration
├── .env.example             # Root environment template
└── README.md                # This file
```

## 🧪 Testing

### Run All Tests
```bash
# Backend tests
cd backend && npm test

# Admin tests
cd admin && npm test

# Mobile app tests
cd app && npm test

# RAG service tests
cd rag-service && pytest
```

### Test Coverage
```bash
# Backend coverage
cd backend && npm run test:coverage

# Admin coverage
cd admin && npm run test:coverage

# RAG service coverage
cd rag-service && pytest --cov
```

## 🔐 Default Admin Credentials

After initial setup, use these credentials to log in to the admin dashboard:

- **Email:** admin@roadsauthority.na
- **Password:** Admin@123

**⚠️ Important:** Change the default password immediately after first login!

## 📖 API Documentation

Comprehensive API documentation is available in the [API.md](./API.md) file, including:
- All backend endpoints
- Request/response examples
- Authentication requirements
- Error codes and handling
- RAG service endpoints

## 🛠️ Development Workflow

### Creating a New Feature

1. **Backend:** Add module in `backend/src/modules/`
2. **Admin:** Add pages and services in `admin/src/`
3. **Mobile:** Add screens and services in `app/`
4. **Database:** Update models and run migrations
5. **Tests:** Write tests for all new functionality
6. **Documentation:** Update API.md

### Code Style

- **TypeScript/JavaScript:** ESLint + Prettier
- **Python:** Black + Flake8
- **Commits:** Conventional Commits format

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/your-feature-name

# Make changes and commit
git add .
git commit -m "feat: add your feature description"

# Push and create PR
git push origin feature/your-feature-name
```

## 🚢 Deployment

### Backend Deployment
- Build: `npm run build`
- Start: `npm start`
- Environment: Set production environment variables
- Database: Ensure MongoDB is accessible
- Redis: Ensure Redis is accessible

### Admin Dashboard Deployment
- Build: `npm run build`
- Serve: Use nginx or any static file server
- Environment: Set production API URL

### Mobile App Deployment
- **Android:** `cd android && ./gradlew assembleRelease`
- **iOS:** Open in Xcode and archive
- Update API_BASE_URL to production URL

### RAG Service Deployment
- Use Docker: `docker build -t rag-service .`
- Or use uvicorn with gunicorn for production
- Ensure Ollama is running and models are pulled

## 🐛 Troubleshooting

### Backend Issues
- **MongoDB connection failed:** Check MONGODB_URI and ensure MongoDB is running
- **Redis connection failed:** Check REDIS_URL and ensure Redis is running
- **JWT errors:** Verify JWT_SECRET is set

### Admin Dashboard Issues
- **API calls failing:** Check VITE_API_BASE_URL matches backend URL
- **Build errors:** Clear node_modules and reinstall

### Mobile App Issues
- **Metro bundler errors:** Clear cache with `npm start -- --reset-cache`
- **Android build errors:** Clean with `cd android && ./gradlew clean`
- **iOS build errors:** Clean build folder in Xcode

### RAG Service Issues
- **Ollama connection failed:** Ensure Ollama is running (`ollama serve`)
- **Model not found:** Pull models with `ollama pull <model-name>`
- **ChromaDB errors:** Check CHROMADB_PATH permissions

## 📞 Support

For issues and questions:
- Create an issue in the repository
- Contact the development team
- Check the API documentation

## 📄 License

[Your License Here]

## 👥 Contributors

[List of contributors]
