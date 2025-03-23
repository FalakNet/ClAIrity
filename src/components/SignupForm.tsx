import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { RoleCode, assignRole } from '../lib/roleUtils';
import '../styles/forms.css';

const SignupForm = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<RoleCode>('ST'); // Default to student
  const [classCode, setClassCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Validate class code pattern (e.g., "12F", "8B")
  const isValidClassCode = (code: string): boolean => {
    return /^[1-9][0-9]?[A-Z]$/.test(code);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Validate class code for students
    if (role === 'ST' && !isValidClassCode(classCode)) {
      setError('Please enter a valid class code (e.g., 12F, 8B)');
      setLoading(false);
      return;
    }

    try {
      // Sign up the user
      const { data, error: signupError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (signupError) throw signupError;
      
      if (data?.user) {
        // Assign the appropriate role
        if (role === 'ST') {
          await assignRole(data.user.id, role, classCode);
        } else {
          await assignRole(data.user.id, role);
        }
        
        // Success message
        alert('Registration successful! Please check your email to confirm your account.');
        navigate('/login');
      }
    } catch (err) {
      console.error('Error during registration:', err);
      setError(err instanceof Error ? err.message : 'An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-form-container">
      <h2>Sign Up</h2>
      {error && <div className="error-message">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="fullName">Full Name</label>
          <input
            id="fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
        </div>
        
        <div className="form-group">
          <label>Role</label>
          <div className="role-options">
            <label className="role-option">
              <input
                type="radio"
                name="role"
                value="ST"
                checked={role === 'ST'}
                onChange={() => setRole('ST')}
              />
              Student
            </label>
            <label className="role-option">
              <input
                type="radio"
                name="role"
                value="SC"
                checked={role === 'SC'}
                onChange={() => setRole('SC')}
              />
              School Counsellor
            </label>
            <label className="role-option">
              <input
                type="radio"
                name="role"
                value="AD"
                checked={role === 'AD'}
                onChange={() => setRole('AD')}
              />
              Admin
            </label>
          </div>
        </div>
        
        {/* Conditional class code field for students */}
        {role === 'ST' && (
          <div className="form-group">
            <label htmlFor="classCode">Class (e.g., 12F, 8B)</label>
            <input
              id="classCode"
              type="text"
              value={classCode}
              onChange={(e) => setClassCode(e.target.value.toUpperCase())}
              required
              placeholder="e.g., 12F, 8B"
              pattern="^[1-9][0-9]?[A-Z]$"
              title="Please enter a valid class code (e.g., 12F, 8B)"
            />
            <small>Format: Grade number followed by class letter (e.g., 12F, 8B)</small>
          </div>
        )}
        
        <button type="submit" disabled={loading}>
          {loading ? 'Signing up...' : 'Sign Up'}
        </button>
      </form>
      
      <p>
        Already have an account? <a href="/login">Log In</a>
      </p>
    </div>
  );
};

export default SignupForm;
