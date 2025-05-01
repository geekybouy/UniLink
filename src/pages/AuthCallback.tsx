
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Spinner } from '@/components/ui/spinner';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

const AuthCallback = () => {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    // Authentication is handled in AuthContext
    // This component is just for showing loading state and redirecting
    if (!isLoading) {
      if (user) {
        console.log('Authentication successful, redirecting to dashboard');
        toast.success('Successfully signed in!');
        navigate('/dashboard');
      } else {
        console.error('Authentication failed, no user found');
        toast.error('Authentication failed. Please try again.');
        navigate('/');
      }
    }
  }, [user, isLoading, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <Spinner />
        <p className="text-muted-foreground">Completing sign in...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
