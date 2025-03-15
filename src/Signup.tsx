/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

function Signup() {
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const navigate = useNavigate();

  const handleSignup = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const user = { name, email, password };
    localStorage.setItem(email, JSON.stringify(user));
    
    // Set cookie to never expire by using a far future date
    const farFutureDate = new Date(9999, 11, 31).toUTCString();
    document.cookie = `name=${name}; path=/; expires=${farFutureDate}`;
    
    navigate('/');
  };

  return (
    <div>

<p
        style={{
          fontFamily: "montserrat alternates",
          fontWeight: 700,
          fontSize: "3rem",
          color: "#277585",
        }}
      >
        <span className="Clarity">clairity</span> Sign Up
      </p>
      <form onSubmit={handleSignup} style={{ height: "100%" }}>

      <label>Name</label>
        <input
          className="authInput"
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSignup(e as any);
            }
          }}
        />
        <br />

        <label>Email</label>
        <input
          className="authInput"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSignup(e as any);
            }
          }}
        />
        <br />
        <label>Password</label>

        <input
          className="authInput"
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSignup(e as any);
            }
          }}
        />
        <br />
        <button type="submit" className="authButton">
          {" "}
          Login
        </button>
      </form>

      <p>
                Already have an account? <Link to="/login">Log In</Link>
              </p>
    
    </div>
  );
}

export default Signup;
