/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Get user data from localStorage
    const userData = localStorage.getItem(email);
    if (userData) {
      const user = JSON.parse(userData);
      if (user.password === password) {
        // Set cookie to never expire by using a far future date
        const farFutureDate = new Date(9999, 11, 31).toUTCString();
        document.cookie = `name=${user.name}; path=/; expires=${farFutureDate}`;
        navigate("/");
      } else {
        alert("Invalid credentials");
      }
    } else {
      alert("User not found");
    }
  };

  return (
    <div>
      <Link to="/">
        <p
          style={{
            fontFamily: "montserrat alternates",
            fontWeight: 700,
            fontSize: "3rem",
            color: "#277585",
          }}
        >
          <span className="Clarity">clairity</span> Log In
        </p>
      </Link>
      <form onSubmit={handleLogin} style={{ height: "100%" }}>
        <label>Email</label>
        <input
          className="authInput"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleLogin(e as any);
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
              handleLogin(e as any);
            }
          }}
        />
        <br />
        <button type="submit" className="authButton">
          {" "}
          Log In
        </button>

        <p>
          Don't have an account? <Link to="/signup">Sign Up</Link>
        </p>
      </form>

      <p className="falak">
          A Falak Project
          <br />
          <a href="https://www.falaknet.com/" target="_blank">
            www.falaknet.com
          </a>
        </p>
    </div>
  );
}

export default Login;
