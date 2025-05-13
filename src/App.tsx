
import React from 'react';
import { Route, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProfileProvider } from './contexts/ProfileContext';
import { KnowledgeProvider } from './contexts/KnowledgeContext';
import { ThemeProvider } from './components/ui/theme-provider';

// Updated import paths for auth pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/SignupPage'; // Changed from RegisterPage to SignupPage based on file structure
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';

// Main pages
import Dashboard from './pages/Dashboard';
import ProfilePage from './pages/ProfilePage';
import EditProfilePage from './pages/CompleteProfile'; // Updated path
import CredentialWallet from './pages/CredentialWallet';
import ShareCredentials from './pages/ShareCredentials';
import SharedCredentials from './pages/SharedCredentials';
import NetworkPage from './pages/MyNetwork'; // Updated path
import SettingsPage from './pages/NotificationSettingsPage'; // Updated path
import PrivacySettings from './pages/PrivacySettings';

// Knowledge base pages
import KnowledgeBase from './pages/KnowledgeHub'; // Updated path
import PostDetails from './pages/KnowledgePostDetail'; // Updated path

// Admin pages
import AdminPage from './pages/admin/AdminDashboard';
import ContentModeration from './pages/admin/ContentModeration';
import AuditLogs from './pages/admin/AuditLogs';
import FraudDetection from './pages/admin/FraudDetection';

// Create an authentication layout component
import AuthLayout from './pages/auth/AuthLayout';
// Create an admin layout component
import AdminLayout from './layouts/AdminLayout';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ProfileProvider>
          <KnowledgeProvider>
            <Routes>
              {/* Auth routes */}
              <Route path="/" element={<LoginPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              
              {/* Main routes */}
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/edit-profile" element={<EditProfilePage />} />
              <Route path="/credentials" element={<CredentialWallet />} />
              <Route path="/share-credentials" element={<ShareCredentials />} />
              <Route path="/shared/:shareId" element={<SharedCredentials />} />
              <Route path="/network" element={<NetworkPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/privacy-settings" element={<PrivacySettings />} />
              
              {/* Knowledge routes */}
              <Route path="/knowledge" element={<KnowledgeBase />} />
              <Route path="/knowledge/:postId" element={<PostDetails />} />
              
              {/* Admin routes */}
              <Route path="/admin/dashboard" element={<AdminPage />} />
              <Route path="/admin/content-moderation" element={<ContentModeration />} />
              <Route path="/admin/audit-logs" element={<AuditLogs />} />
              <Route path="/admin/fraud-detection" element={<FraudDetection />} />
            </Routes>
          </KnowledgeProvider>
        </ProfileProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
