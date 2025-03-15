import { useState } from "react";
import { Link } from "react-router-dom";
import { GoogleGenerativeAI } from "@google/generative-ai"; // Adjust the import path as necessary
import "./App.css";

// import VITE_GEMINI_API_KEY from .env (this is vite react app)

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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
  const [response, setResponse] = useState("");
  const [severityScore, setSeverityScore] = useState("");
  const [quote, setQuote] = useState("");
  const [servImg, setServImg] = useState("");
  const [encouragement, setEncouragement] = useState("");
  const [ideas, setIdeas] = useState<string[]>([]);

  const handleSubmit = async () => {
    if (anxietyReason.trim() === "") return;

    const response = await fetchGoogleGeminiResponse(anxietyReason);
    setResponse(response);
  };

  const fetchGoogleGeminiResponse = async (input: string) => {
    try {
      const result = await model.generateContent(
        `You are an AI providing compassionate guidance on mental well-being. Your responses should be supportive, non-judgmental, and focused on mental health topics. Avoid unrelated topics and do not provide medical diagnoses. Encourage self-reflection and positive coping strategies. MAX 60 WORDS. User input: \n${input}`
      );
      const responseText = await result.response.text();

      // Generate severity score
      const severityResult = await model.generateContent(
        `Based on the following input, generate a severity score from 1 (low) to 5 (high). ONLY GIVE NUMBER NO OTHER TEXT: \n${input}`
      );
      const severityScore = await severityResult.response.text();
      setSeverityScore(severityScore.trim());

      // Generate quote
      const quoteResult = await model.generateContent(
        `Based on the following input, generate a motivational quote AND DO NOT OUTPUT MARKDOWN: \n${input}`
      );
      const quote = await quoteResult.response.text();

      // Generate words of encouragement
      const encouragementResult = await model.generateContent(
        `Based on the following input, generate some words of encouragement. AND DO NOT OUTPUT MARKDOWN: \n${input}`
      );
      const encouragement = await encouragementResult.response.text();

      // Generate ideas on how to help
      const ideasResult = await model.generateContent(
        `Based on the following input, generate three ideas on how to help, ONLY GIVE 3 IDEAS NO ADDITIONAL TEXT AND DO NOT OUTPUT MARKDOWN. divide each idea with |: \n${input}`
      );
      const ideas = (await ideasResult.response.text()).split("|");

      // Severity score color codes
      const severityImages = {
        "1":
          window.innerWidth > 768
            ? "https://placehold.co/200/green/white?text=1"
            : "https://placehold.co/400x100/green/white?text=1",
        "2":
          window.innerWidth > 768
            ? "https://placehold.co/200/lightgreen/white?text=2"
            : "https://placehold.co/400x100/lightgreen/white?text=2",
        "3":
          window.innerWidth > 768
            ? "https://placehold.co/200/gold/white?text=3"
            : "https://placehold.co/400x100/gold/white?text=3",
        "4":
          window.innerWidth > 768
            ? "https://placehold.co/200/cd5c5c/white?text=4"
            : "https://placehold.co/400x100/cd5c5c/white?text=4",
        "5":
          window.innerWidth > 768
            ? "https://placehold.co/200/red/white?text=5"
            : "https://placehold.co/400x100/red/white?text=5",
      };
      setServImg(
        severityImages[severityScore.trim() as keyof typeof severityImages]
      );
      setQuote(quote);
      setEncouragement(encouragement);
      setIdeas(ideas);

      return responseText;
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
            <Link to="/">
              <p
                style={{
                  fontFamily: "montserrat alternates",
                  fontWeight: 700,
                  color: "#277585",
                }}
              >
                <span className="Clarity">clairity</span> AnxiousEase
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

      <div className="anxiousease">
        <h2 style={{ textAlign: "left", paddingLeft: "3rem" }}>
          What are you feeling anxious about?
        </h2>

        <input
          type="text"
          value={anxietyReason}
          onChange={(e) => setAnxietyReason(e.target.value)}
          placeholder="Tell me what's bothering you..."
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSubmit();
            }
          }}
        />
        <br />
        <br />
        <button type="submit" onClick={handleSubmit}>
          Submit
        </button>
        <br />
        <br />

        {response && (
          <div className="anxiousbox">
            {/* flex direction row if desktop or column if phone */}
            <div
              style={{
                display: "flex",
                gap: "1rem",
                flexDirection: window.innerWidth > 768 ? "row" : "column",
              }}
            >
              <img src={servImg} alt="Severity Score" />
              <div>
                <p style={{ fontSize: "1rem" }}>{response}</p>
                <h2>Severity Score: {severityScore}</h2>
              </div>
            </div>
          </div>
        )}

        {response && (
          <div className="anxiousbox">
            <div style={{ padding: "1rem" }}>
              <h2>{quote}</h2>
              <p style={{ fontSize: "1rem" }}>{encouragement}</p>
            </div>
          </div>
        )}

        {response && (
          <div className="anxiousbox">
            <div style={{ padding: "1rem" }}>
              <div>
                <h2>How to help?</h2>
                <div
                  style={{
                    fontSize: "0.75rem",
                    textAlign: "center",
                    display: "flex",
                    flexDirection: window.innerWidth > 768 ? "row" : "column",
                  }}
                >
                  {ideas.map((idea, index) => (
                    <div
                      key={index}
                      style={{
                        marginBottom: "1rem",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <p>{idea.split("|").join(" | ")}</p>
                      {index < ideas.length - 1 && (
                        <hr
                          style={{
                            margin:
                              window.innerWidth > 768 ? "0 1rem" : "1rem 0",
                            height: window.innerWidth > 768 ? "100%" : "1px",
                            width: window.innerWidth > 768 ? "1px" : "100%",
                            backgroundColor: "black",
                            border: "none",
                          }}
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AnxiousEase;
