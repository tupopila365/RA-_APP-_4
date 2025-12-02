# 🚗 Roads Authority Namibia - Full Stack Application

<div align="center">

![Roads Authority Logo](https://via.placeholder.com/200x100/00B4E6/FFFFFF?text=RA+NAMIBIA)

**A comprehensive digital platform for Roads Authority Namibia**

[![React Native](https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactnative.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)

</div>

## 📱 Overview

A modern, full-stack application ecosystem serving Roads Authority Namibia's digital needs. This monorepo includes a cross-platform mobile app, web admin dashboard, REST API backend, and AI-powered chatbot service.

### 🌟 Key Features

- **📱 Cross-Platform Mobile App** - iOS & Android support with React Native + Expo
- **🌐 Web Admin Dashboard** - Content management with React + TypeScript
- **🔧 REST API Backend** - Node.js + Express + MongoDB with TypeScript
- **🤖 AI Chatbot Service** - RAG-powered assistant using Python + FastAPI + Ollama
- **☁️ Cloud Integration** - Cloudinary for media, Google Drive for documents
- **🔐 Authentication & Security** - JWT-based auth with role management
- **📊 Real-time Features** - Push notifications and live updates

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    MOBILE APP (React Native + Expo)         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │    News      │  │  Vacancies   │  │   Tenders    │     │
│  │   Screen     │  │   Screen     │  │   Screen     │     │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │
│         │                 │                  │             │
│  ┌──────▼───────┐  ┌──────▼───────┐  ┌──────▼───────┐     │
│  │   Chatbot    │  │ Find Offices │  │    FAQs      │     │
│  │   Screen     │  │   Screen     │  │   Screen     │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────┼──────────────────────────────────────┘
                      │
┌─────────────────────▼──────────────────────────────────────┐
│              BACKEND API (Node.js + Express)               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ Auth Module  │  │ News Module  │  │Upload Module │     │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │
│         │                 │                  │             │
│  ┌──────▼───────┐  ┌──────▼───────┐  ┌──────▼───────┐     │
│  │Location Mod  │  │Chatbot Mod   │  │Tender Module │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────┼──────────────────────────────────────┘
                      │
┌─────────────────────▼──────────────────────────────────────┐
│                 DATABASES & SERVICES                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   MongoDB    │  │  Cloudinary  │  │ Google Drive │     │
│  │   Database   │  │    Media     │  │  Documents   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                      │
┌─────────────────────▼──────────────────────────────────────┐
│              RAG SERVICE (Python + FastAPI)                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │    Ollama    │  │   ChromaDB   │  │ PDF Processor│     │
│  │     LLM      │  │Vector Store  │  │   Service    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.9+ and pip
- **MongoDB** (local or Atlas)
- **Ollama** (for AI chatbot)
- **Expo CLI** (for mobile development)

### One-Command Setup

```bash
# Clone the repository
git clone https://github.com/yourusername/roads-authority-app.git
cd roads-authority-app

# Start everything (Windows)
START-ALL.bat

# Or start manually (see detailed setup below)
```

### Detailed Setup

#### 1. Backend API Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

#### 2. Mobile App Setup

```bash
cd app
npm install
npm start
# Scan QR code with Expo Go app
```

#### 3. Admin Dashboard Setup

```bash
cd admin
npm install
npm run dev
# Open http://localhost:5173
```

#### 4. RAG Service Setup (AI Chatbot)

```bash
# Install Ollama
# Windows: Download from https://ollama.ai
# Mac: brew install ollama
# Linux: curl -fsSL https://ollama.ai/install.sh | sh

# Start Ollama
ollama serve

# Pull required models
ollama pull llama3.2:1b
ollama pull nomic-embed-text

# Start RAG service
cd rag-service
pip install -r requirements.txt
python -m uvicorn app.main:app --host 0.0.0.0 --port 8001
```

## 📂 Project Structure

```
roads-authority-app/
├── 📱 app/                    # React Native Mobile App
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── screens/          # App screens
│   │   ├── navigation/       # Navigation setup
│   │   ├── services/         # API services
│   │   ├── hooks/           # Custom React hooks
│   │   └── utils/           # Utility functions
│   └── package.json
│
├── 🔧 backend/               # Node.js API Backend
│   ├── src/
│   │   ├── modules/         # Feature modules
│   │   ├── middleware/      # Express middleware
│   │   ├── config/         # Configuration files
│   │   ├── utils/          # Utility functions
│   │   └── types/          # TypeScript types
│   └── package.json
│
├── 🌐 admin/                # React Admin Dashboard
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/         # Dashboard pages
│   │   ├── services/      # API services
│   │   └── hooks/         # Custom hooks
│   └── package.json
│
├── 🤖 rag-service/          # Python AI Chatbot
│   ├── app/
│   │   ├── routers/       # FastAPI routers
│   │   ├── services/      # Business logic
│   │   ├── models/        # Data models
│   │   └── utils/         # Utilities
│   └── requirements.txt
│
└── 📚 docs/                # Documentation
    ├── API.md             # API documentation
    ├── DEPLOYMENT.md      # Deployment guide
    └── TROUBLESHOOTING.md # Common issues
```

## 🎯 Features

### 📱 Mobile App Features

- **🏠 Home Dashboard** - Welcome screen with quick access menu
- **📰 News & Updates** - Latest announcements with search and filtering
- **💼 Job Vacancies** - Browse and filter job opportunities
- **📋 Tenders** - View and download tender documents
- **🤖 AI Chatbot** - Intelligent assistant for user queries
- **❓ FAQs** - Frequently asked questions
- **📍 Office Locator** - Find RA and NATIS offices with directions
- **⚙️ Settings** - Dark/light mode, notifications, preferences
- **🔔 Push Notifications** - Real-time updates and alerts

### 🌐 Admin Dashboard Features

- **👥 User Management** - Admin and user role management
- **📝 Content Management** - Create, edit, delete news and announcements
- **💼 Vacancy Management** - Post and manage job listings
- **📋 Tender Management** - Upload and manage tender documents
- **📊 Analytics** - Usage statistics and insights
- **🔧 System Settings** - Application configuration
- **📁 File Management** - Media and document uploads

### 🤖 AI Chatbot Features

- **📚 Document RAG** - Retrieval-Augmented Generation from uploaded PDFs
- **🔍 Semantic Search** - Intelligent document search using embeddings
- **💬 Natural Conversations** - Context-aware responses
- **📄 Source Citations** - References to source documents
- **⚡ Fast Responses** - Optimized for CPU inference (4-10 seconds)

## 🛠️ Technology Stack

### Frontend
- **React Native** 0.81.5 with Expo SDK 54
- **TypeScript** for type safety
- **React Navigation** for routing
- **React Native Paper** for UI components
- **Expo Notifications** for push notifications

### Backend
- **Node.js** with Express.js framework
- **TypeScript** for development
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Cloudinary** for media storage
- **Google Drive API** for document storage

### AI/ML Service
- **Python** 3.9+ with FastAPI
- **Ollama** for local LLM inference
- **ChromaDB** for vector storage
- **PyPDF2** for document processing
- **Sentence Transformers** for embeddings

### DevOps & Tools
- **Docker** for containerization
- **Jest/Vitest** for testing
- **ESLint/Prettier** for code quality
- **GitHub Actions** for CI/CD (optional)

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/roads-authority
JWT_SECRET=your-super-secret-key
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
RAG_SERVICE_URL=http://localhost:8001
```

#### RAG Service (.env)
```env
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_LLM_MODEL=llama3.2:1b
OLLAMA_EMBEDDING_MODEL=nomic-embed-text
CHROMADB_COLLECTION_NAME=document_chunks
```

## 📱 Mobile App Screenshots

| Home Screen | News | Vacancies | Chatbot |
|-------------|------|-----------|---------|
| ![Home](https://via.placeholder.com/200x400/00B4E6/FFFFFF?text=Home) | ![News](https://via.placeholder.com/200x400/00B4E6/FFFFFF?text=News) | ![Vacancies](https://via.placeholder.com/200x400/00B4E6/FFFFFF?text=Jobs) | ![Chatbot](https://via.placeholder.com/200x400/00B4E6/FFFFFF?text=AI+Chat) |

## 🧪 Testing

### Run Tests

```bash
# Backend tests
cd backend && npm test

# Frontend tests  
cd app && npm test

# Admin dashboard tests
cd admin && npm test

# RAG service tests
cd rag-service && pytest
```

### Test Coverage

- **Backend**: Unit tests with Jest and Supertest
- **Frontend**: Component tests with React Native Testing Library
- **Admin**: Integration tests with Vitest
- **RAG Service**: API tests with pytest

## 📚 API Documentation

### Authentication Endpoints
```
POST /api/auth/login          # User login
POST /api/auth/register       # User registration
POST /api/auth/refresh        # Refresh JWT token
```

### Content Endpoints
```
GET  /api/news               # Get all news
POST /api/news               # Create news (admin)
GET  /api/vacancies          # Get job vacancies
GET  /api/tenders            # Get tenders
GET  /api/locations          # Get office locations
```

### Chatbot Endpoints
```
POST /api/chatbot/query      # Send message to chatbot
GET  /api/chatbot/health     # Check chatbot status
```

For complete API documentation, see [API.md](docs/API.md)

## 🚀 Deployment

### Production Deployment

1. **Backend**: Deploy to Heroku, AWS, or DigitalOcean
2. **Mobile App**: Build with `expo build` and deploy to App Store/Google Play
3. **Admin Dashboard**: Build with `npm run build` and deploy to Netlify/Vercel
4. **RAG Service**: Deploy to cloud instance with GPU support for better performance

See [DEPLOYMENT.md](docs/DEPLOYMENT.md) for detailed instructions.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Write tests for new features
- Use conventional commit messages
- Update documentation as needed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support & Troubleshooting

### Common Issues

**Chatbot not responding?**
- Check if Ollama is running: `ollama ps`
- Restart RAG service: `cd rag-service && python -m uvicorn app.main:app --reload`

**Mobile app not connecting?**
- Verify backend is running on correct port
- Check network connectivity
- Update API_BASE_URL in app config

**Build failures?**
- Clear node_modules: `rm -rf node_modules && npm install`
- Check Node.js version compatibility

For more help, see [TROUBLESHOOTING.md](docs/TROUBLESHOOTING.md)

## 📞 Contact

- **Project Maintainer**: [Your Name](mailto:your.email@example.com)
- **Organization**: Roads Authority Namibia
- **Website**: [https://ra.org.na](https://ra.org.na)

---

<div align="center">

**Built with ❤️ for Roads Authority Namibia**

[⭐ Star this repo](https://github.com/yourusername/roads-authority-app) • [🐛 Report Bug](https://github.tupopila365/roads-authority-app/issues) • [💡 Request Feature](https://github.com/tupopila365/roads-authority-app/issues)

</div>