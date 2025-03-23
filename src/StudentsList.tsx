import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase, supabaseAdmin } from "./lib/supabase";
import { useAuth } from "./hooks/useAuth";
import { getDisplayName } from "./lib/userUtils";
import "./App.css";

interface Student {
  id: string;
  email?: string;
  user_name?: string;
  created_at?: string;
  last_sign_in?: string;
  entry_count: number;
  last_activity?: string;
  average_severity: number;
}

function StudentsList() {
  const { user } = useAuth();
  const userName = getDisplayName(user);
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  // Add search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Student[]>([]);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setIsLoading(true);
        
        // Use supabaseAdmin to bypass RLS for admin operations
        fetchStudentsWithAdminClient();
      } catch (error) {
        console.error("Error fetching students:", error);
        setIsLoading(false);
      }
    };

    // Use supabaseAdmin client to avoid RLS issues
    const fetchStudentsWithAdminClient = async () => {
      try {
        // Get all unique student IDs from anxious_summaries using admin client
        const { data: studentEntries, error: entriesError } = await supabaseAdmin
          .from("anxious_summaries")
          .select("id, user, user_id, created_at, severity")
          .order("created_at", { ascending: false });
          
        if (entriesError) {
          console.error("Admin client error:", entriesError);
          // Fall back to regular client with potential RLS restrictions
          fetchStudentsFromSummaries();
          return;
        }
        
        // Process the data to create a list of unique students with their metrics
        const studentMap = new Map<string, Student>();
        
        studentEntries?.forEach(entry => {
          // Prefer user_id (UUID) if available, otherwise fallback to id
          const userId = entry.user_id || entry.id;
          const severity = parseInt(entry.severity) || 0;
          
          if (studentMap.has(userId)) {
            const student = studentMap.get(userId)!;
            student.entry_count += 1;
            // Track total severity for calculating average instead of highest
            student.average_severity = (student.average_severity * (student.entry_count - 1) + severity) / student.entry_count;
            // Only update last_activity if the current entry is more recent
            if (!student.last_activity || entry.created_at > student.last_activity) {
              student.last_activity = entry.created_at;
            }
          } else {
            studentMap.set(userId, {
              id: userId,
              user_name: entry.user,
              entry_count: 1,
              last_activity: entry.created_at,
              average_severity: severity
            });
          }
        });
        
        setStudents(Array.from(studentMap.values()));
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching students with admin client:", error);
        // Fall back to regular method
        fetchStudentsFromSummaries();
      }
    };

    // Fallback method: get students only from anxious_summaries with regular client
    const fetchStudentsFromSummaries = async () => {
      try {
        // Try with regular client but only get own entries (due to RLS)
        const { data: studentEntries, error: entriesError } = await supabase
          .from("anxious_summaries")
          .select("id, user, user_id, created_at, severity")
          .order("created_at", { ascending: false });
          
        if (entriesError) {
          console.error("Regular client error:", entriesError);
          setIsLoading(false);
          return;
        }
        
        // Process the data to create a list of unique students with their metrics
        const studentMap = new Map<string, Student>();
        
        studentEntries?.forEach(entry => {
          // Prefer user_id (UUID) if available, otherwise fallback to id
          const userId = entry.user_id || entry.id;
          const severity = parseInt(entry.severity) || 0;
          
          if (studentMap.has(userId)) {
            const student = studentMap.get(userId)!;
            student.entry_count += 1;
            // Track total severity for calculating average instead of highest
            student.average_severity = (student.average_severity * (student.entry_count - 1) + severity) / student.entry_count;
            // Only update last_activity if the current entry is more recent
            if (!student.last_activity || entry.created_at > student.last_activity) {
              student.last_activity = entry.created_at;
            }
          } else {
            studentMap.set(userId, {
              id: userId,
              user_name: entry.user,
              entry_count: 1,
              last_activity: entry.created_at,
              average_severity: severity
            });
          }
        });
        
        setStudents(Array.from(studentMap.values()));
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching students:", error);
        setIsLoading(false);
      }
    };

    fetchStudents();
  }, []);

  // Add useEffect to handle search filtering
  useEffect(() => {
    if (!students.length) return;
    
    // Filter students based on search query
    const results = students.filter(student => {
      const query = searchQuery.toLowerCase();
      const nameMatch = student.user_name?.toLowerCase().includes(query);
      const emailMatch = student.email?.toLowerCase().includes(query);
      // Fix TypeError by ensuring student.id is converted to a string
      const idMatch = String(student.id).toLowerCase().includes(query);
      
      return nameMatch || emailMatch || idMatch;
    });
    
    setSearchResults(results);
  }, [searchQuery, students]);

  // Function to get severity class for styling
  const getSeverityClass = (severity: number) => {
    if (severity >= 5) return "severity-5";
    if (severity >= 4) return "severity-4";
    if (severity >= 3) return "severity-3";
    if (severity >= 2) return "severity-2";
    return "severity-1";
  };

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  return (
    <div className="students-list">
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
        <div style={{justifyContent: "center", marginBottom: "2rem" }}>
          <h1 style={{ margin: 0, fontFamily: "Montserrat", fontWeight: "700", textAlign: "center" }}>Students Management</h1>
          <Link to="/admin" style={{ marginRight: "1rem", color: "#277585" }}>
            <i className="fas fa-arrow-left"></i> Back to Dashboard
          </Link>
        </div>

        {/* Add search bar */}
        <div style={{ 
          marginBottom: "2rem", 
          display: "flex",
          justifyContent: "center"
        }}>
          <div style={{
            position: "relative",
            width: "100%",
            maxWidth: "500px"
          }}>
            <input
              type="text"
              placeholder="Search students by name, email or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                padding: "0.75rem 1rem 0.75rem 2.5rem",
                borderRadius: "0.5rem",
                border: "1px solid #ddd",
                fontSize: "1rem",
                boxShadow: "0 2px 4px rgba(0,0,0,0.05)"
              }}
            />
            <i 
              className="fas fa-search" 
              style={{
                position: "absolute",
                left: "0.75rem",
                top: "50%",
                transform: "translateY(-50%)",
                color: "#277585"
              }}
            ></i>
            {searchQuery && (
              <i 
                className="fas fa-times" 
                style={{
                  position: "absolute",
                  right: "0.75rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "#666",
                  cursor: "pointer"
                }}
                onClick={() => setSearchQuery("")}
              ></i>
            )}
          </div>
        </div>

        {isLoading ? (
          <p>Loading students data...</p>
        ) : (
          <div className="students-grid" style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", 
            gap: "1.5rem" 
          }}>
            {/* Use searchResults instead of students */}
            {searchResults.length > 0 ? (
              searchResults.map((student) => (
                <Link 
                  to={`/admin/students/${student.id}`} 
                  key={student.id}
                  style={{ textDecoration: "none" }}
                >
                  <div className="student-card" style={{ 
                    padding: "1.5rem", 
                    backgroundColor: "#f5f5f5", 
                    borderRadius: "0.5rem",
                    border: "1px solid #ddd",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                    transition: "transform 0.2s, box-shadow 0.2s",
                    cursor: "pointer",fontSize:"0.75rem",
                    color: "#333"
                  }}>
                    <h3 style={{ margin: "0 0 1rem 0",fontSize:"1.5rem", color: "#277585" }}>
                      {student.user_name || student.email || student.id}
                    </h3>
                    {student.email && <p>Email: {student.email}</p>}
                    <p>Entries: {student.entry_count}</p>
                    <p>Last Activity: {formatDate(student.last_activity || student.last_sign_in)}</p>
                    <p>
                      Average Severity: 
                      <span className={getSeverityClass(Math.round(student.average_severity))} style={{ 
                        marginLeft: "0.5rem",
                        padding: "0.25rem 0.5rem",
                        borderRadius: "0.25rem",
                        fontWeight: "bold",
                        color: "white",
                        fontSize:"0.75rem",
                        backgroundColor: student.average_severity >= 4 ? "#d2565b" : 
                                        student.average_severity >= 3 ? "#ffc46f" : 
                                        student.average_severity > 0 ? "#a6d76e" : "#999"
                      }}>
                        {student.average_severity.toFixed(1) || "N/A"}
                      </span>
                    </p>
                    {student.created_at && (
                      <p className="account-created" style={{ fontSize: "0.85rem", color: "#666", marginTop: "0.5rem" }}>
                        Account created: {formatDate(student.created_at)}
                      </p>
                    )}
                  </div>
                </Link>
              ))
            ) : (
              searchQuery ? (
                <p style={{ gridColumn: "1 / -1", textAlign: "center", padding: "2rem" }}>
                  No students found matching "{searchQuery}". Try a different search term.
                </p>
              ) : (
                <p>No students found.</p>
              )
            )}
          </div>
        )}
        
        {/* Show total count of students/results */}
        {!isLoading && (
          <div style={{ textAlign: "center", marginTop: "1.5rem", color: "#666" }}>
            {searchQuery ? (
              <p>Found {searchResults.length} of {students.length} students</p>
            ) : (
              <p>Total: {students.length} students</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default StudentsList;
