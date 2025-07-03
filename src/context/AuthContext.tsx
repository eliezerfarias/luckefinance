import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { User, AuthError } from '@supabase/supabase-js';

interface UserProfile {
  id: string;
  email: string;
  username?: string;
  nickname?: string;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string, nickname: string) => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check active sessions and sets the user
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          // Handle refresh token errors silently
          if (sessionError.message.includes('refresh_token_not_found') || 
              sessionError.message.includes('Invalid Refresh Token')) {
            await supabase.auth.signOut();
            setUser(null);
            setUserProfile(null);
            setLoading(false);
            return;
          }
          throw sessionError;
        }

        setUser(session?.user ?? null);
        
        if (session?.user) {
          await loadUserProfile(session.user.id);
        }
        
        // Listen for changes on auth state
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
          setUser(session?.user ?? null);
          setError(null);

          if (session?.user) {
            await loadUserProfile(session.user.id);
          } else {
            setUserProfile(null);
          }

          if (event === 'TOKEN_REFRESHED') {
            // Session was successfully refreshed
            setError(null);
          } else if (event === 'SIGNED_OUT') {
            // Clear any stored session data
            setUser(null);
            setUserProfile(null);
          }
        });

        return () => {
          subscription.unsubscribe();
        };
      } catch (err) {
        const authError = err as AuthError;
        if (authError.message.includes('refresh_token_not_found') || 
            authError.message.includes('Invalid Refresh Token')) {
          // Handle invalid refresh token by signing out silently
          await supabase.auth.signOut();
          setUser(null);
          setUserProfile(null);
        } else {
          setError(authError.message);
        }
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const loadUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, username, nickname')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error loading user profile:', error);
        return;
      }

      setUserProfile(data);
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  };

  const signUp = async (email: string, password: string, username: string, nickname: string) => {
    try {
      setError(null);
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: window.location.origin,
          data: {
            username,
            nickname,
          },
        },
      });

      if (authError) throw authError;

      // User profile will be created automatically by database trigger
      // No need for client-side insert
    } catch (err) {
      const error = err as Error;
      setError(error.message);
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setError(null);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
    } catch (err) {
      const error = err as Error;
      setError(error.message);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      setError(null);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUserProfile(null);
    } catch (err) {
      const error = err as Error;
      setError(error.message);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, userProfile, signIn, signUp, signOut, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};