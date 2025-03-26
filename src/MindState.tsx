import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import { getDisplayName } from "./lib/userUtils";
import { supabase } from "./lib/supabase"; // Import Supabase client
import "./App.css";

interface User {
  user_metadata?: {
    class?: string;
  };
}

const getUserClass = (user: User | null): string => {
  if (!user) return "";

  // Check if class info exists in user.user_metadata
  const userClass = user.user_metadata?.class || "";

  // Extract number and letter from the class string
  const match = userClass.match(/(\d+)\s*([a-zA-Z])/);
  if (match) {
    const [, number, letter] = match;
    return `${number} ${letter}`;
  }

  return "";
};

const feelingsMap: { [key: string]: string[] } = {
  "Very Pleasant": [
    "Ecstatic",
    "Blissful",
    "Euphoric",
    "Joyful",
    "Grateful",
    "Inspired",
    "Passionate",
    "Serene",
    "Radiant",
    "Elated",
  ],
  Pleasant: [
    "Happy",
    "Content",
    "Cheerful",
    "Optimistic",
    "Hopeful",
    "Relaxed",
    "Warmhearted",
    "Excited",
    "Proud",
    "Playful",
  ],
  "Slightly Pleasant": [
    "Satisfied",
    "Calm",
    "Curious",
    "Motivated",
    "Amused",
    "Mildly Excited",
    "Friendly",
    "Confident",
    "Balanced",
    "Engaged",
  ],
  Neutral: [
    "Indifferent",
    "Unbothered",
    "Apathetic",
    "Detached",
    "Contemplative",
    "Thoughtful",
    "Peaceful",
    "Undecided",
    "Passive",
    "Level-headed",
  ],
  "Slightly Unpleasant": [
    "Disappointed",
    "Irritated",
    "Anxious",
    "Restless",
    "Uncertain",
    "Nervous",
    "Frustrated",
    "Lonely",
    "Hesitant",
    "Overwhelmed",
  ],
  Unpleasant: [
    "Sad",
    "Annoyed",
    "Worried",
    "Gloomy",
    "Drained",
    "Pessimistic",
    "Hopeless",
    "Disgusted",
    "Resentful",
    "Stressed",
  ],
  "Very Unpleasant": [
    "Devastated",
    "Enraged",
    "Terrified",
    "Miserable",
    "Desperate",
    "Heartbroken",
    "Helpless",
    "Panicked",
    "Powerless",
    "Furious",
  ],
};

const factorsMap: { [key: string]: string[] } = {
  "Very Pleasant": [
    "Achievement",
    "Love",
    "Success",
    "Celebration",
    "Compliment",
    "Adventure",
    "Music",
    "Vacation",
    "Friendship",
    "Gratitude",
    "Freedom",
    "Creativity",
    "PE",
    "Recognition",
    "Health",
    "Wealth",
  ],
  Pleasant: [
    "Sunshine",
    "Kindness",
    "Exercise",
    "Laughter",
    "Relaxation",
    "Hobbies",
    "PE",
    "Support",
    "Nature",
    "Learning",
    "Pets",
    "Harmony",
    "Generosity",
    "Progress",
    "Balance",
    "Fun",
  ],
  "Slightly Pleasant": [
    "Comfort",
    "Affection",
    "Curiosity",
    "Conversation",
    "Music",
    "Rest",
    "Discovery",
    "Stability",
    "Encouragement",
    "Reading",
    "Humor",
    "Food",
    "Recognition",
    "Productivity",
    "Surprise",
  ],
  Neutral: [
    "Routine",
    "Weather",
    "Waiting",
    "Thinking",
    "Silence",
    "Work",
    "Chores",
    "Decision-making",
    "Observation",
    "Planning",
    "Walking",
    "Reflection",
    "Meditation",
    "Conversations",
    "Commuting",
  ],
  "Slightly Unpleasant": [
    "Delay",
    "Criticism",
    "Uncertainty",
    "Hunger",
    "Fatigue",
    "Expectations",
    "Loneliness",
    "Boredom",
    "Rudeness",
    "Mess",
    "Pressure",
    "Forgetfulness",
    "Cold",
    "Deadlines",
    "Waiting",
  ],
  Unpleasant: [
    "Failure",
    "Arguments",
    "Stress",
    "Rejection",
    "Pain",
    "Debt",
    "Sickness",
    "Confusion",
    "Loss",
    "Deadlines",
    "Isolation",
    "Betrayal",
    "Overwork",
    "Criticism",
    "Noise",
  ],
  "Very Unpleasant": [
    "Death",
    "Trauma",
    "Panic",
    "Violence",
    "Heartbreak",
    "Betrayal",
    "Abuse",
    "Hopelessness",
    "Unemployment",
    "War",
    "Despair",
    "Neglect",
    "Helplessness",
    "Loss",
    "Depression",
  ],
};

// Emoji images mapping for each feeling
const emojiImages: { [key: string]: string } = {
  "Very Pleasant":
    "https://cdn3d.iconscout.com/3d/premium/thumb/starry-eyed-3d-icon-download-in-png-blend-fbx-gltf-file-formats--smiley-emoji-happy-smile-face-emoticon-vol1-pack-sign-symbols-icons-7547591.png",
  Pleasant:
    "https://cdn3d.iconscout.com/3d/premium/thumb/laugh-3d-icon-download-in-png-blend-fbx-gltf-file-formats--smiley-emoji-happy-smile-emoticon-vol1-pack-sign-symbols-icons-7547581.png",
  "Slightly Pleasant":
    "https://cdn3d.iconscout.com/3d/premium/thumb/laugh-3d-icon-download-in-png-blend-fbx-gltf-file-formats--smiley-emoji-happy-emoticon-vol1-pack-sign-symbols-icons-7547597.png",
  Neutral:
    "https://cdn3d.iconscout.com/3d/premium/thumb/without-speechless-with-no-mouth-3d-icon-download-in-png-blend-fbx-gltf-file-formats--smiley-emoji-happy-smile-face-emoticon-vol1-pack-sign-symbols-icons-7547593.png",
  "Slightly Unpleasant":
    "https://cdn3d.iconscout.com/3d/premium/thumb/confounded-3d-icon-download-in-png-blend-fbx-gltf-file-formats--sad-emoji-smiley-happy-smile-face-emoticon-vol1-pack-sign-symbols-icons-7547600.png",
  Unpleasant:
    "https://cdn3d.iconscout.com/3d/premium/thumb/loudly-crying-3d-icon-download-in-png-blend-fbx-gltf-file-formats--smiley-emoji-happy-cry-emoticon-vol1-pack-sign-symbols-icons-7547596.png",
  "Very Unpleasant":
    "https://cdn3d.iconscout.com/3d/premium/thumb/angry-3d-icon-download-in-png-blend-fbx-gltf-file-formats--emoji-smiley-happy-smile-emoticon-vol1-pack-sign-symbols-icons-7547588.png",
};

function MindState() {
  // Get user info from Supabase auth
  const { user } = useAuth();
  const userName = getDisplayName(user);

  // Use user ID for localStorage keys
  const storageKey = `mindstate-data-${user?.id || "guest"}`;

  const [feeling, setFeeling] = useState("Neutral");
  const [question2Options, setQuestion2Options] = useState<string[]>([]);
  const [question2Selected, setQuestion2Selected] = useState<string[]>([]);
  const [question3Options, setQuestion3Options] = useState<string[]>([]);
  const [question3Selected, setQuestion3Selected] = useState<string[]>([]);
  const userClass = getUserClass(user);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [fade, setFade] = useState("fade-in");
  const [message, setMessage] = useState("");
  const [imageFade, setImageFade] = useState("image-fade-in");
  const [saveError, setSaveError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Clear form function
  const clearForm = () => {
    setFeeling("Neutral");
    setQuestion2Selected([]);
    setQuestion3Selected([]);
    setCurrentQuestion(0);
  };

  const nextQuestion = () => {
    if (currentQuestion < 2) {
      setFade("fade-out");
      setTimeout(() => {
        setCurrentQuestion(currentQuestion + 1);
        setFade("fade-in");
      }, 500);
    } else {
      saveToLocalStorage();
    }
  };

  // Function to save data to Supabase
  const saveToSupabase = async () => {
    if (!user?.id) {
      console.error("No user ID available");
      return false;
    }
    
    try {
      console.log("Attempting to save mind state to Supabase...");
      
      // Use user ID as string to avoid any UUID issues
      const { error } = await supabase.from("mind_states").insert([
        {
          user_id: user.id.toString(), // Convert to string explicitly
          user_name: userName || "Anonymous",
          user_class: userClass || "",
          feeling: feeling,
          feeling_descriptions: question2Selected,
          impact_factors: question3Selected,
        },
      ]);
      
      if (error) {
        console.error("Error saving to Supabase:", error);
        setSaveError(`Failed to save data: ${error.message}`);
        return false;
      }
      
      console.log("Successfully saved mind state to Supabase");
      return true;
    } catch (err) {
      console.error("Exception saving to Supabase:", err);
      setSaveError("An unexpected error occurred");
      return false;
    }
  };

  // Updated function to save both locally and to Supabase
  const saveToLocalStorage = async () => {
    const data = {
      feeling,
      question2Selected,
      question3Selected,
    };
    localStorage.setItem(storageKey, JSON.stringify(data));
    
    // Try to save to Supabase
    await saveToSupabase();
    
    // Clear selected options
    setQuestion2Selected([]);
    setQuestion3Selected([]);
    
    setMessage("State of Mind Logged");
    setFade("fade-out");
    setTimeout(() => {
      setCurrentQuestion(3);
      setFade("fade-in");
      setTimeout(() => {
        // Clear form before navigating
        clearForm();
        navigate("/");
      }, 2000);
    }, 500);
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setFade("fade-out");
      setTimeout(() => {
        setCurrentQuestion(currentQuestion - 1);
        setFade("fade-in");
      }, 500);
    }
  };

  const toggleSelection = (
    option: string,
    selectedOptions: string[],
    setSelectedOptions: (options: string[]) => void
  ) => {
    if (selectedOptions.includes(option)) {
      setSelectedOptions(selectedOptions.filter((opt) => opt !== option));
    } else {
      setSelectedOptions([...selectedOptions, option]);
    }
  };


  useEffect(() => {
    if (feeling) {
      setQuestion2Options(feelingsMap[feeling] || []);
      setQuestion3Options(factorsMap[feeling] || []);
    }
  }, [feeling]);

  // Add image fade effect when feeling changes
  useEffect(() => {
    setImageFade("image-fade-out");
    const timer = setTimeout(() => {
      setImageFade("image-fade-in");
    }, 300);
    return () => clearTimeout(timer);
  }, [feeling]);

  useEffect(() => {
    // Clear the form on component mount
    clearForm();
    
    // Remove the localStorage load to ensure form is always fresh
    // If you still want to persist data, you could conditionally load it here
  }, []); // Empty dependency array means this runs once on mount

  return (
    <div className="mindstate-container">
      <div className="header" style={{position:"relative"}}>
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
                <span className="clarity">clairity</span> MindState
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
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
              }}
            >
              <span className="name" style={{ fontSize: "1.5rem" }}>
                {userName}
              </span>
              {userClass && (
                <span
                  className="class"
                  style={{ fontSize: "1rem", opacity: 1 }}
                >
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
      <br />

      <div
        className={`question-container ${fade}`}
        style={{
          width: window.innerWidth < 768 ? "100%" : "50%",
          margin: "0 auto",
        }}
      >
        {currentQuestion !== 3 && (
          <img
            src={emojiImages[feeling]}
            style={{ height: "30vh" }}
            alt={`${feeling} mood emoji`}
            className={imageFade}
          />
        )}

        {currentQuestion === 0 && (
          <div
            style={{
              alignItems: "center",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              width: "80%",
              margin: "0 auto",
            }}
          >
            <h2>How have you felt overall today?</h2>
            <div className="slider-labels">
              <span className="slider-label-active">{feeling}</span>
            </div>
            <input
              type="range"
              min="1"
              max="7"
              value={
                feeling
                  ? [
                      "Very Unpleasant",
                      "Unpleasant",
                      "Slightly Unpleasant",
                      "Neutral",
                      "Slightly Pleasant",
                      "Pleasant",
                      "Very Pleasant",
                    ].indexOf(feeling) + 1
                  : 4
              }
              onChange={(e) =>
                setFeeling(
                  [
                    "Very Unpleasant",
                    "Unpleasant",
                    "Slightly Unpleasant",
                    "Neutral",
                    "Slightly Pleasant",
                    "Pleasant",
                    "Very Pleasant",
                  ][parseInt(e.target.value) - 1]
                )
              }
              className="slider"
              style={{
                background:
                  {
                    "Very Pleasant": "#9f9",
                    Pleasant: "#cfc",
                    "Slightly Pleasant": "#bee5eb",
                    Neutral: "#73bfce",
                    "Slightly Unpleasant": "#ffeeba",
                    Unpleasant: "#f66",
                    "Very Unpleasant": "#f22",
                  }[feeling] || "#f8f9fa",
                transition: "all 0.5s ease-in-out",
              }}
            />
            <style>{`
              .slider {
                appearance: none;
                transition: all 0.5s ease-in-out;
              }
              .slider::-webkit-slider-thumb {
                transition: transform 0.5s ease-in-out;
              }
              .slider::-moz-range-thumb {
                transition: transform 0.5s ease-in-out;
              }
              .slider-label-active {
                transition: all 0.5s ease-in-out;
              }
            `}</style>
          </div>
        )}

        {currentQuestion === 1 && (
          <div>
            <h2>What best describes this feeling?</h2>
            {question2Options.map((opt) => (
              <button
                key={opt}
                onClick={() =>
                  toggleSelection(opt, question2Selected, setQuestion2Selected)
                }
                className={`feelingbutton ${
                  question2Selected.includes(opt) ? "feelingbuttonactive" : ""
                }`}
                style={{ transition: "all 0.3s ease" }}
              >
                {opt}
              </button>
            ))}
          </div>
        )}

        {currentQuestion === 2 && (
          <div>
            <h2> What’s having the biggest impact on you?</h2>
            {question3Options.map((opt) => (
              <button
                key={opt}
                onClick={() =>
                  toggleSelection(opt, question3Selected, setQuestion3Selected)
                }
                className={`feelingbutton ${
                  question3Selected.includes(opt) ? "feelingbuttonactive" : ""
                }`}
                style={{ transition: "all 0.3s ease" }}
              >
                {opt}
              </button>
            ))}
          </div>
        )}

        {currentQuestion === 3 && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              height: "100vh",
              fontSize: "3rem",
              color: "#277585",
              fontWeight: "bold",
            }}
          >
            {message}
            {saveError && (
              <p style={{ fontSize: "1rem", color: "#d2565b", marginTop: "1rem" }}>
                {saveError}
              </p>
            )}
          </div>
        )}
      </div>

      <div
        style={{
          display: currentQuestion === 3 ? "none" : "flex",
          justifyContent: "space-between",
          marginTop: "4rem",
          width: window.innerWidth < 768 ? "80%" : "40%",
          margin: "4rem auto",
        }}
      >
        <button
          onClick={prevQuestion}
          disabled={currentQuestion === 0}
          style={{
            backgroundColor: currentQuestion === 0 ? "#e0e0e0" : "white",
            border:
              currentQuestion === 0 ? "#c0c0c0 2px solid" : "#277585 2px solid",
            borderRadius: "2rem",
            width: "10rem",
            padding: "1rem",
            fontSize: "1.25rem",
            color: currentQuestion === 0 ? "#a0a0a0" : "#277585",
            fontWeight: "bold",
          }}
        >
          Previous
        </button>
        <button
          onClick={nextQuestion}
          style={{
            backgroundColor: "#277585",
            border: "none",
            borderRadius: "2rem",
            padding: "1rem",
            fontSize: "1.25rem",
            width: "10rem",
            fontWeight: "bold",
          }}
        >
          {currentQuestion === 2 ? "Log" : "Next"}
        </button>
      </div>

      <style>{`
        .fade-in {
          opacity: 1;
          transition: opacity 0.3s ease-in;
        }
        .fade-out {
          opacity: 0;
          transition: opacity 0.3s ease-out;
        }
        .question-container {
          transition: opacity 0.3s ease-in-out;
        }
        .image-fade-in {
          opacity: 1;
          transition: opacity 0.3s ease-in;
        }
        .image-fade-out {
          opacity: 0;
          transition: opacity 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

export default MindState;
