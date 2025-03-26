/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef } from "react";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { useAuth } from "./hooks/useAuth";
import { getDisplayName } from "./lib/userUtils";
import "./App.css";
import { Link } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

declare global {
  interface Window {
    webkitSpeechRecognition: any;
  }
}

// Function to get the user's class from metadata
interface User {
  user_metadata?: {
    class?: string;
  };
}

const getUserClass = (user: User | null): string => {
  if (!user) return '';

  // Check if class info exists in user.user_metadata
  const userClass = user.user_metadata?.class || '';
  
  // Extract number and letter from the class string
  const match = userClass.match(/(\d+)\s*([a-zA-Z])/);
  if (match) {
    const [, number, letter] = match;
    return `${number} ${letter}`;
  }

  return '';
};

function Counselor() {
  // Get user info from Supabase auth
  const { user } = useAuth();
  const userName = getDisplayName(user);
  const userClass = getUserClass(user);
  const storageKey = `clairity-chat-${user?.id || "guest"}`;

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
    if (input.trim() === "" || isTyping) {
      // Prevent sending if input is empty or bot is still typing
      return;
    }

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

    // Save the updated chat to Supabase
    try {
      const { error } = await supabase.from("active_chats").upsert([
        {
          user_id: user?.id || "guest",
          messages: JSON.stringify(finalMessages), // Save the entire conversation
          updated_at: new Date().toISOString(),
        },
      ]);

      if (error) {
        console.error("Error saving chat to Supabase:", error);
      } else {
        console.log("Chat saved successfully.");
      }
    } catch (error) {
      console.error("Error saving chat:", error);
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
        "You are Clairity, an AI trained to provide compassionate, evidence-based guidance on mental well-being. Your responses should be supportive, non-judgmental, and focused on mental health topics, such as stress, anxiety, self-care, relationships, and emotional resilience. do not provide medical diagnoses or treatment. You are based in the UAE. Instead, encourage self-reflection and positive coping strategies. Give advice if they want. DO NOT OUTPUT MARKDOWN or any * AND GIVE SHORT RESPONSES WHERE POSSIBLE. Also its okay to be unprofessional, whatever it takes to make the user happy.   Here is the conversation history: \n" +
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

  // Initialize with welcome message only if no messages exist and no active chat is loaded
  useEffect(() => {
    const initializeChat = async () => {
      if (user && !hasInitializedRef.current) {
        await loadActiveChat(); // Load chat from the database first
        if (messages.length === 0 && !hasInitializedRef.current) {
          const welcomeMessage = {
            id: generateId(),
            sender: "ai",
            text: `Hey ${userName}, How do you feel today?`,
          };
          setMessages([welcomeMessage]);
        }
        hasInitializedRef.current = true; // Ensure initialization happens only once
      }
    };

    initializeChat();
  });

  const clearChatAndShowWelcome = async () => {
    if (!messages.some((msg) => msg.sender === "user")) { 
      return;
    }

    // Immediately clear the chat and start a new conversation
    const welcomeMessage = {
      id: generateId(),
      sender: "ai",
      text: `Hey ${userName}, How do you feel today?`,
    };
    const updatedMessages = [welcomeMessage];
    setMessages(updatedMessages);
    setShowClearPopup(false);

    // Save the welcome message to the database
    try {
      const { error } = await supabase.from("active_chats").upsert([
        {
          user_id: user?.id || "guest",
          messages: JSON.stringify(updatedMessages), // Save the welcome message
          updated_at: new Date().toISOString(),
        },
      ]);

      if (error) {
        console.error("Error saving welcome message to Supabase:", error);
      } else {
        console.log("Welcome message saved successfully.");
      }
    } catch (error) {
      console.error("Error saving welcome message:", error);
    }

    // Skip creating a summary if the user has sent fewer than 4 messages
    const userMessagesCount = messages.filter((msg) => msg.sender === "user").length;
    if (userMessagesCount < 4) {
      console.log("Not enough user messages to create a summary.");
      return;
    }

    // Process Gemini summary in the background
    try {
      const conversationHistory = messages
        .map((msg) => `${msg.sender}: ${msg.text}`)
        .join("\n");
      const result = await model.generateContent(
        `You are Clairity, an AI trained to summarize conversations. Create a concise summary of the following conversation history:\n${conversationHistory}`
      );
      const summary = result.response.text();

      // Upload the summary to Supabase
      const { error: summaryError } = await supabase
        .from("chat_summaries")
        .insert([
          {
            user_id: user?.id || "guest",
            summary,
            created_at: new Date().toISOString(),
          },
        ]);

      if (summaryError) {
        console.error("Error uploading summary to Supabase:", summaryError);
      } else {
        console.log("Chat summary uploaded successfully.");
      }
    } catch (error) {
      console.error("Error processing chat summary:", error);
    }
  };

  // Load active chat from Supabase
  const loadActiveChat = async () => {
    try {
      const { data, error } = await supabase
        .from("active_chats")
        .select("messages")
        .eq("user_id", user?.id || "guest")
        .single();

      if (error) {
        console.error("Error loading active chat from Supabase:", error);
      } else if (data && data.messages) {
        setMessages(JSON.parse(data.messages)); // Load messages from Supabase
        hasInitializedRef.current = true; // Prevent further reloading
      }
    } catch (error) {
      console.error("Error loading active chat:", error);
    }
  };

  // Ensure chat is loaded only once per session
  useEffect(() => {
    if (user && !hasInitializedRef.current) {
      loadActiveChat();
    }
  });

  useEffect(() => {
    if (user) {
      const channel = supabase
        .channel(`active_chats:user_id=${user.id || "guest"}`)
        .on(
          "postgres_changes",
          {
            event: "*", // Listen to both INSERT and UPDATE events
            schema: "public",
            table: "active_chats",
            filter: `user_id=eq.${user.id || "guest"}`,
          },
          (payload) => {
            if (payload.new && (payload.new as { messages: string }).messages) {
              setMessages(JSON.parse((payload.new as { messages: string }).messages)); // Update messages in real-time
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel); // Cleanup subscription on unmount
      };
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      const intervalId = setInterval(async () => {
        try {
          const { data, error } = await supabase
            .from("active_chats")
            .select("messages")
            .eq("user_id", user?.id || "guest")
            .single();

          if (error) {
            console.error("Error polling active chat from Supabase:", error);
          } else if (data && data.messages) {
            setMessages(JSON.parse(data.messages)); // Update messages with the latest data
          }
        } catch (error) {
          console.error("Error during polling:", error);
        }
      }, 1000); // Poll every second

      return () => clearInterval(intervalId); // Cleanup interval on unmount
    }
  }, [user]);

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
                <span className="clarity">clairity</span> Chat
              </p>
            </Link>
          </div>

          <div
            className="profile"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "1rem",
              
              color: "#3d3027",
            }}
            onClick={() => setShowClearPopup(true)}
          >
           <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
              <span className="name" style={{ fontSize: "1.5rem" }}>
                {userName}
              </span>
              {userClass && (
                <span className="class" style={{ fontSize: "1rem", opacity: 1 }}>
                  Class {userClass}
                </span>
              )}
            </div>
            
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
            if (e.key === "Enter" && !isTyping) {
              // Prevent sending if bot is still typing
              handleSend();
            }
          }}
        />

        <button onClick={handleSend} disabled={isTyping}> {/* Disable button while bot is typing */}
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
                  onClick={clearChatAndShowWelcome} // Use the new function
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
