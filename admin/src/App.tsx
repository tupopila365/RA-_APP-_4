import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import Login from './pages/Login';
import DashboardPage from './pages/DashboardPage';
import DocumentList from './pages/Documents/DocumentList';
import DocumentUpload from './pages/Documents/DocumentUpload';
import { NewsList, NewsForm, NewsDetail } from './pages/News';
import { VacanciesList, VacancyForm } from './pages/Vacancies';
import { TendersList, TenderForm } from './pages/Tenders';
import { BannersList, BannerForm } from './pages/Banners';
import { LocationsList, LocationForm } from './pages/Locations';
import { UsersList, UserForm } from './pages/Users';
import Layout from './components/Layout/Layout';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
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
              path="/documents"
              element={
                <ProtectedRoute requiredPermission="documents:upload">
                  <Layout>
                    <DocumentList />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/documents/upload"
              element={
                <ProtectedRoute requiredPermission="documents:upload">
                  <Layout>
                    <DocumentUpload />
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
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
