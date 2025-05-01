
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User, UserResponse } from '@supabase/supabase-js';
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

  // Check if user is authenticated
  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        setIsLoading(true);
        
        // Check for existing session
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        setSession(initialSession);
        setUser(initialSession?.user ?? null);
        
        if (initialSession?.user) {
          await fetchUserRoles(initialSession.user.id);
        }
      } catch (error) {
        console.error('Error getting initial auth session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    getInitialSession();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      
      if (currentSession?.user) {
        // Ensure user profile exists
        await ensureUserProfile(currentSession.user);
        // Fetch user roles
        await fetchUserRoles(currentSession.user.id);
      }
      
      setIsLoading(false);
    });

    // Cleanup subscription
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserRoles = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);
      
      if (error) {
        console.error('Error fetching user roles:', error);
        return;
      }
      
      if (data) {
        setUserRoles(data.map(item => item.role as UserRole));
      }
    } catch (error) {
      console.error('Error in fetchUserRoles:', error);
    }
  };

  const ensureUserProfile = async (user: User) => {
    try {
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
        }
      }
    } catch (error) {
      console.error('Error in ensureUserProfile:', error);
    }
  };

  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/auth/callback'
        }
      });
      
      if (error) {
        throw error;
      }
    } catch (error: any) {
      console.error('Error signing in with Google:', error);
      toast.error(error.message || 'Failed to sign in with Google');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Sign in with email
  const signInWithEmail = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) {
        throw error;
      }
    } catch (error: any) {
      console.error('Error signing in with email:', error);
      toast.error(error.message || 'Failed to sign in');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Sign up with email
  const signUpWithEmail = async (email: string, password: string, fullName: string) => {
    try {
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
      
      // The user profile should be created through database triggers
      // but we'll set up roles just in case
      if (data.user) {
        await customSupabase.from('user_roles').insert({
          user_id: data.user.id,
          role: 'student'
        });
      }
      
    } catch (error: any) {
      console.error('Error signing up with email:', error);
      toast.error(error.message || 'Failed to sign up');
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
        redirectTo: window.location.origin + '/auth/reset-password'
      });
      
      if (error) {
        throw error;
      }
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
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
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
