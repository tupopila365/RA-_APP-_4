# Roads Authority Namibia - Admin Web Portal

A React-based web application for Roads Authority Namibia administrative functions.

## Features

- **Secure Authentication**: Username/password login with department-based access control
- **Department-Based Access**: Different departments have access to specific administrative functions
- **Responsive Design**: Works on desktop and mobile devices
- **Modern UI**: Clean, professional interface with Material-UI components

## Departments

- **Communications**: Manage news, announcements, and public communications
- **Front Desk**: Handle customer inquiries and service requests
- **Procurement**: Manage tenders, contracts, and procurement processes
- **Human Resources**: Manage employee data, recruitment, and HR processes
- **Administration**: Full system administration access

## Demo Credentials

| Username | Password | Department | Access |
|----------|----------|------------|---------|
| admin | admin123 | Administration | All departments |
| comm_user | comm123 | Communications | Communications only |
| frontdesk_user | front123 | Front Desk | Front Desk only |
| proc_user | proc123 | Procurement | Procurement only |
| hr_user | hr123 | HR | HR only |

## Getting Started

1. **Install Dependencies**
   ```bash
   cd admin-web
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm start
   ```

3. **Build for Production**
   ```bash
   npm run build
   ```

## Project Structure

```
admin-web/
├── public/
│   ├── index.html
│   └── assets/
│       └── ra-logo.png
├── src/
│   ├── components/
│   │   └── LoadingSpinner.js
│   ├── context/
│   │   └── AuthContext.js
│   ├── pages/
│   │   ├── LoginPage.js
│   │   ├── DashboardPage.js
│   │   └── DepartmentPage.js
│   ├── services/
│   │   └── authService.js
│   ├── App.js
│   ├── index.js
│   └── styles.css
├── package.json
└── README.md
```

## Technology Stack

- **React**: Frontend framework
- **React Router**: Client-side routing
- **Material-UI**: UI component library
- **CSS**: Custom styling

## Security Notes

- This application uses mock authentication for demonstration purposes
- In production, implement proper backend authentication
- Passwords are stored in plain text for demo only - use proper hashing in production
- Add HTTPS and secure cookie handling for production deployment