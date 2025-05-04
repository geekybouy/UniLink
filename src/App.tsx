
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Index from "@/pages/Index";
import Dashboard from "@/pages/Dashboard";
import NotFound from "@/pages/NotFound";
import CVMaker from "@/pages/CVMaker";
import CredentialWallet from "@/pages/CredentialWallet";
import AuthCallback from "@/pages/AuthCallback";
import CompleteProfile from "@/pages/CompleteProfile";
import ProfileSetup from "@/pages/ProfileSetup";
import Feed from "@/pages/Feed";
import NewPost from "@/pages/NewPost";
import AlumniProfile from "@/pages/AlumniProfile";
import ShareCredentials from "@/pages/ShareCredentials";
import SharedCredentials from "@/pages/SharedCredentials";
import ProfilePage from "@/pages/ProfilePage";
import AlumniDirectory from "@/pages/AlumniDirectory";
import MyNetwork from "@/pages/MyNetwork";
import PrivacySettings from "@/pages/PrivacySettings";
import MessagingPage from "@/pages/MessagingPage";
import EventsPage from "@/pages/EventsPage";
import EventDetailPage from "@/pages/EventDetailPage";
import CreateEventPage from "@/pages/CreateEventPage";
import EditEventPage from "@/pages/EditEventPage";

// Job board pages
import JobsListingPage from "@/pages/JobsListingPage";
import JobDetailPage from "@/pages/JobDetailPage";
import PostJobPage from "@/pages/PostJobPage";
import EditJobPage from "@/pages/EditJobPage";
import MyApplicationsPage from "@/pages/MyApplicationsPage";

// Auth pages
import AuthLayout from "@/pages/auth/AuthLayout";
import LoginPage from "@/pages/auth/LoginPage";
import SignupPage from "@/pages/auth/SignupPage";
import ForgotPasswordPage from "@/pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "@/pages/auth/ResetPasswordPage";
import VerifyEmailPage from "@/pages/auth/VerifyEmailPage";

// Auth context and protected route
import { AuthProvider } from "@/contexts/AuthContext";
import { ProfileProvider } from "@/contexts/ProfileContext";
import { ConnectionProvider } from "@/contexts/ConnectionContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { MessagingProvider } from "@/contexts/MessagingContext";
import { EventsProvider } from "@/contexts/EventsContext";
import { JobsProvider } from "@/contexts/JobsContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

// UI components
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "sonner";
import "@/App.css";

function App() {
  return (
    <Router>
      <AuthProvider>
        <ProfileProvider>
          <ConnectionProvider>
            <NotificationProvider>
              <MessagingProvider>
                <EventsProvider>
                  <JobsProvider>
                    <Routes>
                      {/* Public routes */}
                      <Route path="/" element={<Index />} />
                      <Route path="/auth/callback" element={<AuthCallback />} />
                      <Route path="/shared/:shareId" element={<SharedCredentials />} />

                      {/* Authentication routes */}
                      <Route path="/auth" element={<AuthLayout />}>
                        <Route path="login" element={<LoginPage />} />
                        <Route path="signup" element={<SignupPage />} />
                        <Route path="forgot-password" element={<ForgotPasswordPage />} />
                        <Route path="reset-password" element={<ResetPasswordPage />} />
                        <Route path="verify-email" element={<VerifyEmailPage />} />
                      </Route>

                      {/* Protected routes */}
                      <Route path="/dashboard" element={
                        <ProtectedRoute>
                          <Dashboard />
                        </ProtectedRoute>
                      } />
                      <Route path="/cv-maker" element={
                        <ProtectedRoute>
                          <CVMaker />
                        </ProtectedRoute>
                      } />
                      <Route path="/credential-wallet" element={
                        <ProtectedRoute>
                          <CredentialWallet />
                        </ProtectedRoute>
                      } />
                      {/* Fix for the /credentials route - redirect to /credential-wallet */}
                      <Route path="/credentials" element={
                        <ProtectedRoute>
                          <CredentialWallet />
                        </ProtectedRoute>
                      } />
                      <Route path="/share-credentials" element={
                        <ProtectedRoute>
                          <ShareCredentials />
                        </ProtectedRoute>
                      } />
                      <Route path="/complete-profile" element={
                        <ProtectedRoute>
                          <CompleteProfile />
                        </ProtectedRoute>
                      } />
                      <Route path="/profile-setup" element={
                        <ProtectedRoute>
                          <ProfileSetup />
                        </ProtectedRoute>
                      } />
                      <Route path="/feed" element={
                        <ProtectedRoute>
                          <Feed />
                        </ProtectedRoute>
                      } />
                      <Route path="/new-post" element={
                        <ProtectedRoute>
                          <NewPost />
                        </ProtectedRoute>
                      } />
                      <Route path="/alumni/:id" element={
                        <ProtectedRoute>
                          <ProfilePage />
                        </ProtectedRoute>
                      } />
                      <Route path="/profile" element={
                        <ProtectedRoute>
                          <ProfilePage />
                        </ProtectedRoute>
                      } />
                      <Route path="/profile/:id" element={
                        <ProtectedRoute>
                          <ProfilePage />
                        </ProtectedRoute>
                      } />
                      <Route path="/alumni-directory" element={
                        <ProtectedRoute>
                          <AlumniDirectory />
                        </ProtectedRoute>
                      } />
                      <Route path="/network" element={
                        <ProtectedRoute>
                          <MyNetwork />
                        </ProtectedRoute>
                      } />
                      <Route path="/privacy-settings" element={
                        <ProtectedRoute>
                          <PrivacySettings />
                        </ProtectedRoute>
                      } />
                      <Route path="/messages" element={
                        <ProtectedRoute>
                          <MessagingPage />
                        </ProtectedRoute>
                      } />
                      
                      {/* Events routes */}
                      <Route path="/events" element={
                        <ProtectedRoute>
                          <EventsPage />
                        </ProtectedRoute>
                      } />
                      <Route path="/events/:id" element={
                        <ProtectedRoute>
                          <EventDetailPage />
                        </ProtectedRoute>
                      } />
                      <Route path="/events/new" element={
                        <ProtectedRoute>
                          <CreateEventPage />
                        </ProtectedRoute>
                      } />
                      <Route path="/events/:id/edit" element={
                        <ProtectedRoute>
                          <EditEventPage />
                        </ProtectedRoute>
                      } />
                      
                      {/* Job Board routes */}
                      <Route path="/jobs" element={
                        <ProtectedRoute>
                          <JobsListingPage />
                        </ProtectedRoute>
                      } />
                      <Route path="/jobs/:id" element={
                        <ProtectedRoute>
                          <JobDetailPage />
                        </ProtectedRoute>
                      } />
                      <Route path="/jobs/post" element={
                        <ProtectedRoute>
                          <PostJobPage />
                        </ProtectedRoute>
                      } />
                      <Route path="/jobs/:id/edit" element={
                        <ProtectedRoute>
                          <EditJobPage />
                        </ProtectedRoute>
                      } />
                      <Route path="/my-applications" element={
                        <ProtectedRoute>
                          <MyApplicationsPage />
                        </ProtectedRoute>
                      } />
                      
                      {/* 404 route */}
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                    
                    {/* Toast notifications */}
                    <SonnerToaster position="top-center" richColors />
                    <Toaster />
                  </JobsProvider>
                </EventsProvider>
              </MessagingProvider>
            </NotificationProvider>
          </ConnectionProvider>
        </ProfileProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
