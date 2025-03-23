import { supabase } from './supabase';
import type { AuthResponse, User, Provider } from '@supabase/supabase-js';

// Sign up with email and password
export const signUp = async (
  email: string, 
  password: string, 
  options?: { 
    firstName?: string; 
    lastName?: string; 
    redirectTo?: string;
  }
): Promise<AuthResponse> => {
  const response = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: options?.firstName || null,
        last_name: options?.lastName || null
      },
      emailRedirectTo: options?.redirectTo || undefined
    }
  });
  
  if (response.error) throw response.error;
  return response;
};

// Sign in with email and password
export const signIn = async (email: string, password: string): Promise<AuthResponse> => {
  const response = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (response.error) throw response.error;
  return response;
};

// Sign in with social provider
export const signInWithProvider = async (provider: Provider): Promise<{ data: { provider: Provider; url: string; }; error: null; }> => {
  const response = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${window.location.origin}/auth/callback`
    }
  });
  
  if (response.error) throw response.error;
  return response;
};

// Sign out
export const signOut = async (): Promise<void> => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

// Get current session
export const getSession = async () => {
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session;
};

// Get current user
export const getCurrentUser = async (): Promise<User | null> => {
  const { data } = await supabase.auth.getUser();
  return data?.user || null;
};
