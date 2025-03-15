import { useState } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from './supabaseClient';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import './App.css';
import Index from './index';
import Counselor from './Counselor';
import AnxiousEase from './AnxiousEase';

function App() {
  const [session, setSession] = useState<Session | null>(null);

  supabase.auth.onAuthStateChange((_event, session) => {
    setSession(session);
  });

  const handleLogin = async (email: any, password: any) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) console.error('Error logging in:', error.message);
  };

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Error logging out:', error.message);
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/counselor" element={session ? <Counselor /> : <Navigate to="/" />} />
        <Route path="/anxiousease" element={session ? <AnxiousEase /> : <Navigate to="/" />} />
      </Routes>
      {!session ? (
        <div>
          <h2>Login</h2>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              const form = e.target as HTMLFormElement;
              const email = form.email.value;
              const password = form.password.value;
              await handleLogin(email, password);
            }}
          >
            <input type="email" name="email" placeholder="Email" required />
            <input type="password" name="password" placeholder="Password" required />
            <button type="submit">Login</button>
          </form>
        </div>
      ) : (
        <button onClick={handleLogout}>Logout</button>
      )}
    </Router>
  );
}

export default App;