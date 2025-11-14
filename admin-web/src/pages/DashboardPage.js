import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Campaign,
  SupportAgent,
  ShoppingCart,
  People,
  AdminPanelSettings,
  Logout
} from '@mui/icons-material';

const DashboardPage = () => {
  const { user, logout, getAccessibleDepartments } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleDepartmentClick = (departmentId) => {
    navigate(`/department/${departmentId}`);
  };

  const accessibleDepartments = getAccessibleDepartments();

  const getDepartmentIcon = (iconName) => {
    const iconProps = { className: "department-icon" };
    switch (iconName) {
      case 'campaign':
        return <Campaign {...iconProps} />;
      case 'support_agent':
        return <SupportAgent {...iconProps} />;
      case 'shopping_cart':
        return <ShoppingCart {...iconProps} />;
      case 'people':
        return <People {...iconProps} />;
      case 'admin_panel_settings':
        return <AdminPanelSettings {...iconProps} />;
      default:
        return <AdminPanelSettings {...iconProps} />;
    }
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <img
            src="/assets/ra-logo.png"
            alt="Roads Authority Namibia Logo"
            style={{ width: '40px', height: '40px' }}
          />
          <div>
            <h2 style={{ margin: 0, color: '#333' }}>Roads Authority Namibia</h2>
            <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>Admin Portal</p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ color: '#666' }}>
            Welcome, {user?.name} ({user?.role})
          </span>
          <button
            className="btn btn-secondary"
            onClick={handleLogout}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Logout style={{ fontSize: '18px' }} />
            Logout
          </button>
        </div>
      </header>

      <main className="dashboard-content">
        <div className="welcome-section">
          <h1 className="welcome-title">Admin Dashboard</h1>
          <p className="welcome-subtitle">
            Select a department below to access its administrative functions.
          </p>
        </div>

        <div className="department-grid">
          {accessibleDepartments.map(([departmentId, department]) => (
            <div
              key={departmentId}
              className="department-card"
              onClick={() => handleDepartmentClick(departmentId)}
            >
              {getDepartmentIcon(department.icon)}
              <h3 className="department-title">{department.name}</h3>
              <p className="department-description">{department.description}</p>
            </div>
          ))}
        </div>

        {accessibleDepartments.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
          }}>
            <p style={{ color: '#666', margin: 0 }}>
              No departments accessible with your current permissions.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default DashboardPage;