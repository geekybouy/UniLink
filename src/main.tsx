
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { ProfileProvider } from './contexts/ProfileContext';
import { ThemeProvider } from './components/ui/theme-provider';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider defaultTheme="light" storageKey="unilink-theme">
        <ProfileProvider>
          <App />
        </ProfileProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
