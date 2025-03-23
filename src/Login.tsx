import { useState, FormEvent } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import "./App.css";
import "./styles/auth.css";

const Login = () => {
  const location = useLocation();
  const message = location.state?.message;

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  // Get auth context and navigation
  const { login, error: authError, loading } = useAuth();
  const navigate = useNavigate();

  // Handle login form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);

    try {
      await login(email, password);
      navigate("/"); // Redirect to home page after login
    } catch (error) {
      setFormError((error as Error).message);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-form-card">
        <h1 className="auth-title">clarity</h1>
        <p className="auth-subtitle">Log in to your account</p>
        
        {message && (
          <div className="auth-success-message" style={{ 
            backgroundColor: '#e6f7f0', 
            color: '#2a7d5c', 
            padding: '10px', 
            borderRadius: '4px', 
            marginBottom: '15px' 
          }}>
            {message}
          </div>
        )}

        {(formError || authError) && (
          <div className="auth-error">{formError || authError}</div>
        )}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              placeholder="your@email.com"
              className="auth-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              placeholder="••••••••"
              className="auth-input"
            />
          </div>

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>
        <div className="auth-links">
          <p>
            Don't have an account? <Link to="/signup">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
