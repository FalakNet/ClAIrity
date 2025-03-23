import { useContext, useState } from 'react';
import { AuthContext } from '../contexts/AuthContext';

interface AuthResponse {
  user: {
    id: string;
    email: string;
  };
  session: unknown; // Replace `unknown` with the appropriate type if available
}

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const register = async (
    email: string,
    password: string,
  ): Promise<AuthResponse> => {
    setLoading(true);
    setError(null);

    try {
      // Replace this with the actual registration logic
      const response: AuthResponse = {
        user: {
          id: 'example-id',
          email,
        },
        session: { password }, // Example usage of the password
      };
      return response;
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'An error occurred');
      } else {
        setError('An unknown error occurred');
      }
      throw err; // Re-throw the error after handling it
    } finally {
      setLoading(false);
    }
  };

  return { ...context, register, error, loading };
};
