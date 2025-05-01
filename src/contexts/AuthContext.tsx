
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '../integrations/supabase/client';
import { customSupabase } from '../integrations/supabase/customClient';
import { toast } from 'sonner';

// Define user roles type
export type UserRole = 'admin' | 'moderator' | 'student' | 'alumni';

// Define the shape of our context
export interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, fullName: string) => Promise<void>;
  logOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  hasRole: (role: UserRole) => boolean;
  userId: string | null;
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: true,
  isAuthenticated: false,
  signInWithGoogle: async () => {},
  signInWithEmail: async () => {},
  signUpWithEmail: async () => {},
  logOut: async () => {},
  resetPassword: async () => {},
  hasRole: () => false,
  userId: null
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);

  // Set up auth state change listener
  useEffect(() => {
    console.log('Setting up auth state change listener');
    
    // Set up auth state change listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log(`Auth state changed: ${event}`, currentSession?.user?.id || 'No user');
        
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        
        if (currentSession?.user) {
          // We'll use setTimeout to avoid potential deadlocks with Supabase client
          setTimeout(async () => {
            try {
              // Ensure user profile exists
              await ensureUserProfile(currentSession.user);
              // Fetch user roles
              await fetchUserRoles(currentSession.user.id);
            } catch (error) {
              console.error('Error in auth state change callback:', error);
            }
          }, 0);
        } else {
          setUserRoles([]);
        }
        
        // Always update loading state at the end
        setIsLoading(false);
      }
    );

    // THEN check for existing session
    const initializeAuth = async () => {
      try {
        console.log('Checking for existing session');
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          throw error;
        }
        
        const { session: initialSession } = data;
        
        if (initialSession?.user) {
          console.log('Found existing session:', initialSession.user.id);
          setSession(initialSession);
          setUser(initialSession.user);
          
          // Fetch user roles
          await fetchUserRoles(initialSession.user.id);
        } else {
          console.log('No existing session found');
        }
      } catch (error) {
        console.error('Error getting initial auth session:', error);
      } finally {
        // Always set loading to false when initialization is complete
        setIsLoading(false);
      }
    };

    // Run initialization
    initializeAuth();

    // Cleanup subscription
    return () => {
      console.log('Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, []);

  // Use separate function to fetch user roles to avoid potential deadlocks
  const fetchUserRoles = async (userId: string) => {
    try {
      console.log('Fetching user roles for:', userId);
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);
      
      if (error) {
        console.error('Error fetching user roles:', error);
        return;
      }
      
      if (data) {
        const roles = data.map(item => item.role as UserRole);
        console.log('User roles:', roles);
        setUserRoles(roles);
      }
    } catch (error) {
      console.error('Error in fetchUserRoles:', error);
    }
  };

  // Ensure user profile exists in database
  const ensureUserProfile = async (user: User) => {
    try {
      console.log('Ensuring profile exists for user:', user.id);
      // First check if profile exists
      const { data: existingProfile, error: profileError } = await customSupabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (profileError) {
        console.error('Error checking for profile:', profileError);
        return;
      }
      
      // If profile doesn't exist, create one
      if (!existingProfile) {
        console.log('Creating new profile for user:', user.id);
        const { error: insertError } = await customSupabase
          .from('profiles')
          .insert({
            user_id: user.id,
            email: user.email || '',
            full_name: user.user_metadata?.full_name || 'New User',
            username: '',
            bio: '',
            password: ''
          });
        
        if (insertError) {
          console.error('Error creating profile:', insertError);
          return;
        }
        
        // Also assign default role
        const { error: roleError } = await customSupabase
          .from('user_roles')
          .insert({
            user_id: user.id,
            role: 'student'
          });
        
        if (roleError) {
          console.error('Error assigning role:', roleError);
        } else {
          console.log('Default role assigned successfully');
        }
      } else {
        console.log('User profile already exists');
      }
    } catch (error) {
      console.error('Error in ensureUserProfile:', error);
    }
  };

  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      console.log('Starting Google sign-in process');
      setIsLoading(true);
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/auth/callback'
        }
      });
      
      if (error) {
        throw error;
      }
      
      // Log the redirect URL for debugging
      if (data?.url) {
        console.log('Redirecting to Google auth URL:', data.url);
      }
      
    } catch (error: any) {
      console.error('Error signing in with Google:', error);
      toast.error(error.message || 'Failed to sign in with Google');
      setIsLoading(false);
      throw error;
    }
  };

  // Sign in with email
  const signInWithEmail = async (email: string, password: string) => {
    try {
      console.log('Signing in with email:', email);
      setIsLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        throw error;
      }
      
      // No need to manually set user and session here
      // The onAuthStateChange listener will handle that
      console.log('Sign-in successful:', data?.user?.id);
      
    } catch (error: any) {
      console.error('Error signing in with email:', error);
      toast.error(error.message || 'Failed to sign in');
      setIsLoading(false);
      throw error;
    }
  };

  // Sign up with email
  const signUpWithEmail = async (email: string, password: string, fullName: string) => {
    try {
      console.log('Signing up with email:', email);
      setIsLoading(true);
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName
          }
        }
      });
      
      if (error) {
        throw error;
      }
      
      console.log('Sign-up successful:', data?.user?.id);
      
      // The user profile and roles should be created through auth hooks
      // But we'll ensure it here just in case
      if (data.user) {
        // Use setTimeout to avoid potential deadlocks
        setTimeout(async () => {
          try {
            await ensureUserProfile(data.user!);
          } catch (err) {
            console.error('Error ensuring user profile after signup:', err);
          }
        }, 0);
      }
      
    } catch (error: any) {
      console.error('Error signing up with email:', error);
      toast.error(error.message || 'Failed to sign up');
      setIsLoading(false);
      throw error;
    }
  };

  // Reset password
  const resetPassword = async (email: string) => {
    try {
      console.log('Resetting password for:', email);
      setIsLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/auth/reset-password'
      });
      
      if (error) {
        throw error;
      }
      
      console.log('Password reset email sent');
      
    } catch (error: any) {
      console.error('Error resetting password:', error);
      toast.error(error.message || 'Failed to reset password');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Log out
  const logOut = async () => {
    try {
      console.log('Logging out');
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      
      // Clear user state manually
      setUser(null);
      setSession(null);
      setUserRoles([]);
      
      console.log('Logout successful');
      
    } catch (error: any) {
      console.error('Error signing out:', error);
      toast.error(error.message || 'Failed to sign out');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Check if user has a specific role
  const hasRole = (role: UserRole) => {
    return userRoles.includes(role);
  };

  const value = {
    user,
    session,
    isLoading,
    isAuthenticated: !!user,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    logOut,
    resetPassword,
    hasRole,
    userId: user?.id || null
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
