import React from 'react';

const LoadingSpinner = ({ message = 'Loading...' }) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '200px',
      color: '#666'
    }}>
      <div className="loading-spinner"></div>
      <p style={{ margin: '16px 0 0 0', fontSize: '16px' }}>{message}</p>
    </div>
  );
};

export default LoadingSpinner;