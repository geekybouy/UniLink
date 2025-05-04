import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

// Define user role type to include faculty
export type UserRole = 'student' | 'alumni' | 'admin' | 'moderator' | 'faculty';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
  
  // Add missing properties to fix TypeScript errors
  isLoading: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, fullName: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  hasRole: (role: UserRole) => Promise<boolean>;
  getUserRoles: () => Promise<UserRole[]>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Fetch user roles when auth state changes
        if (session?.user) {
          fetchUserRoles(session.user.id);
        } else {
          setUserRoles([]);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      // Fetch user roles if session exists
      if (session?.user) {
        fetchUserRoles(session.user.id);
      }
      
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Fetch user roles from database
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
        // Map roles from database to UserRole type
        const roles = data.map(item => item.role as UserRole);
        setUserRoles(roles);
      }
    } catch (error) {
      console.error('Error in fetchUserRoles:', error);
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUserRoles([]);
  };

  // Implement the missing methods
  const signInWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });
  };

  const signInWithEmail = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signUpWithEmail = async (email: string, password: string, fullName: string) => {
    const { error } = await supabase.auth.signUp({ 
      email, 
      password, 
      options: {
        data: { full_name: fullName }
      }
    });
    if (error) throw error;
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });
    if (error) throw error;
  };

  // Function to check if a user has a specific role
  const hasRole = async (role: UserRole): Promise<boolean> => {
    // First check cached roles
    if (userRoles.includes(role)) {
      return true;
    }
    
    // If no cached roles or role not found, check database
    if (user) {
      try {
        const { data, error } = await supabase
          .rpc('has_role', { user_id: user.id, role: role as any });
        
        if (error) throw error;
        return !!data;
      } catch (error) {
        console.error('Error checking user role:', error);
        return false;
      }
    }
    
    return false;
  };
  
  // Function to get all roles for the current user
  const getUserRoles = async (): Promise<UserRole[]> => {
    // Return cached roles if available
    if (userRoles.length > 0) {
      return userRoles;
    }
    
    // Otherwise fetch from database
    if (user) {
      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);
        
        if (error) throw error;
        
        if (data) {
          const roles = data.map(item => item.role as UserRole);
          setUserRoles(roles);
          return roles;
        }
      } catch (error) {
        console.error('Error fetching user roles:', error);
      }
    }
    
    return [];
  };

  const value = {
    user,
    session,
    loading,
    signOut,
    isLoading: loading, // Alias loading as isLoading for consistency
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    resetPassword,
    hasRole,
    getUserRoles
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
