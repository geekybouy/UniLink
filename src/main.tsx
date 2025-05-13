
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom';
import { ProfileProvider } from './contexts/ProfileContext';
import { ThemeProvider } from './components/ui/theme-provider';
import { AuthProvider } from './contexts/AuthContext';
import { EventsProvider } from './contexts/EventsContext';
import { MessagingProvider } from './contexts/MessagingContext';
import { NotificationsProvider } from './contexts/NotificationsContext';
import { JobsProvider } from './contexts/JobsContext';
import { KnowledgeProvider } from './contexts/KnowledgeContext';

// Create root outside of the render call for better performance
const root = ReactDOM.createRoot(document.getElementById('root')!);

// Use a more efficient render approach
root.render(
  // Remove StrictMode in production to avoid double rendering
  <BrowserRouter>
    <ThemeProvider>
      <AuthProvider>
        <ProfileProvider>
          <MessagingProvider>
            <JobsProvider>
              <EventsProvider>
                <NotificationsProvider>
                  <KnowledgeProvider>
                    <App />
                  </KnowledgeProvider>
                </NotificationsProvider>
              </EventsProvider>
            </JobsProvider>
          </MessagingProvider>
        </ProfileProvider>
      </AuthProvider>
    </ThemeProvider>
  </BrowserRouter>
);
