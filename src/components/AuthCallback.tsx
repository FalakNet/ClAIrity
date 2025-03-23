import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

const AuthCallback = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Handle the OAuth callback
    const handleAuthCallback = async () => {
      console.log("Auth callback started, checking session...");

      try {
        // Get the current session state
        const { data: sessionData } = await supabase.auth.getSession();
        console.log(
          "Session state:",
          sessionData?.session ? "Active session" : "No session"
        );

        // Check if we have an access token in the URL
        const hash = window.location.hash;
        console.log("URL hash present:", !!hash);

        if (hash && hash.includes("access_token")) {
          console.log("Access token found in URL");

          try {
            // Get the user data to confirm auth worked
            const { data, error: userError } = await supabase.auth.getUser();

            if (userError) {
              console.error("Error getting user:", userError);
              setError(userError.message);
              // Still redirect to login after a delay
              setTimeout(() => navigate("/login", { replace: true }), 3000);
              return;
            }

            console.log("User authenticated:", !!data?.user);

            // Always redirect to login with a success message
            console.log("Redirecting to login page...");
            navigate("/login", {
              replace: true,
              state: {
                message: "Your email has been verified. You can now log in.",
              },
            });
          } catch (error) {
            console.error("Auth callback error:", error);
            setError((error as Error).message);
            setTimeout(() => navigate("/login", { replace: true }), 3000);
          }
        } else {
          console.log("No access token found, redirecting to login...");
          navigate("/login", { replace: true });
        }
      } catch (e) {
        console.error("Critical error in auth callback:", e);
        setError((e as Error).message);
        setTimeout(() => navigate("/login", { replace: true }), 3000);
      }
    };

    handleAuthCallback();
  }, [navigate]);

  if (error) {
    return (
      <div
        style={{
          padding: "2rem",
          maxWidth: "600px",
          margin: "0 auto",
          textAlign: "center",
        }}
      >
        <h2 style={{ color: "#d32f2f" }}>Authentication Error</h2>
        <p>{error}</p>
        <p>Redirecting to login page...</p>
      </div>
    );
  }

  return (
    <div
      className="loading"
      style={{
        fontSize: "2rem",
        fontFamily: "'Montserrat Alternates', sans-serif",
        fontWeight: 700,
        color: "#277585",
        textAlign: "center",
        padding: "2rem",
      }}
    >
      <p>Processing verification...</p>
      <br />
      <p style={{ fontSize: "1rem", opacity: 0.7 }}>
        Please wait while we verify your account.
      </p>
    </div>
  );
};

export default AuthCallback;
