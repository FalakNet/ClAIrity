import React, { useState } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai"; // Adjust the import path as necessary
import wellspaceLogo from "./assets/wellspace.svg";
import "./App.css";

// import VITE_GEMINI_API_KEY from .env (this is vite react app)

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

function Counselor() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const handleSend = async () => {
    if (input.trim() === "") return;

    const userMessage = { sender: "user", text: input };
    setMessages([...messages, userMessage]);

    // Simulate sending message to Google Gemini and receiving a response
    const response = await fetchGoogleGeminiResponse(input);
    const aiMessage = { sender: "ai", text: response };
    setMessages([...messages, userMessage, aiMessage]);

    setInput("");
  };

  const fetchGoogleGeminiResponse = async (message) => {
    try {
      const result = await model.generateContent(message);
      return result.response.text();
    } catch (error) {
      console.error("Error fetching response from Google Gemini:", error);
      return "Sorry, I am unable to process your request at the moment.";
    }
  };

  return (
    <div>


      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center" }}>
          <img
            src={wellspaceLogo}
            alt="wellspace Logo"
            className="logo"
            style={{ height: "2rem", padding: "0", paddingRight: "0.5rem" }}
          />
          <p style={{ fontWeight: "bold" }}>Chat</p>
        </div>


          <div className="profile" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>  
              <span className="username">AbdulRahman Maniar</span>
              <i className="fas fa-circle" style={{ color: "#3d3027" }}></i>
          </div>

      </div>


      <p className="securityMsg">
        {" "}
        <i className="far fa-lock-keyhole"></i> Your conversations remain
        confidential unless you consent to share them with a counsellor
      </p>
      <div className="chatbox">
        {messages.map((msg, index) => (
          <div key={index} className={msg.sender}>
            {msg.text}
          </div>
        ))}
      </div>

     <div>
     <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type your message..."
      />
      <button onClick={handleSend} style={{ background: "none", color: "#277585", padding: 1 }}> <i  className="far fa-paper-plane-top"></i> </button>
     </div>


    </div>

  );
}

export default Counselor;
