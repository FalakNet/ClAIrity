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

// Create the context with a default undefined value
export const AuthContext = createContext<AuthContextType | undefined>(undefined);