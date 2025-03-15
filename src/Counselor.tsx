import { useState } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai"; // Adjust the import path as necessary
import wellspaceLogo from "./assets/wellspace.svg";
import "./App.css";

// import VITE_GEMINI_API_KEY from .env (this is vite react app)

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

function Counselor() {
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>(
    []
  );
  const [input, setInput] = useState("");

  const handleSend = async () => {
    if (input.trim() === "") return;

    const userMessage = { sender: "user", text: input };
    setMessages([...messages, userMessage]);
    setInput(""); // Clear the input as soon as the user hits send

    // Simulate sending message to Google Gemini and receiving a response
    const response = await fetchGoogleGeminiResponse([
      ...messages,
      userMessage,
    ]);
    const aiMessage = { sender: "ai", text: response };
    setMessages((prevMessages) => [...prevMessages, aiMessage]);
  };

  const fetchGoogleGeminiResponse = async (conversation) => {
    try {
      const conversationHistory = conversation
        .map((msg) => `${msg.sender}: ${msg.text}`)
        .join("\n");
      const result = await model.generateContent(
        "You are Clarity, an AI trained to provide compassionate, evidence-based guidance on mental well-being. Your responses should be supportive, non-judgmental, and focused on mental health topics, such as stress, anxiety, self-care, relationships, and emotional resilience. Avoid discussing unrelated topics and do not provide medical diagnoses or treatment. Instead, encourage self-reflection and positive coping strategies. DO NOT OUTPUT MARKDOWN AND GIVE SHORT RESPONSES WHERE POSSIBLE. Here is the conversation history: \n" +
          conversationHistory
      );
      return result.response.text();
    } catch (error) {
      console.error("Error fetching response from Google Gemini:", error);
      return "Sorry, I am unable to process your request at the moment.";
    }
  };

  return (
    <div>
      <div className="header">
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <img
              src={wellspaceLogo}
              alt="wellspace Logo"
              className="logo"
              style={{ height: "2rem", padding: "0", paddingRight: "0.5rem" }}
            />
            <p style={{ fontFamily: "montserrat alternates", fontWeight: 700 }}>
              Chat
            </p>
          </div>

          <div
            className="profile"
            style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
          >
            <span className="name">AbdulRahman Maniar</span>
            <i className="fas fa-circle" style={{ color: "#3d3027" }}></i>
          </div>
        </div>

        <p className="securityMsg">
          {" "}
          <i className="far fa-lock-keyhole"></i> Your conversations remain
          confidential unless you consent to share them with a counsellor
        </p>
      </div>
      <div className="chatbox">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={msg.sender}
            style={{
              display: "flex",
              justifyContent: msg.sender === "user" ? "flex-end" : "flex-start",
              marginBottom: "0.5rem",
            }}
          >
            <div
              style={{
                maxWidth: "75%",
                wordWrap: "break-word",
                padding: "0.5rem",
                borderRadius: "10px",
                textAlign: msg.sender === "user" ? "right" : "left",
                color: msg.sender === "user" ? "#4f3422" : "#277585",
              }}
            >
              {msg.text}
            </div>
          </div>
        ))}
      </div>

      <p className="botMsg"></p>
      <p className="userMsg"></p>

      <div className="input">
        <button onClick={handleSend}>
          {" "}
          <i className="far fa-microphone"></i>{" "}
        </button>

        <button onClick={handleSend}>
          {" "}
          <i className="far fa-image"></i>{" "}
        </button>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Tell me whats bothering you..."
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSend();
            }
          }}
        />

        <button onClick={handleSend}>
          {" "}
          <i className="far fa-paper-plane-top"></i>{" "}
        </button>
      </div>
    </div>
  );
}

export default Counselor;
