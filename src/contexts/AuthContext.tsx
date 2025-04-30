
import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  onAuthStateChanged,
  signOut as firebaseSignOut,
  User as FirebaseUser
} from 'firebase/auth';
import { auth } from '@/integrations/firebase/config';

interface ProfileType {
  id?: number;
  user_id: string;
  full_name: string;
  email: string;
  password: string;
  is_profile_complete?: boolean;
  username?: string;
  bio?: string;
  university_name?: string;
  graduation_year?: number | null;
  branch?: string;
  location?: string;
  registration_number?: string;
  avatar_url?: string | null;
}

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  session: Session | null;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Listen for Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('Firebase auth state changed:', user ? user.email : 'logged out');
      setFirebaseUser(user);
      
      if (user) {
        setIsLoading(true);
        try {
          // Get the ID token from Firebase
          const idToken = await user.getIdToken();
          
          // Sign in to Supabase with the Firebase ID token
          const { data, error } = await supabase.auth.signInWithIdToken({
            provider: 'google',
            token: idToken,
            nonce: 'NONCE', // You would generate a proper nonce in production
          });
          
          if (error) throw error;
          
          setSession(data.session);
          setUser(data.session?.user ?? null);
          
          // Check if user exists in the users table and create if not
          await checkOrCreateUserRecord(user, data.session?.user);
        } catch (error) {
          console.error('Error syncing Firebase auth with Supabase:', error);
          toast.error('Authentication error');
        } finally {
          setIsLoading(false);
        }
      } else {
        // User is signed out of Firebase, sign out of Supabase too
        supabase.auth.signOut().catch(console.error);
        setUser(null);
        setSession(null);
        setIsLoading(false);
      }
    });

    // Also check Supabase session on load
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (!firebaseUser) {
        setIsLoading(false);
      }
    }).catch(error => {
      console.error('Error getting Supabase session:', error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [navigate]);

  // Check if user exists in the users table and create if not
  const checkOrCreateUserRecord = async (
    firebaseUser: FirebaseUser, 
    supabaseUser: User | null | undefined
  ) => {
    if (!firebaseUser || !supabaseUser) return;

    try {
      // Check if user exists in the users table
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('id')
        .eq('id', supabaseUser.id)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      // If user doesn't exist, create a record
      if (!existingUser) {
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            id: supabaseUser.id,
            email: firebaseUser.email || '',
            full_name: firebaseUser.displayName || '',
            avatar_url: firebaseUser.photoURL || null,
            provider: 'google'
          });

        if (insertError) throw insertError;
        
        // Also create a profile record if needed
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            user_id: supabaseUser.id,
            email: firebaseUser.email || '',
            full_name: firebaseUser.displayName || '',
            password: '' // Required field based on schema
          });

        if (profileError) {
          console.warn('Could not create profile record:', profileError);
        }
      }

      // Check if profile is complete
      setTimeout(() => {
        checkProfileCompletion(supabaseUser);
      }, 0);

    } catch (error) {
      console.error('Error checking or creating user record:', error);
      toast.error('Failed to sync user data');
    }
  };

  const checkProfileCompletion = async (user: User | null | undefined) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Profile doesn't exist, create a new one
          navigate('/profile-setup');
          return;
        }
        throw error;
      }

      // Check if is_profile_complete exists on the profiles table
      if ('is_profile_complete' in data) {
        const profileData = data as ProfileType;
        if (!profileData.is_profile_complete) {
          navigate('/profile-setup');
        } else {
          navigate('/dashboard');
        }
      } else {
        // If is_profile_complete doesn't exist, just navigate to dashboard
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error checking profile:', error);
      toast.error('Error checking profile status');
      // Still navigate to dashboard as fallback
      navigate('/dashboard');
    }
  };

  const signInWithGoogle = async () => {
    try {
      setIsLoading(true);
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      toast.success('Signed in successfully');
      // The Firebase onAuthStateChanged listener will handle the rest
    } catch (error: any) {
      console.error('Error signing in with Google:', error);
      toast.error('Failed to sign in with Google: ' + (error.message || 'Unknown error'));
      setIsLoading(false);
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
    } catch (error: any) {
      console.error('Error signing in with email:', error);
      throw error;
    }
  };

  const signUpWithEmail = async (email: string, password: string, fullName: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });
      if (error) throw error;
      toast.success('Please check your email to confirm your account');
    } catch (error: any) {
      console.error('Error signing up with email:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      setIsLoading(true);
      await firebaseSignOut(auth);
      await supabase.auth.signOut();
      navigate('/');
      toast.success('Signed out successfully');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        firebaseUser,
        session, 
        signInWithGoogle, 
        signInWithEmail, 
        signUpWithEmail, 
        signOut, 
        isLoading 
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
