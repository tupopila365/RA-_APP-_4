import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import Login from './pages/Login';
import DashboardPage from './pages/DashboardPage';
import ChatbotInteractions from './pages/ChatbotInteractions';
import { NewsList, NewsForm, NewsDetail } from './pages/News';
import { BannersList, BannerForm } from './pages/Banners';
import { LocationsList, LocationForm } from './pages/Locations';
import { FAQList, FAQForm } from './pages/FAQs';
import { FeedbackList } from './pages/Feedback';
import { UsersList, UserForm } from './pages/Users';
import { ReportsList, ReportDetail } from './pages/PotholeReports';
import PLNDashboardPage from './pages/PLN/PLNDashboardPage';
import PLNListPage from './pages/PLN/PLNListPage';
import PLNDetailPage from './pages/PLN/PLNDetailPage';
import { RoadStatusList, RoadStatusForm } from './pages/RoadStatus';
import FormsPage from './pages/Forms/FormsPage';
import { RAServicesPage } from './pages/RAServices';
import Layout from './components/Layout/Layout';
import ErrorBoundary from './components/common/ErrorBoundary';
import adminTheme from './theme';

function App() {
  return (
    <ThemeProvider theme={adminTheme}>
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
              path="/feedback"
              element={
                <ProtectedRoute requiredPermission="feedback:manage">
                  <Layout>
                    <FeedbackList />
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
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
