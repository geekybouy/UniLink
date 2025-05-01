
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Session, User } from '@supabase/supabase-js';
import { getAuth, GoogleAuthProvider, signInWithPopup, User as FirebaseUser } from 'firebase/auth';
import { toast } from 'sonner';

interface UserProfile {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  username: string | null;
  bio: string | null;
  avatarUrl: string | null;
  phone: string | null;
  university: string | null;
  graduationYear: number | null;
  branch: string | null;
  location: string | null;
  registrationNumber: string | null;
}

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any | null }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any | null, data: any | null }>;
  signOut: () => Promise<void>;
  passwordReset: (email: string) => Promise<{ error: any | null }>;
  updatePassword: (password: string) => Promise<{ error: any | null }>;
  userProfile: UserProfile | null;
  refreshUserProfile: () => Promise<void>;
  hasRole: (role: string) => boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, fullName: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Firebase auth listener
  useEffect(() => {
    try {
      const auth = getAuth();
      const unsubscribe = auth.onAuthStateChanged((user) => {
        setFirebaseUser(user);
      });
      
      return () => unsubscribe();
    } catch (error) {
      // Firebase might not be initialized
      console.log('Firebase auth not available or not initialized');
    }
  }, []);

  // Fetch user profile when user changes
  useEffect(() => {
    if (user) {
      fetchUserProfile();
      fetchUserRoles();
    } else {
      setUserProfile(null);
      setUserRoles([]);
    }
  }, [user]);

  const fetchUserProfile = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;

      if (data) {
        // Convert the profile data to our UserProfile format
        const profile: UserProfile = {
          id: data.id.toString(),
          userId: data.user_id,
          fullName: data.full_name,
          email: data.email,
          username: data.username,
          bio: data.bio,
          avatarUrl: data.avatar_url,
          phone: data.phone,
          university: data.university_name,
          graduationYear: data.graduation_year,
          branch: data.branch,
          location: data.location,
          registrationNumber: data.registration_number
        };
        
        setUserProfile(profile);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const fetchUserRoles = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id);

      if (error) throw error;

      if (data) {
        setUserRoles(data.map(r => r.role));
      }
    } catch (error) {
      console.error('Error fetching user roles:', error);
    }
  };

  const refreshUserProfile = async () => {
    await fetchUserProfile();
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error };
    } catch (error) {
      return { error };
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate('/auth/login');
  };

  const passwordReset = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
      return { error };
    } catch (error) {
      return { error };
    }
  };

  const updatePassword = async (password: string) => {
    try {
      const { error } = await supabase.auth.updateUser({ password });
      return { error };
    } catch (error) {
      return { error };
    }
  };

  const hasRole = (role: string): boolean => {
    return userRoles.includes(role);
  };

  // New methods for authentication
  const signInWithGoogle = async () => {
    try {
      // Try Supabase Google Auth first
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      
      if (error) {
        // Fallback to Firebase if Supabase fails
        const auth = getAuth();
        const provider = new GoogleAuthProvider();
        await signInWithPopup(auth, provider);
      }
    } catch (error: any) {
      toast.error(`Failed to sign in with Google: ${error.message}`);
      console.error('Google sign-in error:', error);
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    try {
      const { error } = await signIn(email, password);
      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    }
  };

  const signUpWithEmail = async (email: string, password: string, fullName: string) => {
    try {
      const { error } = await signUp(email, password, fullName);
      if (error) throw error;
      toast.success("Signup successful! Check your email to verify your account.");
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    }
  };

  const value = {
    user,
    firebaseUser,
    session,
    isLoading,
    signIn,
    signUp,
    signOut,
    passwordReset,
    updatePassword,
    userProfile,
    refreshUserProfile,
    hasRole,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
