import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth";
import { getDisplayName } from "./lib/userUtils";
import "./App.css";

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
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [fade, setFade] = useState("fade-in");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

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

  const saveToLocalStorage = () => {
    const data = {
      feeling,
      question2Selected,
      question3Selected,
    };
    localStorage.setItem(storageKey, JSON.stringify(data));
    setMessage("State of Mind Logged");
    setFade("fade-out");
    setTimeout(() => {
      setCurrentQuestion(3);
      setFade("fade-in");
      setTimeout(() => {
        navigate("/");
      }, 2000);
    }, 500);
  };

  useEffect(() => {
    if (feeling) {
      setQuestion2Options(feelingsMap[feeling] || []);
      setQuestion3Options(factorsMap[feeling] || []);
    }
  }, [feeling]);

  useEffect(() => {
    setFeeling("Neutral");
  }, []);

  useEffect(() => {
    const savedData = localStorage.getItem(storageKey);
    if (savedData) {
      const data = JSON.parse(savedData);
      setFeeling(data.feeling);
      setQuestion2Selected(data.question2Selected);
      setQuestion3Selected(data.question3Selected);
    }
  }, [storageKey]);

  return (
    <div className="mindstate-container">
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
                <span className="clarity">clairity</span> MindState
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
      <br />

      <div className={`question-container ${fade}`}>
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
                      "Very Pleasant",
                      "Pleasant",
                      "Slightly Pleasant",
                      "Neutral",
                      "Slightly Unpleasant",
                      "Unpleasant",
                      "Very Unpleasant",
                    ].indexOf(feeling) + 1
                  : 4
              }
              onChange={(e) =>
                setFeeling(
                  [
                    "Very Pleasant",
                    "Pleasant",
                    "Slightly Pleasant",
                    "Neutral",
                    "Slightly Unpleasant",
                    "Unpleasant",
                    "Very Unpleasant",
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
              justifyContent: "center",
              alignItems: "center",
              height: "100vh",
              fontSize: "3rem",
              color: "#277585",
              fontWeight: "bold",
            }}
          >
            {message}
          </div>
        )}
      </div>

      <div
        style={{
          display: currentQuestion === 3 ? "none" : "flex",
          justifyContent: "space-between",
          marginTop: "4rem",
          width: "80%",
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
      `}</style>
    </div>
  );
}

export default MindState;
