import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProfileProvider } from './contexts/ProfileContext';
import { KnowledgeProvider } from './contexts/KnowledgeContext';
import { ThemeProvider } from './contexts/ThemeContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import Dashboard from './pages/Dashboard';
import ProfilePage from './pages/ProfilePage';
import EditProfilePage from './pages/EditProfilePage';
import CredentialWallet from './pages/CredentialWallet';
import ShareCredentials from './pages/ShareCredentials';
import SharedCredentials from './pages/SharedCredentials';
import NetworkPage from './pages/NetworkPage';
import SettingsPage from './pages/SettingsPage';
import AdminPage from './pages/admin/AdminDashboard';
import ContentModeration from './pages/admin/ContentModeration';
import AuditLogs from './pages/admin/AuditLogs';
import KnowledgeBase from './pages/KnowledgeBase';
import PostDetails from './pages/PostDetails';
import PrivacySettings from './pages/PrivacySettings';

// Import the new FraudDetection page
import FraudDetection from './pages/admin/FraudDetection';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <Router>
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
      </Router>
    </ThemeProvider>
  );
};

export default App;
