
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Index from './pages/Index';
import Feed from './pages/Feed';
import Dashboard from './pages/Dashboard';
import CredentialWallet from './pages/CredentialWallet';
import ShareCredentials from './pages/ShareCredentials';
import SharedCredentials from './pages/SharedCredentials';
import AlumniDirectory from './pages/AlumniDirectory';
import AlumniProfile from './pages/AlumniProfile';
import EventsPage from './pages/EventsPage';
import EventDetailPage from './pages/EventDetailPage';
import CreateEventPage from './pages/CreateEventPage';
import EditEventPage from './pages/EditEventPage';
import ProfilePage from './pages/ProfilePage';
import ProfileSetup from './pages/ProfileSetup';
import CompleteProfile from './pages/CompleteProfile';
import KnowledgeHub from './pages/KnowledgeHub';
import KnowledgePostDetail from './pages/KnowledgePostDetail';
import NewPost from './pages/NewPost';
import JobsListingPage from './pages/JobsListingPage';
import JobDetailPage from './pages/JobDetailPage';
import PostJobPage from './pages/PostJobPage';
import EditJobPage from './pages/EditJobPage';
import MyApplicationsPage from './pages/MyApplicationsPage';
import CVMaker from './pages/CVMaker';
import MyNetwork from './pages/MyNetwork';
import MessagingPage from './pages/MessagingPage';
import PrivacySettings from './pages/PrivacySettings';
import NotFound from './pages/NotFound';
import MorePage from './pages/MorePage';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import ContentModeration from './pages/admin/ContentModeration';
import RoleManagement from './pages/admin/RoleManagement';
import Announcements from './pages/admin/Announcements';
import AuditLogs from './pages/admin/AuditLogs';
import Settings from './pages/admin/Settings';

// Auth pages
import AuthLayout from './pages/auth/AuthLayout';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import VerifyEmailPage from './pages/auth/VerifyEmailPage';

// Auth callback handler
import AuthCallback from './pages/AuthCallback';

// Protected route component
import ProtectedRoute from './components/auth/ProtectedRoute';

// Context Providers
import { AuthProvider } from './contexts/AuthContext';
import { ProfileProvider } from './contexts/ProfileContext';
import { ConnectionProvider } from './contexts/ConnectionContext';
import { EventsProvider } from './contexts/EventsContext';
import { JobsProvider } from './contexts/JobsContext';
import { MessagingProvider } from './contexts/MessagingContext';
import { KnowledgeProvider } from './contexts/KnowledgeContext';
import { NotificationsProvider } from './contexts/NotificationsContext';

// Toast provider
import { Toaster } from '@/components/ui/toaster';

// Notification pages
import NotificationsPage from './pages/NotificationsPage';
import NotificationSettingsPage from './pages/NotificationSettingsPage';

import './App.css';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ProfileProvider>
          <ConnectionProvider>
            <EventsProvider>
              <JobsProvider>
                <MessagingProvider>
                  <KnowledgeProvider>
                    <NotificationsProvider>
                      <Routes>
                        {/* Public routes */}
                        <Route path="/" element={<Index />} />
                        <Route path="/auth" element={<AuthLayout />}>
                          <Route path="login" element={<LoginPage />} />
                          <Route path="signup" element={<SignupPage />} />
                          <Route path="forgot-password" element={<ForgotPasswordPage />} />
                          <Route path="reset-password" element={<ResetPasswordPage />} />
                          <Route path="verify-email" element={<VerifyEmailPage />} />
                        </Route>
                        <Route path="/auth/callback" element={<AuthCallback />} />

                        {/* Protected routes */}
                        <Route element={<ProtectedRoute />}>
                          <Route path="/dashboard" element={<Dashboard />} />
                          <Route path="/feed" element={<Feed />} />
                          <Route path="/credential-wallet" element={<CredentialWallet />} />
                          <Route path="/share-credentials" element={<ShareCredentials />} />
                          <Route path="/shared-credentials/:shareId" element={<SharedCredentials />} />
                          <Route path="/alumni-directory" element={<AlumniDirectory />} />
                          <Route path="/profile/:userId" element={<AlumniProfile />} />
                          <Route path="/profile" element={<ProfilePage />} />
                          <Route path="/profile-setup" element={<ProfileSetup />} />
                          <Route path="/complete-profile" element={<CompleteProfile />} />
                          <Route path="/events" element={<EventsPage />} />
                          <Route path="/events/:id" element={<EventDetailPage />} />
                          <Route path="/events/create" element={<CreateEventPage />} />
                          <Route path="/events/edit/:id" element={<EditEventPage />} />
                          <Route path="/knowledge" element={<KnowledgeHub />} />
                          <Route path="/knowledge/:postId" element={<KnowledgePostDetail />} />
                          <Route path="/knowledge/new" element={<NewPost />} />
                          <Route path="/jobs" element={<JobsListingPage />} />
                          <Route path="/jobs/:id" element={<JobDetailPage />} />
                          <Route path="/jobs/post" element={<PostJobPage />} />
                          <Route path="/jobs/edit/:id" element={<EditJobPage />} />
                          <Route path="/my-applications" element={<MyApplicationsPage />} />
                          <Route path="/cv-maker" element={<CVMaker />} />
                          <Route path="/network" element={<MyNetwork />} />
                          <Route path="/messages" element={<MessagingPage />} />
                          <Route path="/messages/:conversationId" element={<MessagingPage />} />
                          <Route path="/privacy-settings" element={<PrivacySettings />} />
                          <Route path="/more" element={<MorePage />} />
                          
                          {/* Notification routes */}
                          <Route path="/notifications" element={<NotificationsPage />} />
                          <Route path="/notification-settings" element={<NotificationSettingsPage />} />

                          {/* Admin routes */}
                          <Route path="/admin" element={<AdminDashboard />} />
                          <Route path="/admin/users" element={<UserManagement />} />
                          <Route path="/admin/content" element={<ContentModeration />} />
                          <Route path="/admin/roles" element={<RoleManagement />} />
                          <Route path="/admin/announcements" element={<Announcements />} />
                          <Route path="/admin/audit" element={<AuditLogs />} />
                          <Route path="/admin/settings" element={<Settings />} />
                        </Route>

                        {/* 404 - Not found */}
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                      <Toaster />
                    </NotificationsProvider>
                  </KnowledgeProvider>
                </MessagingProvider>
              </JobsProvider>
            </EventsProvider>
          </ConnectionProvider>
        </ProfileProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
