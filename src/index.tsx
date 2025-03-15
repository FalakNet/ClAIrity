import React from 'react';
import { Link } from 'react-router-dom';
import falakLogo from "./assets/falak.svg";
import wellspaceLogo from "./assets/wellspace.svg";
import "./App.css";

function Index() {
  return (
    <div className="card">
      <div>
        <div style={{ display: "flex", justifyContent: "space-around" }}>
          <img
            src={wellspaceLogo}
            alt="wellspace Logo"
            className="logo"
            style={{ fill: "#79b4b0" }}
          />
          <img
            src={falakLogo}
            alt="Falak Logo"
            className="logo"
            style={{ fill: "#79b4b0" }}
          />
        </div>
        <h1>Wellspace Portal</h1>
      </div>
      <p>
        Your AI-powered mental health companion. Share how you feel and get
        instant support for the challenges you face. Connect with a counselor
        to resolve your issues and find the care you need, when you need it
        most.
      </p>

{/*  */}
      <div style={{ display: "flex", gap: "1.5rem", justifyContent: "center", flexDirection: window.innerWidth <= 768 ? "column" : "row" }}>
        <Link to="/counselor"><button>AI Counselor</button></Link>
        <Link to="/anxiousease"><button>AnxiousEase</button></Link>
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
