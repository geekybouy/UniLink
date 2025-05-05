
import React, { lazy, Suspense, useEffect } from 'react';
import { 
  BrowserRouter as Router,
  Routes, 
  Route,
  useLocation, 
  useNavigationType,
  Outlet
} from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

// Context Providers
import { ThemeProvider } from '@/components/ui/theme-provider';
import { AuthProvider } from '@/contexts/AuthContext';
import { MentorshipProvider } from '@/contexts/MentorshipContext';
import { JobsProvider } from '@/contexts/JobsContext';
import { EventsProvider } from '@/contexts/EventsContext';
import { ProfileProvider } from '@/contexts/ProfileContext';
import { ConnectionProvider } from '@/contexts/ConnectionContext';
import { MessagingProvider } from '@/contexts/MessagingContext';
import { NotificationsProvider } from '@/contexts/NotificationsContext';
import { KnowledgeProvider } from '@/contexts/KnowledgeContext';

// Services
import analytics from './services/analytics';
import { initErrorMonitoring, setErrorUser } from './services/errorMonitoring';
import performanceMonitor from './services/performance';

// Utils
import { useAuth } from '@/contexts/AuthContext';
import { Toaster } from '@/components/ui/toaster';
import { Spinner } from '@/components/ui/spinner';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import ErrorBoundary from './components/ErrorBoundary';

// Eagerly loaded components
import NotFound from './pages/NotFound';

// Lazily loaded page components with code splitting
const Index = lazy(() => import('./pages/Index'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const AlumniDirectory = lazy(() => import('./pages/AlumniDirectory'));
const Feed = lazy(() => import('./pages/Feed'));
const AlumniProfile = lazy(() => import('./pages/AlumniProfile'));
const JobsListingPage = lazy(() => import('./pages/JobsListingPage'));
const EventsPage = lazy(() => import('./pages/EventsPage'));
const BecomeMentor = lazy(() => import('./pages/mentorship/BecomeMentor'));
const FindMentors = lazy(() => import('./pages/mentorship/FindMentors'));
const MentorshipDashboard = lazy(() => import('./pages/mentorship/MentorshipDashboard'));
const SuccessStories = lazy(() => import('./pages/mentorship/SuccessStories'));
const AuthLayout = lazy(() => import('./pages/auth/AuthLayout'));
const LoginPage = lazy(() => import('./pages/auth/LoginPage'));
const SignupPage = lazy(() => import('./pages/auth/SignupPage'));
const ForgotPasswordPage = lazy(() => import('./pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/auth/ResetPasswordPage'));
const VerifyEmailPage = lazy(() => import('./pages/auth/VerifyEmailPage'));
const AuthCallback = lazy(() => import('./pages/AuthCallback'));

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <Spinner size="lg" />
  </div>
);

function RouteChangeTracker() {
  const location = useLocation();
  const navigationType = useNavigationType();

  useEffect(() => {
    // Track page view
    analytics.pageView(location.pathname + location.search);
    
    // Scroll to top on route change, but not on POP navigation
    if (navigationType !== 'POP') {
      window.scrollTo(0, 0);
    }
  }, [location, navigationType]);

  return <Outlet />;
}

function AuthMonitor() {
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      // Set user identity in analytics
      analytics.setUser(user.id, { email: user.email });
      
      // Set user identity in error monitoring
      setErrorUser(user.id, { email: user.email });
    } else {
      // Clear user identity when logged out
      analytics.setUser(null);
      setErrorUser(null);
    }
  }, [user]);

  return <Outlet />;
}

function AppContent() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route element={<RouteChangeTracker />}>
          <Route element={<AuthMonitor />}>
            <Route path="/" element={<Index />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/alumni-directory" element={<AlumniDirectory />} />
            <Route path="/feed" element={<Feed />} />
            <Route path="/profile/:userId?" element={<AlumniProfile />} />
            <Route path="/jobs" element={<JobsListingPage />} />
            <Route path="/events" element={<EventsPage />} />
            
            {/* Mentorship Routes */}
            <Route path="/mentorship">
              <Route path="dashboard" element={<MentorshipDashboard />} />
              <Route path="become-mentor" element={<BecomeMentor />} />
              <Route path="find-mentors" element={<FindMentors />} />
              <Route path="success-stories" element={<SuccessStories />} />
            </Route>
            
            {/* Auth Routes */}
            <Route path="/auth" element={<AuthLayout />}>
              <Route path="login" element={<LoginPage />} />
              <Route path="signup" element={<SignupPage />} />
              <Route path="forgot-password" element={<ForgotPasswordPage />} />
              <Route path="reset-password" element={<ResetPasswordPage />} />
              <Route path="verify-email" element={<VerifyEmailPage />} />
              <Route path="callback" element={<AuthCallback />} />
            </Route>
            
            <Route path="*" element={<NotFound />} />
          </Route>
        </Route>
      </Routes>
      
      <Toaster />
    </ErrorBoundary>
  );
}

function App() {
  // Initialize services
  useEffect(() => {
    // Initialize analytics
    analytics.initialize();
    
    // Initialize error monitoring
    initErrorMonitoring();
    
    // Track initial page load
    performanceMonitor.measureComponentRender('App')();
    
    // Report initial load
    analytics.trackEvent('app_loaded');
  }, []);
  
  return (
    <React.StrictMode>
      <ErrorBoundary>
        <ThemeProvider defaultTheme="light" storageKey="unilink-theme">
          <HelmetProvider>
            <Router>
              <ScrollArea className="h-screen">
                <AuthProvider>
                  <ProfileProvider>
                    <ConnectionProvider>
                      <MessagingProvider>
                        <NotificationsProvider>
                          <JobsProvider>
                            <EventsProvider>
                              <MentorshipProvider>
                                <KnowledgeProvider>
                                  <Suspense fallback={<LoadingFallback />}>
                                    <AppContent />
                                  </Suspense>
                                </KnowledgeProvider>
                              </MentorshipProvider>
                            </EventsProvider>
                          </JobsProvider>
                        </NotificationsProvider>
                      </MessagingProvider>
                    </ConnectionProvider>
                  </ProfileProvider>
                </AuthProvider>
              </ScrollArea>
            </Router>
          </HelmetProvider>
        </ThemeProvider>
      </ErrorBoundary>
    </React.StrictMode>
  );
}

export default App;
