import { useState, useEffect, useRef } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai"; // Adjust the import path as necessary
import "./App.css";

// import VITE_GEMINI_API_KEY from .env (this is vite react app)

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    const part = parts.pop();
    if (part) {
      return part.split(";").shift();
    }
  }
}

function Counselor() {
  const [messages, setMessages] = useState<
    { id: string; sender: string; text: string }[]
  >([]);
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const chatboxRef = useRef<HTMLDivElement>(null);
  const userName = getCookie("name");

  useEffect(() => {
    if (userName) {
      setIsLoggedIn(true);
    } else {
      setIsLoggedIn(false);
      window.location.href = "/login"; // Redirect to login page if not logged in
    }
  }, [userName]);

  const handleSend = async () => {
    if (input.trim() === "") return;

    const userMessage = { id: generateId(), sender: "user", text: input };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput(""); // Clear the input as soon as the user hits send

    setIsTyping(true); // Show typing indicator

    // Simulate sending message to Google Gemini and receiving a response
    const response = await fetchGoogleGeminiResponse(updatedMessages);
    const aiMessage = { id: generateId(), sender: "ai", text: response };
    const finalMessages = [...updatedMessages, aiMessage];
    setMessages(finalMessages);

    setIsTyping(false); // Hide typing indicator
  };

  const fetchGoogleGeminiResponse = async (conversation) => {
    try {
      const conversationHistory = conversation
        .map((msg) => `${msg.sender}: ${msg.text}`)
        .join("\n");
      const result = await model.generateContent(
        "You are Clairity, an AI trained to provide compassionate, evidence-based guidance on mental well-being. Your responses should be supportive, non-judgmental, and focused on mental health topics, such as stress, anxiety, self-care, relationships, and emotional resilience. Avoid discussing unrelated topics and do not provide medical diagnoses or treatment. Instead, encourage self-reflection and positive coping strategies. Give advice if they want. DO NOT OUTPUT MARKDOWN AND GIVE SHORT RESPONSES WHERE POSSIBLE. Here is the conversation history: \n" +
          conversationHistory
      );
      return result.response.text();
    } catch (error) {
      console.error("Error fetching response from Google Gemini:", error);
      return "Sorry, I am unable to process your request at the moment.";
    }
  };

  const handleVoiceInput = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Your browser does not support speech recognition.");
      return;
    }

    const recognition = new webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
      handleSend(); // Auto-send the message when recognition ends
    };

    recognition.start();
  };

  const generateId = () => "_" + Math.random().toString(36).substr(2, 9);

  useEffect(() => {
    if (messages.length > 0) {
      const lastMessageId = messages[messages.length - 1].id;
      const lastMessageElement = document.getElementById(lastMessageId);
      if (lastMessageElement) {
        lastMessageElement.scrollIntoView({ behavior: "smooth" });
        lastMessageElement.classList.add("fade-in");
      }
    }
  }, [messages]);

  useEffect(() => {
    const firstName = userName ? userName.split(" ")[0] : "there";
    const welcomeMessage = {
      id: generateId(),
      sender: "ai",
      text: `Hey ${firstName}, How do you feel today?`,
    };
    setMessages([welcomeMessage]);
  }, []);

  return (
    <div>
      <div className="header">
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            
            <p style={{ fontFamily: "montserrat alternates", fontWeight: 700 }}>
            <span className="Clarity">clairity</span> Chat
            </p>
          </div>

          <div
            className="profile"
            style={{ display: "flex", alignItems: "center", gap: "0.5rem", color: "#3d3027" }}
          >
            <span className="name">{userName}</span>
            <i className="fas fa-circle"  style={{fontSize: "1.5rem"}}></i>
          </div>
        </div>

        <p className="securityMsg">
          {" "}
          <i className="far fa-lock-keyhole"></i> Your conversations remain
          confidential unless you consent to share them with a counsellor
        </p>
      </div>
      <div className="chatbox" ref={chatboxRef}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            id={msg.id}
            className={`${msg.sender} fade-in`}
            style={{
              display: "flex",
              justifyContent: msg.sender === "user" ? "flex-end" : "flex-start",
              fontWeight: 500,
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
                fontSize: "1.2rem",
                fontWeight: 700,
              }}
            >
              <i className="fas fa-circle"></i>
              <br />
              {msg.text}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="typing-indicator">
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
          </div>
        )}
      </div>

      <div className="input">
        <button
          onClick={handleVoiceInput}
          disabled={isListening}
          className={isListening ? "listening" : ""}
        >
          {" "}
          <i className="far fa-microphone"></i>{" "}
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
