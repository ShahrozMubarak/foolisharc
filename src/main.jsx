import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import './index.css';

if(import.meta.env.VITE_GOOGLE_CLIENT_ID) {
  const gis=document.createElement('script');
  gis.src='https://accounts.google.com/gsi/client';
  gis.async=true;
  document.head.append(gis);
}
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
