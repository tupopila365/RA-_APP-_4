import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Suppress Chrome extension messaging errors (harmless browser extension issues)
if (typeof window !== 'undefined') {
  const originalError = window.console.error;
  window.console.error = (...args: any[]) => {
    // Filter out Chrome extension messaging errors
    const errorMessage = args[0]?.toString() || '';
    if (
      errorMessage.includes('Could not establish connection') ||
      errorMessage.includes('Receiving end does not exist') ||
      errorMessage.includes('Extension context invalidated')
    ) {
      // Silently ignore extension errors
      return;
    }
    // Log all other errors normally
    originalError.apply(console, args);
  };

  // Also catch unhandled promise rejections from extensions
  window.addEventListener('unhandledrejection', (event) => {
    const errorMessage = event.reason?.message || event.reason?.toString() || '';
    if (
      errorMessage.includes('Could not establish connection') ||
      errorMessage.includes('Receiving end does not exist') ||
      errorMessage.includes('Extension context invalidated')
    ) {
      event.preventDefault(); // Suppress the error
    }
  });
}

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Failed to find the root element');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
