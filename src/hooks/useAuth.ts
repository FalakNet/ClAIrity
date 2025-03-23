import { useContext, useState } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { createClient } from '@supabase/supabase-js';

// const supabase = createClient('your-supabase-url', 'your-supabase-anon-key');
const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY);


export const useAuth = () => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const register = async (email: string, password: string, options?: { metadata?: Record<string, unknown> }) => {
    setLoading(true);
    setError(null);
    
    try {
      // This is the correct Supabase signUp method with metadata
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: options?.metadata || {}
        }
      });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error in register function:', error);
      setError((error as Error).message);
      return { error };
    } finally {
      setLoading(false);
    }
  };

  return { ...context, register, error, loading };
};
