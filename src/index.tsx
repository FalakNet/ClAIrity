import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import falakLogo from "./assets/falak.svg";
import "./App.css";

function Index() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    const name = getCookie("name");
    if (name) {
      setIsLoggedIn(true);
      setUserName(name);
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  const handleLogout = () => {
    setIsFading(true);
    setTimeout(() => {
      document.cookie = "name=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      setIsLoggedIn(false);
      setUserName("");
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
            className={`profile ${isFading ? 'fade-out' : 'fade-in'}`}
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
          <div className={isFading ? 'fade-in-delayed' : 'fade-in'} 
               style={{ transition: "opacity 0.5s ease-in" }}>
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
            <img
              src={falakLogo}
              alt="Falak Logo"
              className="logo"
              style={{
                fill: "#79b4b0",
                display: window.innerWidth <= 768 ? "none" : "block",
              }}
            />
          </div>
          <h1>Clairity Portal</h1>
        </div>
        <p style={{ width: "75%", margin: "auto", paddingBottom: "2rem" }}>
          Your AI-powered mental health companion. Share how you feel and get
          instant support for the challenges you face. Connect with a counselor
          to resolve your issues and find the care you need, when you need it
          most.
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
            <button className="homebutton">AI Counselor</button>
          </Link>
          <Link to={isLoggedIn ? "/anxiousease" : "/login"}>
            <button className="homebutton">AnxiousEase</button>
          </Link>
        </div>

        <p className="falak">
          A Falak Project
          <br />
          <a href="https://www.falaknet.com/" target="_blank">
            www.falaknet.com
          </a>
        </p>
      </div>
    </div>
  );
}

export default Index;

function getCookie(name: string) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || "";
  return "";
}
