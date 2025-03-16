/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai"; // Adjust the import path as necessary
import "./App.css";
import { Link } from "react-router-dom";
// import { sendNotification } from './noticall.js';

// import VITE_GEMINI_API_KEY from .env (this is vite react app)

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

declare global {
  interface Window {
    webkitSpeechRecognition: any;
  }
}

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

function Counselor() {
  const userName = getCookie("name");
  const storageKey = `clairity-chat-${userName || "guest"}`;

  // Load messages from localStorage or initialize with empty array
  const [messages, setMessages] = useState<
    { id: string; sender: string; text: string }[]
  >(() => {
    const savedMessages = localStorage.getItem(storageKey);
    return savedMessages ? JSON.parse(savedMessages) : [];
  });

  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showClearPopup, setShowClearPopup] = useState(false);
  const [isOverlayVisible, setIsOverlayVisible] = useState(false);
  const [overlayClass, setOverlayClass] = useState("fade-out");
  const chatboxRef = useRef<HTMLDivElement>(null);
  const hasInitializedRef = useRef(false);

  useEffect(() => {
    if (userName) {
      // ...existing code...
    } else {
      // ...existing code...
      window.location.href = "/login"; // Redirect to login page if not logged in
    }
  }, [userName]);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem(storageKey, JSON.stringify(messages));
    }
  }, [messages, storageKey]);

  useEffect(() => {
    if (showClearPopup) {
      setIsOverlayVisible(true);
      setTimeout(() => setOverlayClass("fade-in"), 0);
    } else {
      setOverlayClass("fade-out");
      setTimeout(() => setIsOverlayVisible(false), 300);
    }
  }, [showClearPopup]);

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

    // Check for suicide risk
    const riskResponse = await checkSuicideRisk(updatedMessages);
    if (riskResponse.toLowerCase().includes("yes")) {
      alert(
        "Authorities Notified..."
      );

      // Use hardcoded coordinates
      const latitude = 25.132417;
      const longitude = 55.422028;
      const userPhone = getCookie("phone");
      const policeMessage = await createPoliceMessage(updatedMessages, latitude, longitude, userName, userPhone);

      console.log(policeMessage)
      
    }

    setIsTyping(false); // Hide typing indicator
  };

  const fetchGoogleGeminiResponse = async (
    conversation: { id: string; sender: string; text: string }[]
  ) => {
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

  const checkSuicideRisk = async (
    conversation: { id: string; sender: string; text: string }[]
  ) => {
    try {
      const conversationHistory = conversation
        .map((msg) => `${msg.sender}: ${msg.text}`)
        .join("\n");
      const result = await model.generateContent(
        "You are Clairity, an AI trained to assess the risk of suicide based on conversation history. Respond with 'yes' if you think the person is at risk of suicide, otherwise respond with 'no'. Here is the conversation history: \n" +
          conversationHistory
      );
      return result.response.text();
    } catch (error) {
      console.error("Error checking suicide risk with Google Gemini:", error);
      return "no";
    }
  };

  const createPoliceMessage = async (
    conversation: { id: string; sender: string; text: string }[],
    latitude: number,
    longitude: number,
    userName: string | undefined,
    userPhone: string | undefined
  ) => {
    try {
      const conversationHistory = conversation
        .map((msg) => `${msg.sender}: ${msg.text}`)
        .join("\n");
      const result = await model.generateContent(
        `You are Clairity, an AI trained to create emergency messages for the police. Based on the conversation history, the user's current location, and the user's name and phone number, create a message to be sent to the police. Here is the conversation history: \n${conversationHistory}\nUser's location: Latitude ${latitude}, Longitude ${longitude}\nUser's name: ${userName}\nUser's phone number: ${userPhone}. This is an emergency, do not redact the phone number. Please alert the authorities about the situation and the location.`
      );
      return result.response.text();
    } catch (error) {
      console.error("Error creating police message with Google Gemini:", error);
      return "Unable to create a message for the police at the moment.";
    }
  };

  const handleVoiceInput = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Your browser does not support speech recognition.");
      return;
    }

    const recognition = new window.webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
    };

    recognition.onerror = (event: any) => {
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

  // Initialize with welcome message only if no messages exist
  useEffect(() => {
    if (!hasInitializedRef.current && messages.length === 0 && userName) {
      const firstName = userName.split(" ")[0];
      const welcomeMessage = {
        id: generateId(),
        sender: "ai",
        text: `Hey ${firstName}, How do you feel today?`,
      };
      setMessages([welcomeMessage]);
      hasInitializedRef.current = true;
    }
  }, [userName, messages.length]);

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
                <span className="Clarity">clairity</span> Chat
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
            onClick={() => setShowClearPopup(true)}
          >
            <span className="name" style={{ cursor: "pointer" }}>
              {userName}
            </span>
            <i className="fas fa-circle" style={{ fontSize: "1.5rem" }}></i>
          </div>
        </div>

        <p className="securityMsg">
          {" "}
          <i className="far fa-lock-keyhole"></i> Your data remains
          confidential.
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
      {isOverlayVisible && (
        <>
          <style>{`
            .popup-overlay {
              position: fixed;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background-color: rgba(0, 0, 0, 0.5);
              display: flex;
              align-items: center;
              justify-content: center;
              z-index: 1000;
              transition: opacity 0.3s ease-in-out;
            }
            .fade-in {
              opacity: 1;
            }
            .fade-out {
              opacity: 0;
            }
          `}</style>
          <div
            className={`popup-overlay ${overlayClass}`}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setShowClearPopup(false);
              }
            }}
          >
            <div
              style={{
                // ...existing code...
                background: "white",
                border: "1px solid #ccc",
                borderRadius: "2rem",
                padding: "3rem 1.5rem",
                color: "#000",
                width: "75%",
                maxWidth: "600px",
              }}
            >
              <p>Clear this chat?</p>
              <div
                style={{
                  display: "flex",
                  gap: "1rem",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <button
                  onClick={() => {
                    setMessages([]);
                    setShowClearPopup(false);
                  }}
                  style={{
                    color: "#000",
                    border: "1px solid #ccc",
                    borderRadius: "2rem",
                    backgroundColor: "#f4e1e1",
                    padding: "0.5em 2rem",
                    fontSize: "1.5rem",
                    pointerEvents: "all",
                    cursor: "pointer",
                  }}
                >
                  Clear
                </button>
                <button
                  onClick={() => setShowClearPopup(false)}
                  style={{
                    color: "#000",
                    border: "1px solid #ccc",
                    borderRadius: "2rem",
                    fontSize: "1.5rem",
                    backgroundColor: "#e1f4ea",
                    padding: "0.5em 2rem",
                    pointerEvents: "all",
                    cursor: "pointer",
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Counselor;
