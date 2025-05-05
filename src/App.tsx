
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
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

// Lazy load pages
const Index = lazy(() => import("./pages/Index"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const AlumniDirectory = lazy(() => import("./pages/AlumniDirectory"));
const AlumniProfile = lazy(() => import("./pages/AlumniProfile"));
const AuthCallback = lazy(() => import("./pages/AuthCallback"));
const EventsPage = lazy(() => import("./pages/EventsPage"));
const EventDetailPage = lazy(() => import("./pages/EventDetailPage"));
const CreateEventPage = lazy(() => import("./pages/CreateEventPage"));
const EditEventPage = lazy(() => import("./pages/EditEventPage"));
const JobsListingPage = lazy(() => import("./pages/JobsListingPage"));
const JobDetailPage = lazy(() => import("./pages/JobDetailPage"));
const PostJobPage = lazy(() => import("./pages/PostJobPage"));
const EditJobPage = lazy(() => import("./pages/EditJobPage"));
const MyApplicationsPage = lazy(() => import("./pages/MyApplicationsPage"));
const MessagingPage = lazy(() => import("./pages/MessagingPage"));
const KnowledgeHub = lazy(() => import("./pages/KnowledgeHub"));
const KnowledgePostDetail = lazy(() => import("./pages/KnowledgePostDetail"));
const NewPost = lazy(() => import("./pages/NewPost"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const ProfileSetup = lazy(() => import("./pages/ProfileSetup"));
const CompleteProfile = lazy(() => import("./pages/CompleteProfile"));
const CredentialWallet = lazy(() => import("./pages/CredentialWallet"));
const ShareCredentials = lazy(() => import("./pages/ShareCredentials"));
const SharedCredentials = lazy(() => import("./pages/SharedCredentials"));
const CVMaker = lazy(() => import("./pages/CVMaker"));
const MyNetwork = lazy(() => import("./pages/MyNetwork"));
const NotificationsPage = lazy(() => import("./pages/NotificationsPage"));
const NotificationSettingsPage = lazy(() => import("./pages/NotificationSettingsPage"));
const PrivacySettings = lazy(() => import("./pages/PrivacySettings"));
const MorePage = lazy(() => import("./pages/MorePage"));

// Auth pages
const AuthLayout = lazy(() => import("./pages/auth/AuthLayout"));
const LoginPage = lazy(() => import("./pages/auth/LoginPage"));
const SignupPage = lazy(() => import("./pages/auth/SignupPage"));
const ForgotPasswordPage = lazy(() => import("./pages/auth/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("./pages/auth/ResetPasswordPage"));
const VerifyEmailPage = lazy(() => import("./pages/auth/VerifyEmailPage"));

// Admin pages
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const UserManagement = lazy(() => import("./pages/admin/UserManagement"));
const ContentModeration = lazy(() => import("./pages/admin/ContentModeration"));
const RoleManagement = lazy(() => import("./pages/admin/RoleManagement"));
const Announcements = lazy(() => import("./pages/admin/Announcements"));
const Settings = lazy(() => import("./pages/admin/Settings"));
const AuditLogs = lazy(() => import("./pages/admin/AuditLogs"));

// Mentorship pages
const FindMentors = lazy(() => import("./pages/mentorship/FindMentors"));
const BecomeMentor = lazy(() => import("./pages/mentorship/BecomeMentor"));
const MentorshipDashboard = lazy(() => import("./pages/mentorship/MentorshipDashboard"));
const SuccessStories = lazy(() => import("./pages/mentorship/SuccessStories"));

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const { online } = useNetworkStatus();
  const { isProfileCompleted } = useProfile();

  // Register service worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/serviceWorker.js').then(registration => {
          console.log('ServiceWorker registration successful with scope: ', registration.scope);
        }).catch(error => {
          console.log('ServiceWorker registration failed: ', error);
        });
      });
    }
  }, []);

  // Redirect users to offline page when they lose connection
  useEffect(() => {
    if (!online && location.pathname !== '/offline') {
      // Save the last route to sessionStorage to redirect back when online
      sessionStorage.setItem('lastRoute', location.pathname);
    } else if (online && location.pathname === '/offline') {
      // Redirect back to the last route when connection is restored
      const lastRoute = sessionStorage.getItem('lastRoute') || '/dashboard';
      navigate(lastRoute);
    }
  }, [online, location.pathname, navigate]);

  return (
    <ErrorBoundary>
      <Suspense
        fallback={
          <div className="flex h-screen items-center justify-center">
            <Spinner size="lg" className="text-primary" />
          </div>
        }
      >
        <Routes>
          {/* Home route */}
          <Route path="/" element={<Index />} />

          {/* Auth routes */}
          <Route path="/auth" element={<AuthLayout />}>
            <Route path="login" element={<LoginPage />} />
            <Route path="signup" element={<SignupPage />} />
            <Route path="forgot-password" element={<ForgotPasswordPage />} />
            <Route path="reset-password" element={<ResetPasswordPage />} />
            <Route path="verify-email" element={<VerifyEmailPage />} />
          </Route>

          {/* Core app routes */}
          <Route path="/auth-callback" element={<AuthCallback />} />
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
          <Route path="/offline" element={<div>You are offline</div>} />

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
