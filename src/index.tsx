import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "./hooks/useAuth";
import { getDisplayName } from "./lib/userUtils";
import "./App.css";

function Index() {
  const { user } = useAuth();
  const userName = getDisplayName(user);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    if (user) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
    }

    // Disable scrolling
    document.body.style.overflow = "hidden";
    return () => {
      // Re-enable scrolling when component unmounts
      document.body.style.overflow = "auto";
    };
  }, [user]);

  const handleLogout = () => {
    setIsFading(true);
    setTimeout(() => {
      document.cookie = "name=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      setIsLoggedIn(false);
      setIsFading(false);
    }, 500); // Duration should match CSS transition time
  };

  return (
    <div className="card">
      <div
        style={{ right: "0", position: "absolute", padding: "1rem", top: "0" }}
      >
        {isLoggedIn ? (
          <div
            className={`profile ${isFading ? "fade-out" : "fade-in"}`}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              color: "#3d3027",
              padding: "1rem",
              cursor: "pointer",
              transition: "opacity 0.5s ease-out",
            }}
            onClick={handleLogout}
          >
            <span className="name" style={{ fontSize: "1.5rem" }}>
              {userName}
            </span>
            <i className="fas fa-circle" style={{ fontSize: "1.5rem" }}></i>
          </div>
        ) : (
          <div
            className={isFading ? "fade-in-delayed" : "fade-in"}
            style={{ transition: "opacity 0.5s ease-in" }}
          >
            <Link to="/login">
              <button
                className="homebutton"
                style={{
                  padding: "1rem 1.5rem",
                  marginRight: "1rem",
                  fontSize: "1rem",
                  backgroundColor: "white",
                  border: "#277585 2px solid",
                  color: "#277585",
                  fontWeight: "bold",
                }}
              >
                Login
              </button>
            </Link>
            <Link to="/signup">
              <button
                className="homebutton"
                style={{ padding: "1rem 1.5rem", fontSize: "1rem" }}
              >
                Signup
              </button>
            </Link>
          </div>
        )}
      </div>
      <div>
        <div>
          <div style={{ display: "flex", justifyContent: "space-around" }}>
            <h1 className="Clarity">clairity</h1>
          </div>
        </div>
        <p style={{ width: "75%", margin: "auto", paddingBottom: "2rem" }}>
          Your AI-powered mental health companion.
        </p>

        <div
          style={{
            display: "flex",
            gap: "1.5rem",
            justifyContent: "center",
            flexDirection: window.innerWidth <= 768 ? "column" : "row",
          }}
        >
          <Link to={isLoggedIn ? "/counselor" : "/login"}>
            <button className="homebutton">Clairity Counselor</button>
          </Link>
          <Link to={isLoggedIn ? "/anxiousease" : "/login"}>
            <button className="homebutton">AnxiousEase</button>
          </Link>
          <Link to={isLoggedIn ? "/mindstate" : "/login"}>
            <button className="homebutton">MindState</button>
          </Link>
        </div>
      </div>
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

export default Index;