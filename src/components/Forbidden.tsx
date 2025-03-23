import { Link } from "react-router-dom";

function Forbidden() {
  return (
    <div className="forbidden" style={{ 
      textAlign: "center", 
      padding: "3rem 1rem",
      maxWidth: "600px",
      margin: "0 auto"
    }}>
      <h1 style={{ color: "#d2565b" }}>access denied</h1>
      <p style={{ fontSize: "1.2rem", marginBottom: "2rem" }}>
        You don't have permission to access this page.
      </p>
      <Link 
        to="/" 
        style={{
          display: "inline-block",
          background: "#277585",
          color: "white",
          padding: "0.75rem 1.5rem",
          borderRadius: "0.5rem",
          textDecoration: "none",
          fontWeight: "bold"
        }}
      >
        Return to Home
      </Link>
    </div>
  );
}

export default Forbidden;
