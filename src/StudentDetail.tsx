import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { supabase, supabaseAdmin } from "./lib/supabase";
import { useAuth } from "./hooks/useAuth";
import { getDisplayName } from "./lib/userUtils";
import "./App.css";

interface StudentEntry {
  id: number;
  severity: string;
  user_input: string;
  ai_output: string;
  created_at: string;
  user?: string;
}

function StudentDetail() {
  const { studentId } = useParams<{ studentId: string }>();
  const { user } = useAuth();
  const userName = getDisplayName(user);

  const [studentName, setStudentName] = useState<string>("");
  const [entries, setEntries] = useState<StudentEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEntries: 0,
    averageSeverity: 0,
    highSeverityCount: 0,
  });

  useEffect(() => {
    const fetchStudentData = async () => {
      if (!studentId) return;

      try {
        setIsLoading(true);

        // Try with admin client first to bypass RLS
        let { data } = await supabaseAdmin
          .from("anxious_summaries")
          .select("*")
          .eq("user_id", studentId)
          .order("created_at", { ascending: false });

        const error = await supabaseAdmin
          .from("anxious_summaries")
          .select("*")
          .eq("user_id", studentId)
          .order("created_at", { ascending: false });

        // If admin client fails, try using the regular client (with RLS)
        if (error) {
          console.error("Admin client error:", error);

          // Try with regular client
          const regularResult = await supabase
            .from("anxious_summaries")
            .select("*")
            .eq("user_id", studentId)
            .order("created_at", { ascending: false });

          if (regularResult.error) {
            throw regularResult.error;
          }

          data = regularResult.data;
        }

        // If still no data, try using ID field instead of user_id
        if (!data || data.length === 0) {
          const { data: fallbackData, error: fallbackError } =
            await supabaseAdmin
              .from("anxious_summaries")
              .select("*")
              .eq("id", studentId)
              .order("created_at", { ascending: false });

          if (fallbackError) throw fallbackError;
          data = fallbackData;
        }

        // Set the student entries
        setEntries(data || []);

        // Set the student name from the first entry
        if (data && data.length > 0) {
          setStudentName(data[0].user || studentId);

          // Calculate statistics
          const totalEntries = data.length;
          let severitySum = 0;
          let highSeverityCount = 0;

          data.forEach((entry) => {
            const severity = parseInt(entry.severity) || 0;
            severitySum += severity;
            if (severity >= 4) highSeverityCount++;
          });

          setStats({
            totalEntries,
            averageSeverity:
              totalEntries > 0
                ? parseFloat((severitySum / totalEntries).toFixed(1))
                : 0,
            highSeverityCount,
          });
        }

        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching student data:", error);
        setIsLoading(false);
      }
    };

    fetchStudentData();
  }, [studentId]);

  // Function to get severity class for styling
  const getSeverityClass = (severity: string) => {
    const severityNum = parseInt(severity) || 0;
    if (severityNum >= 5) return "severity-5";
    if (severityNum >= 4) return "severity-4";
    if (severityNum >= 3) return "severity-3";
    if (severityNum >= 2) return "severity-2";
    return "severity-1";
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  return (
    <div className="student-detail">
      <div className="header" style={{ position: "relative" }}>
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
                <span className="clarity">clairity</span> Dashboard
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
      </div>

      <div style={{ padding: "2rem" }}>
        <div style={{ alignItems: "center", marginBottom: "2rem" }}>
          <h1
            style={{ margin: 0, fontFamily: "Montserrat", fontWeight: "700" }}
          >
            {studentName}
          </h1>
          <Link
            to="/admin/students"
            style={{ marginRight: "1rem", color: "#277585" }}
          >
            <i className="fas fa-arrow-left"></i> Back to Students List
          </Link>
        </div>

        {isLoading ? (
          <p>Loading student data...</p>
        ) : (
          <>
            <div
              className="student-stats"
              style={{
                display: "flex",
                gap: "2rem",
                marginBottom: "2rem",
              }}
            >
              <div
                className="stat-card"
                style={{
                  padding: "1.5rem",
                  backgroundColor: "#f5f5f5",
                  borderRadius: "0.5rem",
                  flex: 1,
                  textAlign: "center",
                }}
              >
                <h3>Total Entries</h3>
                <p
                  style={{
                    fontSize: "2rem",
                    margin: "0.5rem 0",
                    color: "#277585",
                  }}
                >
                  {stats.totalEntries}
                </p>
              </div>

              <div
                className="stat-card"
                style={{
                  padding: "1.5rem",
                  backgroundColor: "#f5f5f5",
                  borderRadius: "0.5rem",
                  flex: 1,
                  textAlign: "center",
                }}
              >
                <h3>Average Severity</h3>
                <p
                  style={{
                    fontSize: "2rem",
                    margin: "0.5rem 0",
                    color: "#277585",
                  }}
                >
                  {stats.averageSeverity}
                </p>
              </div>

              <div
                className="stat-card"
                style={{
                  padding: "1.5rem",
                  backgroundColor: "#f5f5f5",
                  borderRadius: "0.5rem",
                  flex: 1,
                  textAlign: "center",
                }}
              >
                <h3>High Severity Entries</h3>
                <p
                  style={{
                    fontSize: "2rem",
                    margin: "0.5rem 0",
                    color: "#277585",
                  }}
                >
                  {stats.highSeverityCount}
                </p>
              </div>
            </div>

            <h2>Student Entries</h2>
            <div className="entries-list">
              {entries.length > 0 ? (
                entries.map((entry) => (
                  <div
                    key={entry.id}
                    className={`entry-card ${getSeverityClass(entry.severity)}`}
                    style={{
                      marginBottom: "1.5rem",
                      padding: "1.5rem",
                      backgroundColor: "#f9f9f9",
                      borderRadius: "0.5rem",
                      borderLeft: `5px solid ${
                        parseInt(entry.severity) >= 4
                          ? "#d2565b"
                          : parseInt(entry.severity) >= 3
                          ? "#ffc46f"
                          : "#a6d76e"
                      }`,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "1rem",
                      }}
                    >
                      <span>
                        <strong>Date:</strong> {formatDate(entry.created_at)}
                      </span>
                      <span>
                        <strong>Severity:</strong>
                        <span
                          className={getSeverityClass(entry.severity)}
                          style={{
                            marginLeft: "0.5rem",
                            padding: "0.25rem 0.5rem",
                            borderRadius: "0.25rem",
                            fontWeight: "bold",
                            color: "white",
                            backgroundColor:
                              parseInt(entry.severity) >= 4
                                ? "#d2565b"
                                : parseInt(entry.severity) >= 3
                                ? "#ffc46f"
                                : "#a6d76e",
                          }}
                        >
                          {entry.severity}
                        </span>
                      </span>
                    </div>

                    <div style={{ marginBottom: "1rem" }}>
                      <strong>Student Input:</strong>
                      <p
                        style={{
                          backgroundColor: "white",
                          padding: "1rem",
                          borderRadius: "0.5rem",
                          margin: "0.5rem 0",
                          fontSize: "1.25rem",
                        }}
                      >
                        {entry.user_input}
                      </p>
                    </div>

                    <div>
                      <strong>AI Response:</strong>
                      <p
                        style={{
                          backgroundColor: "white",
                          padding: "1rem",
                          borderRadius: "0.5rem",
                          fontSize: "1.25rem",
                          margin: "0.5rem 0",
                        }}
                      >
                        {entry.ai_output}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p>No entries found for this student.</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default StudentDetail;
