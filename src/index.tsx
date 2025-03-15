import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import falakLogo from "./assets/falak.svg";
import "./App.css";

function Index() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState("");

  useEffect(() => {
    // Check if the user is logged in
    const user = localStorage.getItem("user");
    if (user) {
      const parsedUser = JSON.parse(user);
      setIsLoggedIn(true);
      setUserName(parsedUser.name || parsedUser.username || "User");
    }
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  return (
    <div className="card">
      <div
        style={{ right: "0", position: "absolute", padding: "1rem", top: "0" }}
      >
        {isLoggedIn ? (
          <div
            className="profile"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              color: "#3d3027",
            }}
          >
            <span className="name">{userName}</span>
            <i className="fas fa-circle" style={{ fontSize: "1.5rem" }}></i>
          </div>
        ) : (
          <>
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
          </>
        )}
      </div>
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
      <p>
        Your AI-powered mental health companion. Share how you feel and get
        instant support for the challenges you face. Connect with a counselor to
        resolve your issues and find the care you need, when you need it most.
      </p>

      <div
        style={{
          display: "flex",
          gap: "1.5rem",
          justifyContent: "center",
          flexDirection: window.innerWidth <= 768 ? "column" : "row",
        }}
      >
        <Link to="/counselor">
          <button className="homebutton">AI Counselor</button>
        </Link>
        <Link to="/anxiousease">
          <button className="homebutton">AnxiousEase</button>
        </Link>
        {/* <Link to="/login"><button className='homebutton'>Login</button></Link>
        <Link to="/signup"><button className='homebutton'>Signup</button></Link> */}
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
