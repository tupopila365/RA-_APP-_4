import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { DEPARTMENTS } from '../services/authService';
import {
  Campaign,
  SupportAgent,
  ShoppingCart,
  People,
  ArrowBack,
  AdminPanelSettings
} from '@mui/icons-material';

const DepartmentPage = () => {
  const { departmentId } = useParams();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const department = DEPARTMENTS[departmentId];

  if (!department) {
    return (
      <div className="dashboard-container">
        <main className="dashboard-content" style={{ textAlign: 'center', padding: '40px' }}>
          <h2>Department Not Found</h2>
          <p>The requested department does not exist.</p>
          <button
            className="btn btn-primary"
            onClick={() => navigate('/dashboard')}
          >
            Back to Dashboard
          </button>
        </main>
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const getDepartmentIcon = (iconName) => {
    const iconProps = { style: { fontSize: '48px', color: '#00B4E6' } };
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

  const getDepartmentContent = () => {
    switch (departmentId) {
      case 'communications':
        return (
          <div>
            <h3>Communications Management</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginTop: '24px' }}>
              <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <h4>News & Announcements</h4>
                <p>Manage news articles and public announcements</p>
                <button className="btn btn-primary" style={{ marginTop: '12px' }}>
                  Manage News
                </button>
              </div>
              <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <h4>Press Releases</h4>
                <p>Create and publish press releases</p>
                <button className="btn btn-primary" style={{ marginTop: '12px' }}>
                  Manage Press Releases
                </button>
              </div>
              <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <h4>Media Assets</h4>
                <p>Manage photos, videos, and other media</p>
                <button className="btn btn-primary" style={{ marginTop: '12px' }}>
                  Media Library
                </button>
              </div>
            </div>
          </div>
        );

      case 'front_desk':
        return (
          <div>
            <h3>Front Desk Management</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginTop: '24px' }}>
              <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <h4>Customer Inquiries</h4>
                <p>View and respond to customer inquiries</p>
                <button className="btn btn-primary" style={{ marginTop: '12px' }}>
                  View Inquiries
                </button>
              </div>
              <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <h4>Appointments</h4>
                <p>Schedule and manage appointments</p>
                <button className="btn btn-primary" style={{ marginTop: '12px' }}>
                  Manage Appointments
                </button>
              </div>
              <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <h4>Service Requests</h4>
                <p>Track and process service requests</p>
                <button className="btn btn-primary" style={{ marginTop: '12px' }}>
                  Service Requests
                </button>
              </div>
            </div>
          </div>
        );

      case 'procurement':
        return (
          <div>
            <h3>Procurement Management</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginTop: '24px' }}>
              <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <h4>Tenders</h4>
                <p>Create and manage tender processes</p>
                <button className="btn btn-primary" style={{ marginTop: '12px' }}>
                  Manage Tenders
                </button>
              </div>
              <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <h4>Contracts</h4>
                <p>Oversee contract management</p>
                <button className="btn btn-primary" style={{ marginTop: '12px' }}>
                  Contract Management
                </button>
              </div>
              <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <h4>Vendor Management</h4>
                <p>Maintain vendor relationships</p>
                <button className="btn btn-primary" style={{ marginTop: '12px' }}>
                  Vendor Portal
                </button>
              </div>
            </div>
          </div>
        );

      case 'hr':
        return (
          <div>
            <h3>Human Resources Management</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginTop: '24px' }}>
              <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <h4>Employee Management</h4>
                <p>Manage employee records and information</p>
                <button className="btn btn-primary" style={{ marginTop: '12px' }}>
                  Employee Database
                </button>
              </div>
              <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <h4>Recruitment</h4>
                <p>Handle job postings and applications</p>
                <button className="btn btn-primary" style={{ marginTop: '12px' }}>
                  Recruitment Portal
                </button>
              </div>
              <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <h4>Training & Development</h4>
                <p>Manage employee training programs</p>
                <button className="btn btn-primary" style={{ marginTop: '12px' }}>
                  Training Management
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return (
          <div>
            <h3>{department.name}</h3>
            <p>{department.description}</p>
            <p style={{ color: '#666', fontStyle: 'italic' }}>
              This department's functionality is under development.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            className="btn btn-secondary"
            onClick={() => navigate('/dashboard')}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <ArrowBack style={{ fontSize: '18px' }} />
            Back
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {getDepartmentIcon(department.icon)}
            <div>
              <h2 style={{ margin: 0, color: '#333' }}>{department.name}</h2>
              <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>Department Portal</p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ color: '#666' }}>
            {user?.name} ({user?.role})
          </span>
          <button
            className="btn btn-secondary"
            onClick={handleLogout}
            style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <AdminPanelSettings style={{ fontSize: '18px' }} />
            Logout
          </button>
        </div>
      </header>

      <main className="dashboard-content">
        {getDepartmentContent()}
      </main>
    </div>
  );
};

export default DepartmentPage;