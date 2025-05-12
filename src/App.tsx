import { Routes, Route, useLocation } from "react-router-dom";
import { lazy, Suspense, useEffect } from "react";
import { useNetworkStatus } from "./hooks/use-network-status";

// Import styles
import "./App.css";

// Core components
import { Spinner } from "./components/ui/spinner";
import { Toaster } from "./components/ui/toaster";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { useProfile } from "./contexts/ProfileContext";
import NotFound from "./pages/NotFound";

// Eager load auth components to avoid dynamic import issues
import AuthLayout from "./pages/auth/AuthLayout";
import LoginPage from "./pages/auth/LoginPage";
import SignupPage from "./pages/auth/SignupPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
import VerifyEmailPage from "./pages/auth/VerifyEmailPage";

// Lazy load the AuthCallback component with a separate loading fallback
const AuthCallback = lazy(() => import("./pages/AuthCallback"));

// Optimize lazy loading with proper chunk naming for better caching
const Index = lazy(() => import(/* webpackChunkName: "index-page" */ "./pages/Index"));
const Dashboard = lazy(() => import(/* webpackChunkName: "dashboard-page" */ "./pages/Dashboard"));
const AlumniDirectory = lazy(() => import(/* webpackChunkName: "alumni-directory-page" */ "./pages/AlumniDirectory"));
const AlumniProfile = lazy(() => import(/* webpackChunkName: "alumni-profile-page" */ "./pages/AlumniProfile"));
const EventsPage = lazy(() => import(/* webpackChunkName: "events-page" */ "./pages/EventsPage"));
const EventDetailPage = lazy(() => import(/* webpackChunkName: "event-detail-page" */ "./pages/EventDetailPage"));
const CreateEventPage = lazy(() => import(/* webpackChunkName: "create-event-page" */ "./pages/CreateEventPage"));
const EditEventPage = lazy(() => import(/* webpackChunkName: "edit-event-page" */ "./pages/EditEventPage"));
const JobsListingPage = lazy(() => import(/* webpackChunkName: "jobs-listing-page" */ "./pages/JobsListingPage"));
const JobDetailPage = lazy(() => import(/* webpackChunkName: "job-detail-page" */ "./pages/JobDetailPage"));
const PostJobPage = lazy(() => import(/* webpackChunkName: "post-job-page" */ "./pages/PostJobPage"));
const EditJobPage = lazy(() => import(/* webpackChunkName: "edit-job-page" */ "./pages/EditJobPage"));
const MyApplicationsPage = lazy(() => import(/* webpackChunkName: "my-applications-page" */ "./pages/MyApplicationsPage"));
const MessagingPage = lazy(() => import(/* webpackChunkName: "messaging-page" */ "./pages/MessagingPage"));
const KnowledgeHub = lazy(() => import(/* webpackChunkName: "knowledge-hub-page" */ "./pages/KnowledgeHub"));
const KnowledgePostDetail = lazy(() => import(/* webpackChunkName: "knowledge-post-detail-page" */ "./pages/KnowledgePostDetail"));
const NewPost = lazy(() => import(/* webpackChunkName: "new-post-page" */ "./pages/NewPost"));
const ProfilePage = lazy(() => import(/* webpackChunkName: "profile-page" */ "./pages/ProfilePage"));
const ProfileSetup = lazy(() => import(/* webpackChunkName: "profile-setup-page" */ "./pages/ProfileSetup"));
const CompleteProfile = lazy(() => import(/* webpackChunkName: "complete-profile-page" */ "./pages/CompleteProfile"));
const CredentialWallet = lazy(() => import(/* webpackChunkName: "credential-wallet-page" */ "./pages/CredentialWallet"));
const ShareCredentials = lazy(() => import(/* webpackChunkName: "share-credentials-page" */ "./pages/ShareCredentials"));
const SharedCredentials = lazy(() => import(/* webpackChunkName: "shared-credentials-page" */ "./pages/SharedCredentials"));
const CVMaker = lazy(() => import(/* webpackChunkName: "cv-maker-page" */ "./pages/CVMaker"));
const MyNetwork = lazy(() => import(/* webpackChunkName: "my-network-page" */ "./pages/MyNetwork"));
const NotificationsPage = lazy(() => import(/* webpackChunkName: "notifications-page" */ "./pages/NotificationsPage"));
const NotificationSettingsPage = lazy(() => import(/* webpackChunkName: "notification-settings-page" */ "./pages/NotificationSettingsPage"));
const PrivacySettings = lazy(() => import(/* webpackChunkName: "privacy-settings-page" */ "./pages/PrivacySettings"));
const MorePage = lazy(() => import(/* webpackChunkName: "more-page" */ "./pages/MorePage"));
const AICVMaker = lazy(() => import(/* webpackChunkName: "ai-cv-maker-page" */ "./pages/AICVMaker"));

// Admin pages
const AdminDashboard = lazy(() => import(/* webpackChunkName: "admin-dashboard-page" */ "./pages/admin/AdminDashboard"));
const UserManagement = lazy(() => import(/* webpackChunkName: "user-management-page" */ "./pages/admin/UserManagement"));
const ContentModeration = lazy(() => import(/* webpackChunkName: "content-moderation-page" */ "./pages/admin/ContentModeration"));
const RoleManagement = lazy(() => import(/* webpackChunkName: "role-management-page" */ "./pages/admin/RoleManagement"));
const Announcements = lazy(() => import(/* webpackChunkName: "announcements-page" */ "./pages/admin/Announcements"));
const Settings = lazy(() => import(/* webpackChunkName: "settings-page" */ "./pages/admin/Settings"));
const AuditLogs = lazy(() => import(/* webpackChunkName: "audit-logs-page" */ "./pages/admin/AuditLogs"));

// Mentorship pages
const FindMentors = lazy(() => import(/* webpackChunkName: "find-mentors-page" */ "./pages/mentorship/FindMentors"));
const BecomeMentor = lazy(() => import(/* webpackChunkName: "become-mentor-page" */ "./pages/mentorship/BecomeMentor"));
const MentorshipDashboard = lazy(() => import(/* webpackChunkName: "mentorship-dashboard-page" */ "./pages/mentorship/MentorshipDashboard"));
const SuccessStories = lazy(() => import(/* webpackChunkName: "success-stories-page" */ "./pages/mentorship/SuccessStories"));

// Create better loading fallback component
const LoadingFallback = () => (
  <div className="flex h-screen items-center justify-center bg-background">
    <Spinner size="lg" className="text-primary" />
  </div>
);

// Create offline fallback component
const OfflineFallback = () => (
  <div className="flex h-screen flex-col items-center justify-center bg-background text-foreground p-4 text-center">
    <div className="bg-card p-8 rounded-lg shadow-lg max-w-md">
      <h2 className="text-2xl font-bold mb-4">You are offline</h2>
      <p className="mb-4">Please check your internet connection and try again.</p>
      <button 
        onClick={() => window.location.reload()}
        className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
      >
        Retry Connection
      </button>
    </div>
  </div>
);

function App() {
  const location = useLocation();
  const { online } = useNetworkStatus();
  const { isProfileCompleted } = useProfile();

  // Register service worker - moved to a useEffect with cleanup
  useEffect(() => {
    let registration: ServiceWorkerRegistration | undefined;

    const registerServiceWorker = async () => {
      if ('serviceWorker' in navigator) {
        try {
          registration = await navigator.serviceWorker.register('/serviceWorker.js');
          console.log('ServiceWorker registration successful with scope: ', registration.scope);
        } catch (error) {
          console.log('ServiceWorker registration failed: ', error);
        }
      }
    };

    registerServiceWorker();

    // Cleanup function
    return () => {
      if (registration) {
        registration.unregister().catch(error => {
          console.error('Error unregistering service worker:', error);
        });
      }
    };
  }, []);

  // Handle offline state more efficiently
  useEffect(() => {
    if (!online && location.pathname !== '/offline') {
      // Save the last route to sessionStorage to redirect back when online
      sessionStorage.setItem('lastRoute', location.pathname);
    }
  }, [online, location.pathname]);

  // If offline, show offline fallback component
  if (!online && location.pathname !== '/offline') {
    return <OfflineFallback />;
  }

  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Home route */}
          <Route path="/" element={<Index />} />

          {/* Auth routes - now eagerly loaded */}
          <Route path="/auth" element={<AuthLayout />}>
            <Route path="login" element={<LoginPage />} />
            <Route path="signup" element={<SignupPage />} />
            <Route path="forgot-password" element={<ForgotPasswordPage />} />
            <Route path="reset-password" element={<ResetPasswordPage />} />
            <Route path="verify-email" element={<VerifyEmailPage />} />
          </Route>

          {/* Core app routes */}
          <Route path="/auth-callback" element={
            <Suspense fallback={<LoadingFallback />}>
              <AuthCallback />
            </Suspense>
          } />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/alumni-directory" element={<AlumniDirectory />} />
          <Route path="/alumni/:id" element={<AlumniProfile />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/events/:id" element={<EventDetailPage />} />
          <Route path="/events/create" element={<CreateEventPage />} />
          <Route path="/events/:id/edit" element={<EditEventPage />} />
          <Route path="/jobs" element={<JobsListingPage />} />
          <Route path="/jobs/:id" element={<JobDetailPage />} />
          <Route path="/jobs/post" element={<PostJobPage />} />
          <Route path="/jobs/:id/edit" element={<EditJobPage />} />
          <Route path="/my-applications" element={<MyApplicationsPage />} />
          <Route path="/messages" element={<MessagingPage />} />
          <Route path="/messages/:id" element={<MessagingPage />} />
          <Route path="/knowledge" element={<KnowledgeHub />} />
          <Route path="/knowledge/:id" element={<KnowledgePostDetail />} />
          <Route path="/knowledge/new" element={<NewPost />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/profile-setup" element={<ProfileSetup />} />
          <Route path="/complete-profile" element={<CompleteProfile />} />
          <Route path="/credential-wallet" element={<CredentialWallet />} />
          <Route path="/share-credentials/:id" element={<ShareCredentials />} />
          <Route path="/c/:shareCode" element={<SharedCredentials />} />
          <Route path="/cv-maker" element={<CVMaker />} />
          <Route path="/my-network" element={<MyNetwork />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/notification-settings" element={<NotificationSettingsPage />} />
          <Route path="/privacy-settings" element={<PrivacySettings />} />
          <Route path="/more" element={<MorePage />} />
          <Route path="/offline" element={<OfflineFallback />} />
          <Route path="/ai-cv-maker" element={<AICVMaker />} />

          {/* Admin routes */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<UserManagement />} />
          <Route path="/admin/content" element={<ContentModeration />} />
          <Route path="/admin/roles" element={<RoleManagement />} />
          <Route path="/admin/announcements" element={<Announcements />} />
          <Route path="/admin/settings" element={<Settings />} />
          <Route path="/admin/logs" element={<AuditLogs />} />

          {/* Mentorship routes */}
          <Route path="/mentorship/find-mentors" element={<FindMentors />} />
          <Route path="/mentorship/become-mentor" element={<BecomeMentor />} />
          <Route path="/mentorship/dashboard" element={<MentorshipDashboard />} />
          <Route path="/mentorship/success-stories" element={<SuccessStories />} />

          {/* Catch-all route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>

      <Toaster />
    </ErrorBoundary>
  );
}

export default App;
