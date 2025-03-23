import { useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { RoleCode, assignRole } from './lib/roleUtils';
import './styles/auth.css';

// Add interface for auth response
interface AuthResponse {
  user: {
    id: string;
    email: string;
    // Add other user properties as needed
  };
  session?: import('@supabase/supabase-js').Session | null;
}



const Signup = () => {
  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isEmailSent, setIsEmailSent] = useState(false);
  
  // Add role state
  const [role] = useState<RoleCode>('ST'); // Default to student
  const [classCode, setClassCode] = useState('');
  
  // Get auth context and navigation
  const { register, error: authError, loading } = useAuth();
  
  // Validate class code pattern (e.g., "12F", "8B")
  const isValidClassCode = (code: string): boolean => {
    return /^[1-9][0-9]?[A-Z]$/.test(code);
  };
  
  // Handle signup form submission
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    
    // Validate password match
    if (password !== confirmPassword) {
      setFormError("Passwords don't match");
      return;
    }
    
    // Validate password strength
    if (password.length < 8) {
      setFormError("Password must be at least 8 characters");
      return;
    }

    // Validate terms agreement
    if (!agreeToTerms) {
      setFormError("You must agree to the Terms and Conditions");
      return;
    }
    
    // Validate class code for students
    if (role === 'ST' && !isValidClassCode(classCode)) {
      setFormError('Please enter a valid class code (e.g., 12F, 8B)');
      return;
    }
    
    try {
      // Log the data being sent
      console.log('Sending registration data:', { 
        email, 
        password, 
        firstName, 
        lastName,
        role,
        classCode
      });
      
      // Register the user with proper type annotation
      const userData = await register(email, password) as AuthResponse;
      
      // If registration was successful, assign the role
      if (userData?.user) {
        if (role === 'ST') {
          await assignRole(userData.user.id, role, classCode);
        } else {
          await assignRole(userData.user.id, role);
        }
      }
      
      // Check if email confirmation is required
      setIsEmailSent(true);
    } catch (error) {
      setFormError((error as Error).message);
    }
  };

  // If verification email was sent, show confirmation message
  if (isEmailSent) {
    return (
      <div className="auth-container">
        <div className="auth-form-card">
          <h1 className="auth-title">clarity</h1>
          <h2>Check you Email</h2>
          <p className="auth-subtitle">
            We've sent a confirmation email to <strong>{email}</strong>.<br/>
            Please check your inbox and follow the instructions to complete your registration.
          </p>
          <div className="auth-links">
            <p>
              <Link to="/login">Return to Login</Link>
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-form-card">
        <h1 className="auth-title">clarity</h1>
        <p className="auth-subtitle">Sign up for Clarity</p>
        
        {(formError || authError) && (
          <div className="auth-error">{formError || authError}</div>
        )}
        
        <form onSubmit={handleSubmit} className="auth-form">
          {/* Name fields */}
          <div className="form-row">
            <div className="form-group half">
              <label htmlFor="firstName">First Name</label>
              <input
                type="text"
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                disabled={loading}
                placeholder="John"
                className="auth-input"
              />
            </div>
            
            <div className="form-group half">
              <label htmlFor="lastName">Last Name</label>
              <input
                type="text"
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                disabled={loading}
                placeholder="Doe"
                className="auth-input"
              />
            </div>
          </div>
          
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
          
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={loading}
              placeholder="••••••••"
              className="auth-input"
            />
          </div>
          
          
          {/* Conditional class code field for students */}
          {role === 'ST' && (
            <div className="form-group">
              <label htmlFor="classCode">Your Class</label>
              <input
                type="text"
                id="classCode"
                value={classCode}
                onChange={(e) => setClassCode(e.target.value.toUpperCase())}
                required
                disabled={loading}
                placeholder="e.g., 12F, 8B"
                pattern="^[1-9][0-9]?[A-Z]$"
                title="Please enter a valid class code (e.g., 12F, 8B)"
                className="auth-input"
              />
              <small className="form-help">Format: Grade number followed by class letter (e.g., 12F, 8B)</small>
            </div>
          )}
          
          <div className="form-group checkbox-group">
            <input
              type="checkbox"
              id="agreeToTerms"
              checked={agreeToTerms}
              onChange={(e) => setAgreeToTerms(e.target.checked)}
              disabled={loading}
              className="auth-checkbox"
            />
            <label htmlFor="agreeToTerms">
              I agree to the <a href="/terms" target="_blank" rel="noopener noreferrer">Terms and Conditions</a>
            </label>
          </div>
          
          <button 
            type="submit" 
            className="auth-button"
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>
        
        <div className="auth-links">
          <p>
            Already have an account? <Link to="/login">Log in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
