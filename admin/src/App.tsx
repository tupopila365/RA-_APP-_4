import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import Login from './pages/Login';
import DashboardPage from './pages/DashboardPage';
import ChatbotInteractions from './pages/ChatbotInteractions';
import { NewsList, NewsForm, NewsDetail } from './pages/News';
import { VacanciesList, VacancyForm } from './pages/Vacancies';
import { TendersList, TenderForm } from './pages/Tenders';
import { BannersList, BannerForm } from './pages/Banners';
import { LocationsList, LocationForm } from './pages/Locations';
import { FAQList, FAQForm } from './pages/FAQs';
import { UsersList, UserForm } from './pages/Users';
import { ReportsList, ReportDetail } from './pages/PotholeReports';
import PLNDashboardPage from './pages/PLN/PLNDashboardPage';
import PLNListPage from './pages/PLN/PLNListPage';
import PLNDetailPage from './pages/PLN/PLNDetailPage';
import { IncidentsList, IncidentForm } from './pages/Incidents';
import Layout from './components/Layout/Layout';
import ErrorBoundary from './components/common/ErrorBoundary';

const theme = createTheme({
  palette: {
    primary: {
      main: '#00B4E6',
      light: '#33C3EB',
      dark: '#0090C0',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#FFD700',
      light: '#FFE033',
      dark: '#CCAC00',
      contrastText: '#1A202C',
    },
    background: {
      default: '#F5F7FA',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1A202C',
      secondary: '#4A5568',
      disabled: '#A0AEC0',
    },
    success: {
      main: '#10B981',
      light: '#34D399',
      dark: '#059669',
    },
    error: {
      main: '#EF4444',
      light: '#F87171',
      dark: '#DC2626',
    },
    warning: {
      main: '#F59E0B',
      light: '#FBBF24',
      dark: '#D97706',
    },
    info: {
      main: '#00B4E6',
      light: '#33C3EB',
      dark: '#0090C0',
    },
    grey: {
      50: '#F7FAFC',
      100: '#EDF2F7',
      200: '#E2E8F0',
      300: '#CBD5E0',
      400: '#A0AEC0',
      500: '#718096',
      600: '#4A5568',
      700: '#2D3748',
      800: '#1A202C',
      900: '#171923',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '3rem',
      lineHeight: 1.2,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontWeight: 700,
      fontSize: '2.5rem',
      lineHeight: 1.3,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontWeight: 700,
      fontSize: '2rem',
      lineHeight: 1.3,
      letterSpacing: '-0.01em',
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.75rem',
      lineHeight: 1.4,
      letterSpacing: '-0.01em',
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.4,
    },
    h6: {
      fontWeight: 600,
      fontSize: '1.25rem',
      lineHeight: 1.5,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
      fontWeight: 400,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
      fontWeight: 400,
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
      letterSpacing: '0.02em',
    },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: [
    'none',
    '0px 1px 3px rgba(0, 0, 0, 0.08), 0px 1px 2px rgba(0, 0, 0, 0.06)',
    '0px 2px 4px rgba(0, 0, 0, 0.08), 0px 2px 3px rgba(0, 0, 0, 0.06)',
    '0px 4px 6px rgba(0, 0, 0, 0.08), 0px 2px 4px rgba(0, 0, 0, 0.06)',
    '0px 6px 8px rgba(0, 0, 0, 0.08), 0px 3px 6px rgba(0, 0, 0, 0.06)',
    '0px 8px 12px rgba(0, 0, 0, 0.1), 0px 4px 8px rgba(0, 0, 0, 0.08)',
    '0px 12px 16px rgba(0, 0, 0, 0.1), 0px 6px 12px rgba(0, 0, 0, 0.08)',
    '0px 16px 24px rgba(0, 0, 0, 0.12), 0px 8px 16px rgba(0, 0, 0, 0.1)',
    '0px 20px 32px rgba(0, 0, 0, 0.12), 0px 10px 20px rgba(0, 0, 0, 0.1)',
    '0px 24px 40px rgba(0, 0, 0, 0.14), 0px 12px 24px rgba(0, 0, 0, 0.12)',
    '0px 28px 48px rgba(0, 0, 0, 0.14), 0px 14px 28px rgba(0, 0, 0, 0.12)',
    '0px 32px 56px rgba(0, 0, 0, 0.16), 0px 16px 32px rgba(0, 0, 0, 0.14)',
    '0px 36px 64px rgba(0, 0, 0, 0.16), 0px 18px 36px rgba(0, 0, 0, 0.14)',
    '0px 40px 72px rgba(0, 0, 0, 0.18), 0px 20px 40px rgba(0, 0, 0, 0.16)',
    '0px 44px 80px rgba(0, 0, 0, 0.18), 0px 22px 44px rgba(0, 0, 0, 0.16)',
    '0px 48px 88px rgba(0, 0, 0, 0.2), 0px 24px 48px rgba(0, 0, 0, 0.18)',
    '0px 52px 96px rgba(0, 0, 0, 0.2), 0px 26px 52px rgba(0, 0, 0, 0.18)',
    '0px 56px 104px rgba(0, 0, 0, 0.22), 0px 28px 56px rgba(0, 0, 0, 0.2)',
    '0px 60px 112px rgba(0, 0, 0, 0.22), 0px 30px 60px rgba(0, 0, 0, 0.2)',
    '0px 64px 120px rgba(0, 0, 0, 0.24), 0px 32px 64px rgba(0, 0, 0, 0.22)',
    '0px 68px 128px rgba(0, 0, 0, 0.24), 0px 34px 68px rgba(0, 0, 0, 0.22)',
    '0px 72px 136px rgba(0, 0, 0, 0.26), 0px 36px 72px rgba(0, 0, 0, 0.24)',
    '0px 76px 144px rgba(0, 0, 0, 0.26), 0px 38px 76px rgba(0, 0, 0, 0.24)',
    '0px 80px 152px rgba(0, 0, 0, 0.28), 0px 40px 80px rgba(0, 0, 0, 0.26)',
  ] as any,
  transitions: {
    duration: {
      shortest: 150,
      shorter: 200,
      short: 250,
      standard: 300,
      complex: 375,
      enteringScreen: 225,
      leavingScreen: 195,
    },
    easing: {
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      easeOut: 'cubic-bezier(0.0, 0, 0.2, 1)',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          padding: '10px 24px',
          fontSize: '0.9375rem',
          fontWeight: 600,
          textTransform: 'none',
          boxShadow: 'none',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            boxShadow: '0px 4px 12px rgba(0, 180, 230, 0.3)',
            transform: 'translateY(-2px)',
          },
        },
        contained: {
          '&:hover': {
            boxShadow: '0px 6px 16px rgba(0, 180, 230, 0.4)',
          },
        },
        outlined: {
          borderWidth: 2,
          '&:hover': {
            borderWidth: 2,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08), 0px 1px 4px rgba(0, 0, 0, 0.06)',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          border: '1px solid rgba(0, 0, 0, 0.05)',
          '&:hover': {
            boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.12), 0px 4px 12px rgba(0, 0, 0, 0.08)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          backgroundImage: 'none',
        },
        elevation1: {
          boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08), 0px 1px 4px rgba(0, 0, 0, 0.06)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#00B4E6',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderWidth: 2,
            },
          },
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
        },
        head: {
          fontWeight: 600,
          backgroundColor: '#F7FAFC',
          color: '#1A202C',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          transition: 'background-color 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            backgroundColor: 'rgba(0, 180, 230, 0.04)',
          },
          '&.Mui-selected': {
            backgroundColor: 'rgba(0, 180, 230, 0.08)',
            '&:hover': {
              backgroundColor: 'rgba(0, 180, 230, 0.12)',
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontWeight: 500,
          height: 32,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 20,
          boxShadow: '0px 24px 48px rgba(0, 0, 0, 0.2), 0px 12px 24px rgba(0, 0, 0, 0.16)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1), 0px 1px 4px rgba(0, 0, 0, 0.08)',
          backdropFilter: 'blur(10px)',
          backgroundColor: 'rgba(0, 180, 230, 0.95)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: '1px solid rgba(0, 0, 0, 0.08)',
        },
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          margin: '4px 8px',
          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            backgroundColor: 'rgba(0, 180, 230, 0.08)',
          },
          '&.Mui-selected': {
            backgroundColor: 'rgba(0, 180, 230, 0.12)',
            '&:hover': {
              backgroundColor: 'rgba(0, 180, 230, 0.16)',
            },
          },
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Layout>
                    <DashboardPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/chatbot-interactions"
              element={
                <ProtectedRoute>
                  <Layout>
                    <ErrorBoundary>
                      <ChatbotInteractions />
                    </ErrorBoundary>
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/news"
              element={
                <ProtectedRoute requiredPermission="news:manage">
                  <Layout>
                    <NewsList />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/news/create"
              element={
                <ProtectedRoute requiredPermission="news:manage">
                  <Layout>
                    <NewsForm />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/news/edit/:id"
              element={
                <ProtectedRoute requiredPermission="news:manage">
                  <Layout>
                    <NewsForm />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/news/:id"
              element={
                <ProtectedRoute requiredPermission="news:manage">
                  <Layout>
                    <NewsDetail />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/vacancies"
              element={
                <ProtectedRoute requiredPermission="vacancies:manage">
                  <Layout>
                    <VacanciesList />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/vacancies/create"
              element={
                <ProtectedRoute requiredPermission="vacancies:manage">
                  <Layout>
                    <VacancyForm />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/vacancies/edit/:id"
              element={
                <ProtectedRoute requiredPermission="vacancies:manage">
                  <Layout>
                    <VacancyForm />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/tenders"
              element={
                <ProtectedRoute requiredPermission="tenders:manage">
                  <Layout>
                    <TendersList />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/tenders/create"
              element={
                <ProtectedRoute requiredPermission="tenders:manage">
                  <Layout>
                    <TenderForm />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/tenders/edit/:id"
              element={
                <ProtectedRoute requiredPermission="tenders:manage">
                  <Layout>
                    <TenderForm />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/banners"
              element={
                <ProtectedRoute requiredPermission="banners:manage">
                  <Layout>
                    <BannersList />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/banners/create"
              element={
                <ProtectedRoute requiredPermission="banners:manage">
                  <Layout>
                    <BannerForm />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/banners/edit/:id"
              element={
                <ProtectedRoute requiredPermission="banners:manage">
                  <Layout>
                    <BannerForm />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/locations"
              element={
                <ProtectedRoute requiredPermission="locations:manage">
                  <Layout>
                    <LocationsList />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/locations/create"
              element={
                <ProtectedRoute requiredPermission="locations:manage">
                  <Layout>
                    <LocationForm />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/locations/edit/:id"
              element={
                <ProtectedRoute requiredPermission="locations:manage">
                  <Layout>
                    <LocationForm />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/faqs"
              element={
                <ProtectedRoute requiredPermission="faqs:manage">
                  <Layout>
                    <FAQList />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/faqs/create"
              element={
                <ProtectedRoute requiredPermission="faqs:manage">
                  <Layout>
                    <FAQForm />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/faqs/edit/:id"
              element={
                <ProtectedRoute requiredPermission="faqs:manage">
                  <Layout>
                    <FAQForm />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/users"
              element={
                <ProtectedRoute requiredPermission="users:manage">
                  <Layout>
                    <UsersList />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/users/create"
              element={
                <ProtectedRoute requiredPermission="users:manage">
                  <Layout>
                    <UserForm />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/users/edit/:id"
              element={
                <ProtectedRoute requiredPermission="users:manage">
                  <Layout>
                    <UserForm />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/pothole-reports"
              element={
                <ProtectedRoute requiredPermission="pothole-reports:manage">
                  <Layout>
                    <ReportsList />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/pothole-reports/:id"
              element={
                <ProtectedRoute requiredPermission="pothole-reports:manage">
                  <Layout>
                    <ReportDetail />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/incidents"
              element={
                <ProtectedRoute requiredPermission="incidents:manage">
                  <Layout>
                    <IncidentsList />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/incidents/create"
              element={
                <ProtectedRoute requiredPermission="incidents:manage">
                  <Layout>
                    <IncidentForm />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/incidents/edit/:id"
              element={
                <ProtectedRoute requiredPermission="incidents:manage">
                  <Layout>
                    <IncidentForm />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/pln"
              element={
                <ProtectedRoute requiredPermission="pln:manage">
                  <Layout>
                    <PLNDashboardPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/pln/applications"
              element={
                <ProtectedRoute requiredPermission="pln:manage">
                  <Layout>
                    <PLNListPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/pln/applications/:id"
              element={
                <ProtectedRoute requiredPermission="pln:manage">
                  <Layout>
                    <PLNDetailPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
