
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
        console.log('Auth callback page loaded');
        
        // Get the current session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback session error:', error);
          throw error;
        }
        
        if (!session) {
          console.log('No session found in callback, attempting to exchange code for session');
          
          // Try to refresh the session by handling the URL hash
          // This covers the OAuth redirect scenario
          const { error: exchangeError } = await supabase.auth.refreshSession();
          if (exchangeError) {
            console.error('Failed to exchange code for session:', exchangeError);
            throw exchangeError;
          }
          
          // Try to get session again after exchange
          const { data: { session: newSession }, error: newSessionError } = await supabase.auth.getSession();
          if (newSessionError || !newSession) {
            console.error('Still no session after exchange:', newSessionError);
            throw newSessionError || new Error('No session after auth exchange');
          }
        }
        
        console.log('Successfully authenticated, checking profile');
        // Re-get session as it might have been updated
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        if (currentSession?.user) {
          // Check if user profile exists and is complete
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
            // Create initial profile if it doesn't exist
            console.log('Creating new profile for user');
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
          console.error('No user in session after auth callback');
          toast.error('Authentication unsuccessful');
          navigate('/');
        }
      } catch (error: any) {
        console.error('Error in auth callback:', error);
        toast.error('Authentication failed: ' + (error.message || 'Unknown error'));
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
