import { createContext } from 'react';
import { User, Session, Provider } from '@supabase/supabase-js';

// Define the shape of our auth context
export interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, options?: { 
    firstName?: string; 
    lastName?: string;
    redirectTo?: string;
  }) => Promise<void>;
  loginWithSocial: (provider: Provider) => Promise<void>;
  logout: () => Promise<void>;
}

// Create initial default values
const defaultValue: AuthContextType = {
  user: null,
  session: null,
  loading: true,
  error: null,
  login: () => Promise.resolve(),
  register: () => Promise.resolve(),
  loginWithSocial: () => Promise.resolve(),
  logout: () => Promise.resolve(),
};

// Create the context with proper default values
export const AuthContext = createContext<AuthContextType>(defaultValue);
