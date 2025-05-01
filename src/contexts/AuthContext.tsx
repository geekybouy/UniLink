
import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendPasswordResetEmail,
  GoogleAuthProvider, 
  signOut 
} from 'firebase/auth';
import { auth } from '../integrations/firebase/init';
import { customSupabase } from '../integrations/supabase/customClient';
import { User } from 'firebase/auth';

// Define the shape of our context
interface AuthContextType {
  firebaseUser: User | null;
  userId: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, fullName: string) => Promise<void>;
  logOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  firebaseUser: null,
  userId: null,
  loading: true,
  isAuthenticated: false,
  signInWithGoogle: async () => {},
  signInWithEmail: async () => {},
  signUpWithEmail: async () => {},
  logOut: async () => {},
  resetPassword: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Check if user is authenticated
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      setUserId(user?.uid || null);
      setLoading(false);
      
      if (user) {
        // Check if user exists in Supabase
        const { data: profile } = await customSupabase
          .from('profiles')
          .select('*')
          .eq('user_id', user.uid)
          .single();
        
        // If user doesn't exist in Supabase, create a profile
        if (!profile) {
          try {
            await customSupabase.from('profiles').insert({
              user_id: user.uid,
              email: user.email,
              full_name: user.displayName || 'New User',
              username: '',
              bio: '',
              password: '',
              is_profile_complete: false
            });
          } catch (error) {
            console.error('Error creating profile:', error);
          }
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Sign in with Google
  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Error signing in with Google:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Sign in with email
  const signInWithEmail = async (email: string, password: string) => {
    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error('Error signing in with email:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Sign up with email
  const signUpWithEmail = async (email: string, password: string, fullName: string) => {
    try {
      setLoading(true);
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Create profile in Supabase
      if (user) {
        await customSupabase.from('profiles').insert({
          user_id: user.uid,
          email: email,
          full_name: fullName,
          username: '',
          bio: '',
          password: '',
          is_profile_complete: false
        });
      }
    } catch (error) {
      console.error('Error signing up with email:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Reset password
  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error('Error resetting password:', error);
      throw error;
    }
  };

  // Log out
  const logOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  };

  const value = {
    firebaseUser,
    userId,
    loading,
    isAuthenticated: !!firebaseUser,
    signInWithGoogle,
    signInWithEmail,
    signUpWithEmail,
    logOut,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
