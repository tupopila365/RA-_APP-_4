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
import VehicleDashboardPage from './pages/Vehicle/VehicleDashboardPage';
import VehicleListPage from './pages/Vehicle/VehicleListPage';
import VehicleDetailPage from './pages/Vehicle/VehicleDetailPage';
import { IncidentsList, IncidentForm } from './pages/Incidents';
import { ProcurementLegislationPage } from './pages/ProcurementLegislation';
import { ProcurementPlanPage } from './pages/ProcurementPlan';
import { ProcurementAwardsPage } from './pages/ProcurementAwards';
import { ProcurementOpeningRegisterPage } from './pages/ProcurementOpeningRegister';
import { BidsRFQsPage } from './pages/BidsRFQs';
import { RoadStatusList, RoadStatusForm } from './pages/RoadStatus';
import FormsPage from './pages/Forms/FormsPage';
import { RAServicesPage } from './pages/RAServices';
import Layout from './components/Layout/Layout';
import ErrorBoundary from './components/common/ErrorBoundary';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1E3A8A', // Professional navy blue
      light: '#3B82F6',
      dark: '#1E40AF',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#0EA5E9', // Professional sky blue
      light: '#38BDF8',
      dark: '#0284C7',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#F8FAFC', // Clean light gray
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1E293B', // Dark slate
      secondary: '#64748B', // Medium gray
      disabled: '#94A3B8',
    },
    success: {
      main: '#059669',
      light: '#10B981',
      dark: '#047857',
    },
    error: {
      main: '#DC2626',
      light: '#EF4444',
      dark: '#B91C1C',
    },
    warning: {
      main: '#D97706',
      light: '#F59E0B',
      dark: '#B45309',
    },
    info: {
      main: '#0284C7',
      light: '#0EA5E9',
      dark: '#0369A1',
    },
    grey: {
      50: '#F8FAFC',
      100: '#F1F5F9',
      200: '#E2E8F0',
      300: '#CBD5E1',
      400: '#94A3B8',
      500: '#64748B',
      600: '#475569',
      700: '#334155',
      800: '#1E293B',
      900: '#0F172A',
    },
  },
  typography: {
    fontFamily: '"Inter", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
      fontSize: '2.5rem',
      lineHeight: 1.2,
      letterSpacing: '-0.015em',
      color: '#1E293B',
    },
    h2: {
      fontWeight: 700,
      fontSize: '2rem',
      lineHeight: 1.3,
      letterSpacing: '-0.01em',
      color: '#1E293B',
    },
    h3: {
      fontWeight: 600,
      fontSize: '1.75rem',
      lineHeight: 1.3,
      letterSpacing: '-0.01em',
      color: '#1E293B',
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.4,
      letterSpacing: '-0.005em',
      color: '#1E293B',
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem',
      lineHeight: 1.4,
      color: '#1E293B',
    },
    h6: {
      fontWeight: 600,
      fontSize: '1.125rem',
      lineHeight: 1.5,
      color: '#1E293B',
    },
    body1: {
      fontSize: '0.9375rem',
      lineHeight: 1.6,
      fontWeight: 400,
      color: '#334155',
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
      fontWeight: 400,
      color: '#64748B',
    },
    button: {
      fontWeight: 500,
      textTransform: 'none',
      letterSpacing: '0.01em',
      fontSize: '0.875rem',
    },
  },
  shape: {
    borderRadius: 6, // Smaller, sharper corners for professional look
  },
  shadows: [
    'none', // 0
    '0px 1px 2px rgba(0, 0, 0, 0.05)', // 1
    '0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px rgba(0, 0, 0, 0.06)', // 2
    '0px 2px 4px rgba(0, 0, 0, 0.1), 0px 1px 3px rgba(0, 0, 0, 0.08)', // 3
    '0px 3px 6px rgba(0, 0, 0, 0.1), 0px 2px 4px rgba(0, 0, 0, 0.06)', // 4
    '0px 4px 8px rgba(0, 0, 0, 0.1), 0px 2px 4px rgba(0, 0, 0, 0.06)', // 5
    '0px 6px 12px rgba(0, 0, 0, 0.1), 0px 3px 6px rgba(0, 0, 0, 0.08)', // 6
    '0px 12px 16px rgba(0, 0, 0, 0.1), 0px 6px 12px rgba(0, 0, 0, 0.08)', // 7
    '0px 16px 24px rgba(0, 0, 0, 0.12), 0px 8px 16px rgba(0, 0, 0, 0.1)', // 8
    '0px 20px 32px rgba(0, 0, 0, 0.12), 0px 10px 20px rgba(0, 0, 0, 0.1)', // 9
    '0px 24px 40px rgba(0, 0, 0, 0.14), 0px 12px 24px rgba(0, 0, 0, 0.12)', // 10
    '0px 28px 48px rgba(0, 0, 0, 0.14), 0px 14px 28px rgba(0, 0, 0, 0.12)', // 11
    '0px 32px 56px rgba(0, 0, 0, 0.16), 0px 16px 32px rgba(0, 0, 0, 0.14)', // 12
    '0px 36px 64px rgba(0, 0, 0, 0.16), 0px 18px 36px rgba(0, 0, 0, 0.14)', // 13
    '0px 40px 72px rgba(0, 0, 0, 0.18), 0px 20px 40px rgba(0, 0, 0, 0.16)', // 14
    '0px 44px 80px rgba(0, 0, 0, 0.18), 0px 22px 44px rgba(0, 0, 0, 0.16)', // 15
    '0px 48px 88px rgba(0, 0, 0, 0.2), 0px 24px 48px rgba(0, 0, 0, 0.18)', // 16
    '0px 52px 96px rgba(0, 0, 0, 0.2), 0px 26px 52px rgba(0, 0, 0, 0.18)', // 17
    '0px 56px 104px rgba(0, 0, 0, 0.22), 0px 28px 56px rgba(0, 0, 0, 0.2)', // 18
    '0px 60px 112px rgba(0, 0, 0, 0.22), 0px 30px 60px rgba(0, 0, 0, 0.2)', // 19
    '0px 64px 120px rgba(0, 0, 0, 0.24), 0px 32px 64px rgba(0, 0, 0, 0.22)', // 20
    '0px 68px 128px rgba(0, 0, 0, 0.24), 0px 34px 68px rgba(0, 0, 0, 0.22)', // 21
    '0px 72px 136px rgba(0, 0, 0, 0.26), 0px 36px 72px rgba(0, 0, 0, 0.24)', // 22
    '0px 76px 144px rgba(0, 0, 0, 0.26), 0px 38px 76px rgba(0, 0, 0, 0.24)', // 23
    '0px 80px 152px rgba(0, 0, 0, 0.28), 0px 40px 80px rgba(0, 0, 0, 0.26)', // 24
  ],
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
          borderRadius: 6,
          padding: '8px 20px',
          fontSize: '0.875rem',
          fontWeight: 500,
          textTransform: 'none',
          boxShadow: 'none',
          transition: 'all 0.2s ease',
          '&:hover': {
            boxShadow: '0px 2px 4px rgba(30, 58, 138, 0.2)',
          },
        },
        contained: {
          '&:hover': {
            boxShadow: '0px 3px 6px rgba(30, 58, 138, 0.25)',
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
          borderRadius: 6,
          boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px rgba(0, 0, 0, 0.06)',
          transition: 'all 0.2s ease',
          border: '1px solid rgba(0, 0, 0, 0.08)',
          '&:hover': {
            boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1), 0px 2px 4px rgba(0, 0, 0, 0.06)',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          backgroundImage: 'none',
          border: '1px solid rgba(0, 0, 0, 0.06)',
        },
        elevation1: {
          boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1), 0px 1px 2px rgba(0, 0, 0, 0.06)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 6,
            transition: 'all 0.2s ease',
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#1E3A8A',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderWidth: 2,
              borderColor: '#1E3A8A',
            },
          },
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          borderRadius: 6,
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
          backgroundColor: '#F8FAFC',
          color: '#1E293B',
          fontSize: '0.875rem',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          transition: 'background-color 0.15s ease',
          '&:hover': {
            backgroundColor: '#F8FAFC',
          },
          '&.Mui-selected': {
            backgroundColor: '#EFF6FF',
            '&:hover': {
              backgroundColor: '#DBEAFE',
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          fontWeight: 500,
          height: 28,
          fontSize: '0.75rem',
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 8,
          boxShadow: '0px 12px 24px rgba(0, 0, 0, 0.15), 0px 6px 12px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(0, 0, 0, 0.08)',
        },
        paperFullWidth: {
          maxWidth: '90vw',
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          padding: '20px 24px 16px',
          borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
          fontWeight: 600,
          fontSize: '1.25rem',
          color: '#1E293B',
        },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          padding: '24px',
        },
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: {
          padding: '16px 24px',
          borderTop: '1px solid rgba(0, 0, 0, 0.08)',
          gap: 1,
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
          minHeight: 48,
        },
        indicator: {
          backgroundColor: '#1E3A8A',
          height: 3,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 500,
          fontSize: '0.875rem',
          minHeight: 48,
          color: '#64748B',
          '&.Mui-selected': {
            color: '#1E3A8A',
            fontWeight: 600,
          },
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        root: {
          borderRadius: 6,
        },
      },
    },
    MuiFormLabel: {
      styleOverrides: {
        root: {
          fontWeight: 500,
          fontSize: '0.875rem',
          color: '#334155',
          '&.Mui-focused': {
            color: '#1E3A8A',
          },
        },
      },
    },
    MuiAlert: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          border: '1px solid',
        },
        standardSuccess: {
          backgroundColor: '#F0FDF4',
          borderColor: '#10B981',
          color: '#059669',
        },
        standardError: {
          backgroundColor: '#FEF2F2',
          borderColor: '#EF4444',
          color: '#DC2626',
        },
        standardWarning: {
          backgroundColor: '#FFFBEB',
          borderColor: '#F59E0B',
          color: '#D97706',
        },
        standardInfo: {
          backgroundColor: '#EFF6FF',
          borderColor: '#0284C7',
          color: '#0369A1',
        },
      },
    },
    MuiDivider: {
      styleOverrides: {
        root: {
          borderColor: 'rgba(0, 0, 0, 0.08)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
          backdropFilter: 'blur(10px)',
          backgroundColor: '#1E3A8A',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
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
          borderRadius: 6,
          margin: '2px 8px',
          transition: 'all 0.15s ease',
          '&:hover': {
            backgroundColor: '#F8FAFC',
          },
          '&.Mui-selected': {
            backgroundColor: '#EFF6FF',
            borderLeft: '3px solid #1E3A8A',
            '&:hover': {
              backgroundColor: '#DBEAFE',
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
              path="/road-status"
              element={
                <ProtectedRoute requiredPermission="road-status:manage">
                  <Layout>
                    <RoadStatusList />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/road-status/new"
              element={
                <ProtectedRoute requiredPermission="road-status:manage">
                  <Layout>
                    <RoadStatusForm />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/road-status/edit/:id"
              element={
                <ProtectedRoute requiredPermission="road-status:manage">
                  <Layout>
                    <RoadStatusForm />
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
            <Route
              path="/vehicle-reg"
              element={
                <ProtectedRoute requiredPermission="vehicle-reg:manage">
                  <Layout>
                    <VehicleDashboardPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/vehicle-reg/applications"
              element={
                <ProtectedRoute requiredPermission="vehicle-reg:manage">
                  <Layout>
                    <VehicleListPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/vehicle-reg/applications/:id"
              element={
                <ProtectedRoute requiredPermission="vehicle-reg:manage">
                  <Layout>
                    <VehicleDetailPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/procurement-legislation"
              element={
                <ProtectedRoute requiredPermission="procurement:legislation:manage">
                  <Layout>
                    <ProcurementLegislationPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/procurement-plan"
              element={
                <ProtectedRoute requiredPermission="procurement:plan:manage">
                  <Layout>
                    <ProcurementPlanPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/procurement-awards"
              element={
                <ProtectedRoute requiredPermission="procurement:awards:manage">
                  <Layout>
                    <ProcurementAwardsPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/forms"
              element={
                <ProtectedRoute requiredPermission="procurement:awards:manage">
                  <Layout>
                    <FormsPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/ra-services"
              element={
                <ProtectedRoute requiredPermission="ra-services:manage">
                  <Layout>
                    <RAServicesPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
                <Route
                  path="/procurement-opening-register"
                  element={
                    <ProtectedRoute requiredPermission="procurement:opening-register:manage">
                      <Layout>
                        <ProcurementOpeningRegisterPage />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/bids-rfqs"
                  element={
                    <ProtectedRoute requiredPermission="procurement:opening-register:manage">
                      <Layout>
                        <BidsRFQsPage />
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
