import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Handle the OAuth callback
    const handleAuthCallback = async () => {
      // Get URL hash (e.g. #access_token=...)
      const hash = window.location.hash;
      
      if (hash && hash.includes('access_token')) {
        try {
          // Allow Supabase client to handle the hash, setting the session
          const { data, error } = await supabase.auth.getUser();
          
          if (error) throw error;
          if (data?.user) {
            // Success, redirect to home
            navigate('/', { replace: true });
          }
        } catch (error) {
          console.error('Error during auth callback:', error);
          navigate('/login', { replace: true });
        }
      } else {
        // No valid hash found, redirect to login
        navigate('/login', { replace: true });
      }
    };

    handleAuthCallback();
  }, [navigate]);

  return (
    <div 
      className="loading"
      style={{
        fontSize: "3rem",
        fontFamily: "'Montserrat Alternates', sans-serif",
        fontWeight: 700,
        color: "#277585",
        textAlign: "center",
      }}
    >
      Processing login...
    </div>
  );
};

export default AuthCallback;
