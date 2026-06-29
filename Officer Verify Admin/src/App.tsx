import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ConsoleShell } from './components/layout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { CommandCenterPage } from './pages/CommandCenterPage';
import { OfficersPage } from './pages/OfficersPage';
import { VerificationsPage } from './pages/VerificationsPage';
import { IncidentsPage } from './pages/IncidentsPage';
import { LicencesPage } from './pages/LicencesPage';
import { SystemPage } from './pages/SystemPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<ConsoleShell />}>
              <Route index element={<CommandCenterPage />} />
              <Route path="officers" element={<OfficersPage />} />
              <Route path="verifications" element={<VerificationsPage />} />
              <Route path="incidents" element={<IncidentsPage />} />
              <Route path="licences" element={<LicencesPage />} />
              <Route path="system" element={<SystemPage />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
