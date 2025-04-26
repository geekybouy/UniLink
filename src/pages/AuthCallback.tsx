
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Spinner } from '@/components/ui/spinner';
import { toast } from 'sonner';

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        console.log('Auth callback page loaded with URL:', window.location.href);
        
        // Get the current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Initial session check error:', sessionError);
          throw sessionError;
        }

        if (!session) {
          console.log('No session found in callback, attempting to process OAuth response');
          
          // PKCE flow should automatically exchange the code for a session
          // Let's explicitly get the session again
          const { data, error: exchangeError } = await supabase.auth.refreshSession();
          
          if (exchangeError) {
            console.error('Failed to exchange code for session:', exchangeError);
            throw exchangeError;
          }
          
          if (!data.session) {
            console.error('No session after exchange attempt');
            throw new Error('Authentication failed - no session available');
          }
          
          console.log('Successfully obtained session after exchange');
        }

        console.log('Successfully authenticated, checking profile');
        // Get the latest session
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        if (currentSession?.user) {
          // Check if user profile exists
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', currentSession.user.id)
            .single();

          if (profileError && profileError.code !== 'PGRST116') {
            console.error('Profile fetch error:', profileError);
            throw profileError;
          }

          if (!profile) {
            console.log('Creating new profile');
            const { error: insertError } = await supabase
              .from('profiles')
              .insert({
                user_id: currentSession.user.id,
                email: currentSession.user.email || '',
                full_name: currentSession.user.user_metadata.full_name || '',
                password: '' // Required field based on your schema
              });

            if (insertError) {
              console.error('Profile creation error:', insertError);
              throw insertError;
            }
            
            toast.success('Welcome to UniLink!');
            navigate('/complete-profile');
            return;
          }

          const requiredFields = ['full_name', 'email'];
          const isComplete = requiredFields.every(field => 
            profile[field as keyof typeof profile]
          );

          if (isComplete) {
            toast.success('Welcome back to UniLink!');
            navigate('/dashboard');
          } else {
            navigate('/complete-profile');
          }
        } else {
          throw new Error('No user in session after authentication');
        }
      } catch (error: any) {
        console.error('Auth callback error:', error);
        toast.error('Authentication failed: ' + (error.message || 'Please try again'));
        navigate('/');
      }
    };

    handleCallback();
  }, [navigate]);

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
