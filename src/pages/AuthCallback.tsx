
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
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        if (session?.user) {
          // Check if user profile exists and is complete
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', session.user.id)
            .single();

          if (profileError && profileError.code !== 'PGRST116') {
            throw profileError;
          }

          if (!profile) {
            // Create initial profile if it doesn't exist
            const { error: insertError } = await supabase
              .from('profiles')
              .insert({
                user_id: session.user.id,
                email: session.user.email || '',
                full_name: session.user.user_metadata.full_name || '',
                password: '' // Required field based on your schema
              });

            if (insertError) throw insertError;
            navigate('/complete-profile');
            return;
          }

          const requiredFields = ['full_name', 'email'];
          const isComplete = requiredFields.every(field => 
            profile[field as keyof typeof profile]
          );

          navigate(isComplete ? '/dashboard' : '/complete-profile');
        } else {
          navigate('/');
        }
      } catch (error: any) {
        console.error('Error in auth callback:', error);
        toast.error('Authentication failed');
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
