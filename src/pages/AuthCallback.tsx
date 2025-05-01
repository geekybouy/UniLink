
import { useEffect, useState } from 'react';
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
  
  useEffect(() => {
    // If we're not loading anymore, handle redirect or error
    if (!isLoading) {
      if (user) {
        console.log('Authentication successful, redirecting to dashboard');
        toast.success('Successfully signed in!');
        navigate('/dashboard');
      } else {
        // If user is still null after loading is complete, there was likely an error
        console.error('Authentication failed, no user found');
        setAuthError('Authentication failed. Please try again.');
        
        // Add a timeout to redirect to login if auth fails
        const timeoutId = setTimeout(() => {
          navigate('/auth/login');
        }, 3000);
        
        return () => clearTimeout(timeoutId);
      }
    }
  }, [user, isLoading, navigate]);

  // Add a safety mechanism to avoid infinite loading
  useEffect(() => {
    const MAX_ATTEMPTS = 3;
    
    if (isLoading) {
      const timeoutId = setTimeout(() => {
        setAttemptCount(prev => {
          const newCount = prev + 1;
          if (newCount >= MAX_ATTEMPTS) {
            console.error('Authentication timed out');
            setAuthError('Authentication timed out. Please try again.');
            navigate('/auth/login');
          }
          return newCount;
        });
      }, 5000); // Check every 5 seconds
      
      return () => clearTimeout(timeoutId);
    }
  }, [isLoading, navigate]);

  if (authError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md w-full p-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{authError}</AlertDescription>
          </Alert>
          <p className="text-sm text-muted-foreground mt-2">Redirecting to login page...</p>
        </div>
      </div>
    );
  }

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
};

export default AuthCallback;
