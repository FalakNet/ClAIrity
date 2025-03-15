import { useState } from "react";
import { Link } from "react-router-dom";
import "./App.css";


function getCookie(name: string): string | undefined {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    const part = parts.pop();
    if (part) {
      return part.split(";").shift();
    }
  }
}

const userName = getCookie("name");

function AnxiousEase() {
  const [anxietyReason, setAnxietyReason] = useState("");


  const handleSubmit = async () => {
    if (anxietyReason.trim() === "") return;

    const response = await fetchGoogleGeminiResponse(anxietyReason);
    setResponse(response);
  };




  return (
    <div>
      <div className="header">
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <Link to="/">
              <p
                style={{
                  fontFamily: "montserrat alternates",
                  fontWeight: 700,
                  color: "#277585",
                }}
              >
                <span className="Clarity">clairity</span> MindState
              </p>
            </Link>
          </div>

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
        </div>

        <p className="securityMsg">
          {" "}
          <i className="far fa-lock-keyhole"></i>Your data remains
          confidential.
        </p>
      </div>
      <br />



    </div>
  );
}

export default AnxiousEase;
