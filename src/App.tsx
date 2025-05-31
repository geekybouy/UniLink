
import React from 'react';
import { BrowserRouter,Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProfileProvider } from './contexts/ProfileContext';
import { KnowledgeProvider } from './contexts/KnowledgeContext';
import { ThemeProvider } from './components/ui/theme-provider';
import { SpeedInsights } from "@vercel/speed-insights/react"

// Import page components
import Index from './pages/Index';
// Auth pages
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import AuthCallback from './pages/AuthCallback';
// Main protected pages
import Dashboard from './pages/Dashboard';
import { EventsProvider } from './contexts/EventsContext';
import { MessagingProvider } from './contexts/MessagingContext';
import { NotificationsProvider } from './contexts/NotificationsContext';
import { JobsProvider } from './contexts/JobsContext';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Import route arrays
import { mainRoutes } from './routes/MainRoutes';
import { knowledgeRoutes } from './routes/KnowledgeRoutes';
import { adminRoutes } from './routes/AdminRoutes';
import { systemRoutes } from './routes/SystemRoutes';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <ProfileProvider>
            <MessagingProvider>
              <JobsProvider>
                <EventsProvider>
                  <NotificationsProvider>
                    <KnowledgeProvider>
                      <Routes>
                        {/* PUBLIC ROUTES */}
                        <Route path="/" element={<Index />} />
                        {/* Add other public informational pages here if you want (About, Features, etc.) */}
                        {/* <Route path="/about" element={<AboutPage />} /> */}
                        {/* <Route path="/features" element={<FeaturesPage />} /> */}

                        {/* AUTH ROUTES */}
                        <Route path="/auth/login" element={<LoginPage />} />
                        <Route path="/auth/signup" element={<SignupPage />} />
                        <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />
                        <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
                        <Route path="/auth/callback" element={<AuthCallback />} />

                        {/* PROTECTED ROUTES */}
                        <Route element={<ProtectedRoute />}>
                          <Route path="/dashboard" element={<Dashboard />} />
                          {/* Place other protected routes here */}
                          {mainRoutes}
                          {knowledgeRoutes}
                          {adminRoutes}
                          {systemRoutes}
                        </Route>

                        {/* Fallback */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                      </Routes>
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
};

export default App;
