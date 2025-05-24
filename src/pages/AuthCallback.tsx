
import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Spinner } from '@/components/ui/spinner';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
  const [authError, setAuthError] = useState<string | null>(null);
  const [attemptCount, setAttemptCount] = useState(0);
  const [showingLoader, setShowingLoader] = useState(true);

  // Prevent double navigation
  const hasNavigated = useRef(false);

  useEffect(() => {
    // Only navigate if not loading and haven't navigated yet
    if (!isLoading && !hasNavigated.current) {
      if (user) {
        hasNavigated.current = true;
        console.log('[AuthCallback] Auth successful, redirecting to dashboard.');
        toast.success('Successfully signed in!');
        navigate('/dashboard', { replace: true });
      } else {
        setAuthError('Authentication failed. Please try again.');
        setShowingLoader(false);
        // Redirect to login after showing error
        const timeoutId = setTimeout(() => {
          if (!hasNavigated.current) {
            hasNavigated.current = true;
            navigate('/login', { replace: true });
          }
        }, 3500);
        return () => clearTimeout(timeoutId);
      }
    }
  }, [user, isLoading, navigate]);

  // Add a "safety net" to never show a blank white page
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowingLoader(false);
      if (!user && !authError && !isLoading && !hasNavigated.current) {
        setAuthError('Authentication timed out. Please try again.');
        if (!hasNavigated.current) {
          hasNavigated.current = true;
          navigate('/login', { replace: true });
        }
      }
    }, 12000); // Max wait time is 12s
    return () => clearTimeout(timer);
  }, [user, isLoading, authError, navigate]);

  if (authError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md w-full p-4">
          <Alert variant="destructive">
            <AlertCircle className="h-5 w-5 mr-2" />
            <AlertDescription>{authError}</AlertDescription>
          </Alert>
          <p className="text-sm text-muted-foreground mt-2">Redirecting to login page...</p>
        </div>
      </div>
    );
  }

  if (showingLoader || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Spinner />
          <p className="text-muted-foreground">Completing sign in...</p>
          {attemptCount > 0 && (
            <p className="text-sm text-muted-foreground">Still working... {attemptCount}/3</p>
          )}
        </div>
      </div>
    );
  }

  // Never render a blank screen
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <Alert variant="destructive">
          <AlertCircle className="h-5 w-5 mr-2" />
          <AlertDescription>Something went wrong. Try again.</AlertDescription>
        </Alert>
      </div>
    </div>
  );
};

export default AuthCallback;

