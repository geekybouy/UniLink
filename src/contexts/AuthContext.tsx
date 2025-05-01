
import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
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

// Define types for our authentication context
interface UserRole {
  id: string;
  user_id: string;
  role: 'admin' | 'moderator' | 'student' | 'alumni';
  created_at: string;
}

interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  username?: string;
  bio?: string;
  university_name?: string;
  graduation_year?: number;
  branch?: string;
  location?: string;
  registration_number?: string;
  avatar_url?: string;
  is_profile_complete: boolean;
}

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  session: Session | null;
  profile: UserProfile | null;
  roles: UserRole[];
  isLoading: boolean;
  hasRole: (role: 'admin' | 'moderator' | 'student' | 'alumni') => boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, fullName: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const navigate = useNavigate();
  const location = useLocation();

  // Function to fetch user profile
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error) throw error;
      
      if (data) {
        setProfile(data as UserProfile);
      }
    } catch (error: any) {
      console.error('Error fetching user profile:', error.message);
    }
  };

  // Function to fetch user roles
  const fetchUserRoles = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .eq('user_id', userId);
      
      if (error) throw error;
      
      if (data) {
        setRoles(data as UserRole[]);
      }
    } catch (error: any) {
      console.error('Error fetching user roles:', error.message);
    }
  };

  // Handle Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('Firebase auth state changed:', firebaseUser ? firebaseUser.email : 'logged out');
      setFirebaseUser(firebaseUser);
      
      if (firebaseUser) {
        setIsLoading(true);
        try {
          // Get the ID token from Firebase
          const idToken = await firebaseUser.getIdToken();
          
          // Sign in to Supabase with the Firebase ID token
          const { data, error } = await supabase.auth.signInWithIdToken({
            provider: 'google',
            token: idToken,
            nonce: 'NONCE', // You would generate a proper nonce in production
          });
          
          if (error) throw error;
          
          setSession(data.session);
          setUser(data.session?.user ?? null);
        } catch (error) {
          console.error('Error syncing Firebase auth with Supabase:', error);
          toast.error('Authentication error');
        } finally {
          setIsLoading(false);
        }
      } else {
        // User is logged out of Firebase
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  // Handle Supabase auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        console.log('Supabase auth state changed:', event);
        
        // Update session and user state
        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        // If user logged in, fetch profile and roles
        if (currentSession?.user) {
          setTimeout(() => {
            fetchUserProfile(currentSession.user.id);
            fetchUserRoles(currentSession.user.id);
          }, 0);

          // Check if we need to redirect to profile setup
          if (event === 'SIGNED_IN') {
            setTimeout(async () => {
              try {
                const { data, error } = await supabase
                  .from('profiles')
                  .select('is_profile_complete')
                  .eq('user_id', currentSession.user.id)
                  .single();
                
                if (!error && data && !data.is_profile_complete) {
                  navigate('/profile-setup');
                } else if (
                  location.pathname === '/auth' || 
                  location.pathname === '/' ||
                  location.pathname === '/auth/login' || 
                  location.pathname === '/auth/signup'
                ) {
                  navigate('/dashboard');
                }
              } catch (err) {
                console.error('Error checking profile completion:', err);
              }
            }, 0);
          }
        } else if (event === 'SIGNED_OUT') {
          setProfile(null);
          setRoles([]);
          
          // Redirect to home page on sign out
          if (location.pathname !== '/') {
            navigate('/');
          }
        }
      }
    );

    // Check for existing session on load
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (currentSession?.user) {
        fetchUserProfile(currentSession.user.id);
        fetchUserRoles(currentSession.user.id);
      }
      
      setIsLoading(false);
    }).catch(error => {
      console.error('Error getting Supabase session:', error);
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [location.pathname, navigate]);

  // Function to check if user has a specific role
  const hasRole = (roleToCheck: 'admin' | 'moderator' | 'student' | 'alumni') => {
    return roles.some(role => role.role === roleToCheck);
  };

  // Sign in with Google using Firebase
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

  // Sign in with email and password
  const signInWithEmail = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      toast.success('Signed in successfully');
    } catch (error: any) {
      toast.error('Failed to sign in: ' + error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Sign up with email and password
  const signUpWithEmail = async (email: string, password: string, fullName: string) => {
    try {
      setIsLoading(true);
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
      toast.success('Account created! Please check your email to verify your account.');
    } catch (error: any) {
      toast.error('Failed to sign up: ' + error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Reset password
  const resetPassword = async (email: string) => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/auth/reset-password',
      });
      if (error) throw error;
      toast.success('Password reset email sent. Check your inbox.');
    } catch (error: any) {
      toast.error('Failed to send reset email: ' + error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Update password
  const updatePassword = async (password: string) => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success('Password updated successfully');
    } catch (error: any) {
      toast.error('Failed to update password: ' + error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Sign out from both Firebase and Supabase
  const signOut = async () => {
    try {
      setIsLoading(true);
      if (firebaseUser) {
        await firebaseSignOut(auth);
      }
      await supabase.auth.signOut();
      toast.success('Signed out successfully');
    } catch (error: any) {
      console.error('Error signing out:', error);
      toast.error('Failed to sign out: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to manually refresh profile data
  const refreshProfile = async () => {
    if (user) {
      await Promise.all([
        fetchUserProfile(user.id),
        fetchUserRoles(user.id)
      ]);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        session,
        profile,
        roles,
        isLoading,
        hasRole,
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
        resetPassword,
        updatePassword,
        signOut,
        refreshProfile
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
