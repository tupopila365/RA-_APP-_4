# Roads Authority Admin Dashboard

React + TypeScript + Vite web application for content management.

## Overview

This admin dashboard provides:
- Secure login with JWT authentication
- Role-based access control and permissions
- Content management for news, vacancies, tenders, banners, and locations
- PDF document upload and management
- User management (super-admin only)
- Responsive design for desktop and tablet

## Tech Stack

- **Framework:** React 18
- **Language:** TypeScript
- **Build Tool:** Vite
- **Routing:** React Router v6
- **State Management:** React Context + Hooks
- **HTTP Client:** Axios
- **UI Library:** Material-UI
- **Forms:** React Hook Form + Zod
- **Testing:** Vitest + React Testing Library (to be added)

## Setup

### Prerequisites

- Node.js 18+ and npm

### Installation

1. **Install Dependencies**
   ```bash
   cd admin
   npm install
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and set the backend API URL:
   ```
   VITE_API_BASE_URL=http://localhost:5000
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```
   
   The app will be available at `http://localhost:3001`

4. **Build for Production**
   ```bash
   npm run build
   ```
   
   The production build will be in the `dist/` directory.

5. **Preview Production Build**
   ```bash
   npm run preview
   ```

## Project Structure

```
admin/
├── src/
│   ├── App.tsx                   # Main app component with routing
│   ├── main.tsx                  # Entry point
│   ├── vite-env.d.ts            # Vite type definitions
│   ├── components/               # React components
│   ├── pages/                    # Page components
│   ├── services/                 # API services
│   ├── hooks/                    # Custom React hooks
│   ├── context/                  # React context providers
│   ├── utils/                    # Utility functions
│   └── types/                    # TypeScript type definitions
├── public/                       # Static assets
├── index.html                    # HTML entry point
├── package.json
├── vite.config.ts               # Vite configuration
├── tsconfig.json                # TypeScript configuration
├── .eslintrc.cjs                # ESLint configuration
├── .env.example                 # Environment variables template
└── README.md
```

## Features

### Authentication
- Login with email and password
- JWT token management with automatic refresh
- Secure logout with token invalidation

### Content Management
- **Documents:** Upload PDFs, view indexing status, delete
- **News:** Create, edit, delete articles with rich text editor
- **Vacancies:** Manage job postings with optional PDF attachments
- **Tenders:** Manage procurement opportunities with required PDFs
- **Banners:** Manage homepage carousel with image uploads
- **Locations:** Manage office locations with coordinates

### User Management (Super-Admin)
- Create admin users
- Assign roles and permissions
- Edit user details
- Delete users

### Role-Based Access
- **Super-admin:** Full access including user management
- **Admin:** Access based on assigned permissions

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## Next Steps

Refer to the implementation tasks in `../.kiro/specs/full-stack-monorepo/tasks.md`

## Related Documentation

- [Root README](../README-MONOREPO.md) - Complete monorepo setup
- [API Documentation](../API.md) - Backend API reference
- [Backend README](../backend/README.md) - Backend setup and documentation
