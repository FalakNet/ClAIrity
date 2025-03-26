import { useState, FormEvent } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import "./styles/auth.css";

// Add interface for auth response
interface AuthResponse {
  user: {
    id: string;
    email: string;
    // Add other user properties as needed
  };
  session?: import("@supabase/supabase-js").Session | null;
  error?: {
    message: string;
  };
}

const Signup = () => {
  // Form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [studentClass, setStudentClass] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [isEmailSent, setIsEmailSent] = useState(false);

  // Get auth context and navigation
  const { register, error: authError, loading } = useAuth();

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

    // Validate class format (Number 1-12 followed by letter A-Z)
    if (!studentClass) {
      setFormError("Please enter your class");
      return;
    }

    const classRegex = /^([1-9]|1[0-2])[A-Z]$/;
    if (!classRegex.test(studentClass)) {
      setFormError(
        "Class must be in format: Number(1-12) + Letter(A-Z). Example: 12F, 8B"
      );
      return;
    }

    // Validate terms agreement
    if (!agreeToTerms) {
      setFormError("You must agree to the Terms and Conditions");
      return;
    }

    try {
      // Log the data being sent
      console.log("Sending registration data:", {
        email,
        password,
        firstName,
        lastName,
        studentClass,
      });

      // Add debugging to check if we reach this point
      console.log("About to call register function...");

      // Pass firstName, lastName and class as user metadata
      const result = (await register(email, password, {
        metadata: {
          first_name: firstName,
          last_name: lastName,
          class: studentClass,
        },
      })) as AuthResponse;

      console.log("Register function returned:", result);

      if (result.error) {
        throw new Error(result.error.message);
      }

      // Only if registration is successful, show confirmation
      setIsEmailSent(true);
    } catch (error) {
      console.error("Registration failed with error:", error);
      // Log the full error object for more details
      if (error instanceof Error) {
        console.error("Error name:", error.name);
        console.error("Error message:", error.message);
        console.error("Error stack:", error.stack);
      } else {
        console.error("Unknown error type:", typeof error);
      }
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
            We've sent a confirmation email to <strong>{email}</strong>.<br />
            Please check your inbox and follow the instructions to complete your
            registration.
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
            <label htmlFor="studentClass">Class</label>
            <input
              type="text"
              id="studentClass"
              value={studentClass}
              onChange={(e) => setStudentClass(e.target.value.toUpperCase())}
              required
              disabled={loading}
              placeholder="Example: 12F, 8B"
              className="auth-input"
              maxLength={3}
            />
            <small className="form-hint">
              Enter your class as Number(1-12) + Letter(A-Z)
            </small>
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
              I agree to the{" "}
              <a href="/terms" target="_blank" rel="noopener noreferrer">
                Terms and Conditions
              </a>
            </label>
          </div>

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? "Creating Account..." : "Sign Up"}
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
