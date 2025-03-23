import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "./lib/supabase";
import { useAuth } from "./hooks/useAuth";
import { getDisplayName } from "./lib/userUtils";
// Update the import to use the correct path
import { PieChart } from "@mui/x-charts";
import "./App.css";
import { useAdminCheck } from "./hooks/useAdminCheck";
import Forbidden from "./components/Forbidden";

function AdminDashboard() {
  // Update interface to use id instead of user_id
  interface UserSummary {
    id: string;
    count: number;
  }

  // Add interface for historical happiness data
  interface MonthlyHappiness {
    month: number;
    year: number;
    index_value: number;
  }

  const { user } = useAuth();
  const userName = getDisplayName(user);
  const { isAdmin, isLoading: isAdminCheckLoading } = useAdminCheck(user?.id);

  const [uniqueUsers, setUniqueUsers] = useState<UserSummary[]>([]);
  interface FlaggedCase {
    id: number;
    severity: string;
    user_input: string;
    user: string;
    student_name?: string; // Add optional student_name field
    user_id?: string; // Add optional user_id field
    // Other fields based on your database schema
  }

  const [flaggedCases, setFlaggedCases] = useState<FlaggedCase[]>([]);
  interface RecentActivity {
    id: number;
    user_input: string;
    ai_output: string;
    created_at: string;
    // Other fields based on your database schema
  }

  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [happinessIndex, setHappinessIndex] = useState<number>(0);
  const [isHappinessLoading, setIsHappinessLoading] = useState(true);
  const [severityCounts, setSeverityCounts] = useState({
    "1": 0,
    "2": 0,
    "3": 0,
    "4": 0,
    "5": 0,
  });
  // Add state for historical happiness data
  const [historicalHappiness, setHistoricalHappiness] = useState<
    MonthlyHappiness[]
  >([]);

  // Function to check if today is the last day of the month
  const isLastDayOfMonth = () => {
    const today = new Date();
    const lastDay = new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      0
    ).getDate();
    return today.getDate() === lastDay;
  };

  // Function to save happiness index at the end of the month
  const saveMonthlyHappinessIndex = async (index: number) => {
    try {
      const today = new Date();
      const month = today.getMonth() + 1; // JavaScript months are 0-based
      const year = today.getFullYear();

      // Check if we already have an entry for this month/year
      const { data: existingData } = await supabase
        .from("happiness_index")
        .select("*")
        .eq("month", month)
        .eq("year", year);

      if (existingData && existingData.length > 0) {
        // Update existing record
        await supabase
          .from("happiness_index")
          .update({ index_value: index })
          .eq("month", month)
          .eq("year", year);
        console.log(`Updated happiness index for ${month}/${year} to ${index}`);
      } else {
        // Insert new record
        await supabase
          .from("happiness_index")
          .insert([{ month, year, index_value: index }]);
        console.log(`Saved happiness index for ${month}/${year}: ${index}`);
      }
    } catch (error) {
      console.error("Error saving happiness index:", error);
    }
  };

  // Function to fetch historical happiness data
  const fetchHistoricalHappiness = async () => {
    try {
      const { data, error } = await supabase
        .from("happiness_index")
        .select("*")
        .order("year", { ascending: false })
        .order("month", { ascending: false })
        .limit(3);

      if (error) throw error;
      setHistoricalHappiness(data || []);
    } catch (error) {
      console.error("Error fetching historical happiness data:", error);
    }
  };

  // Format month name from month number
  const getMonthName = (monthNum: number) => {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    return months[monthNum - 1];
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Get unique entries from anxious_summaries using id instead of user_id
        const { data: uniqueUsersData, error: uniqueUsersError } =
          await supabase
            .from("anxious_summaries")
            .select("id")
            .order("id")
            .then((result) => {
              if (result.error) throw result.error;

              // Process data to get unique entry IDs
              const uniqueIds = Array.from(
                new Set(result.data.map((item) => item.id))
              );
              return {
                data: uniqueIds.map((id) => ({ id: id, count: 0 })),
                error: null,
              };
            });

        if (uniqueUsersError) throw uniqueUsersError;
        setUniqueUsers(uniqueUsersData);

        // Fetch flagged cases - updated to get severity 4 or higher and include user_id
        const { data: flaggedData, error: flaggedError } = await supabase
          .from("anxious_summaries")
          .select("id, user_id, user, severity, user_input") 
          .gte("severity", "4");
        if (flaggedError) throw flaggedError;
        setFlaggedCases(flaggedData);

        // Fetch recent activity
        const { data: activityData, error: activityError } = await supabase
          .from("anxious_summaries")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(5);
        if (activityError) throw activityError;
        setRecentActivity(activityData);

        // Fetch severity counts
        const { data: severityCountData, error: severityCountError } =
          await supabase
            .from("anxious_summaries")
            .select("severity")
            .then((result) => {
              if (result.error) throw result.error;

              // Initialize counts
              const counts = { "1": 0, "2": 0, "3": 0, "4": 0, "5": 0 };

              console.log("Severity raw data:", result.data);

              // Count entries by severity
              if (result.data && result.data.length > 0) {
                result.data.forEach((item) => {
                  // Convert severity to string to ensure consistent handling
                  const severityVal = String(item.severity);
                  console.log("Processing severity value:", severityVal);

                  if (severityVal >= "1" && severityVal <= "5") {
                    counts[severityVal as keyof typeof counts] =
                      (counts[severityVal as keyof typeof counts] || 0) + 1;
                  }
                });
              }

              console.log("Final severity counts:", counts);
              return { data: counts, error: null };
            });

        if (severityCountError) throw severityCountError;
        setSeverityCounts(severityCountData);

        // Calculate happiness index with improved algorithm
        const { data: severityData, error: severityError } = await supabase
          .from("anxious_summaries")
          .select("severity, created_at")
          .order("created_at", { ascending: false });

        if (severityError) throw severityError;

        if (severityData && severityData.length > 0) {
          console.log("Severity data:", severityData);

          // Get current date for time-based weighting
          const currentDate = new Date();
          let totalWeightedScore = 0;
          let totalWeight = 0;

          // Calculate weighted happiness score
          severityData.forEach((record) => {
            const severity = parseInt(record.severity, 10);
            if (!isNaN(severity)) {
              // Convert severity to happiness score (1-5 → 100-0)
              // Severity 1 = 100% happiness, Severity 5 = 0% happiness
              const happinessScore = 100 - (severity - 1) * 25;

              // Calculate time difference in days
              const recordDate = new Date(record.created_at);
              const daysDifference = Math.max(
                1,
                Math.round(
                  (currentDate.getTime() - recordDate.getTime()) /
                    (1000 * 60 * 60 * 24)
                )
              );

              // Time-based weight: recent entries have more weight
              // Weight formula: 1/(days^0.5) - decreases with square root of days
              const weight = 1 / Math.sqrt(daysDifference);

              totalWeightedScore += happinessScore * weight;
              totalWeight += weight;
            }
          });

          // Calculate final happiness index
          const happinessIndex =
            totalWeight > 0
              ? Math.round(totalWeightedScore / totalWeight) / 10
              : 10; // Default to 100 if no weights

          // Ensure index stays within 0-100 range
          const boundedIndex = Math.max(0, Math.min(100, happinessIndex));
          setHappinessIndex(boundedIndex);

          console.log("Calculated happiness index:", boundedIndex);

          // Check if today is the last day of the month and save the index
          if (isLastDayOfMonth()) {
            saveMonthlyHappinessIndex(boundedIndex);
          }
        } else {
          setHappinessIndex(100); // Default to 100% if no severity data
        }

        // Fetch historical happiness data
        await fetchHistoricalHappiness();

        setIsHappinessLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setHappinessIndex(100); // Default to 100% in case of error
        setIsHappinessLoading(false);
      }
    };

    fetchData();

    // Optional: For testing, you can force the saveMonthlyHappinessIndex function
    // to run regardless of the date
    // saveMonthlyHappinessIndex(happinessIndex);
  }, []);

  // Helper function to get happiness class based on the index value
  const getHappinessClass = () => {
    if (happinessIndex >= 80) return "happiness-high";
    if (happinessIndex >= 60) return "happiness-good";
    if (happinessIndex >= 40) return "happiness-moderate";
    if (happinessIndex >= 20) return "happiness-low";
    return "happiness-critical";
  };

  // Add a function to transform the severity data for the pie chart
  const preparePieChartData = () => {
    return [
      {
        id: 0,
        value: severityCounts["5"],
        label: "Severity 5",
        color: "#d2565b",
      },
      {
        id: 1,
        value: severityCounts["4"],
        label: "Severity 4",
        color: "#E98D65",
      },
      {
        id: 2,
        value: severityCounts["3"],
        label: "Severity 3",
        color: "#ffc46f",
      },
      {
        id: 3,
        value: severityCounts["2"],
        label: "Severity 2",
        color: "#D3CE6F",
      },
      {
        id: 4,
        value: severityCounts["1"],
        label: "Severity 1",
        color: "#a6d76e",
      },
    ];
  };

  // If admin check is loading, show loading state
  if (isAdminCheckLoading) {
    return (
      <div style={{ textAlign: "center", padding: "3rem" }}>
        <p>Checking permissions...</p>
      </div>
    );
  }

  // If user is not admin, show forbidden page
  if (!isAdmin) {
    return <Forbidden />;
  }

  return (
    <div className="admin-dashboard">
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

      <h1
        style={{
          fontFamily: "Montserrat",
          fontWeight: "700",
          borderBottom: "#277585 2px solid",
          paddingBottom: "2rem",
          width: "50%",
          left: 0,
          right: 0,
          margin: "2rem auto",
        }}
      >
        Insights Dashboard
      </h1>

      {isHappinessLoading ? (
        <p>Calculating Data...</p>
      ) : (
        <div style={{ height: 0 }}></div>
      )}
      <div
        className={`dashboard-section ${getHappinessClass()}`}
        style={{ border: "none" }}
      >
        <h2 style={{ fontSize: "3rem" }}>
          Happiness Index:{" "}
          <span
            style={{
              padding: "0.5rem 1.5rem",
              color: "white",
              background: "#277585",
              borderRadius: "1rem",
            }}
          >
            {happinessIndex}
          </span>
        </h2>

        <div
          style={{
            display: "flex",
            gap: "5rem",
            justifyContent: "center",
            fontFamily: "montserrat alternates",
          }}
        >
          {historicalHappiness.length > 0 ? (
            [...historicalHappiness].reverse().map((item, index) => (
              <p key={index}>
                <b style={{ fontSize: "2.5rem" }}>
                  {item.index_value.toFixed(1)}{" "}
                </b>{" "}
                <br /> {getMonthName(item.month)}
              </p>
            ))
          ) : (
            <>
              <p>
                - <br /> 3 Months Ago
              </p>
              <p>
                - <br /> 2 Months Ago
              </p>
              <p>
                - <br /> Previous Month
              </p>
            </>
          )}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          width: "80%",
          margin: "0 auto",
          gap: "2rem",
        }}
      >
        <div className="dashboard-section" style={{ padding: "1rem 3rem" }}>
          <h2>Severity Chart</h2>
          {/* pie chart of all the severities */}
          <div
            style={{
              display: "flex",
              gap: "1rem",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <PieChart
              series={[
                {
                  data: preparePieChartData(),
                  highlightScope: { faded: "global", highlighted: "item" },
                  outerRadius: 100,
                  paddingAngle: 1,
                },
              ]}
              width={300}
              height={250}
              slotProps={{
                legend: {
                  hidden: true,
                },
              }}
            />

            <ul>
              <li
                style={{
                  display: "flex",
                  gap: "1rem",
                  fontFamily: "montserrat alternates",
                  fontWeight: 700,
                  color: "#277585",
                }}
              >
                <div
                  style={{
                    background: "#d2565b",
                    padding: "1rem",
                    fontFamily: "montserrat alternates",
                    fontWeight: 700,
                    color: "#277585",
                  }}
                ></div>{" "}
                {severityCounts["5"]}
              </li>
              <li
                style={{
                  display: "flex",
                  gap: "1rem",
                  fontFamily: "montserrat alternates",
                  fontWeight: 700,
                  color: "#277585",
                }}
              >
                <div style={{ background: "#E98D65", padding: "1rem" }}></div>{" "}
                {severityCounts["4"]}
              </li>
              <li
                style={{
                  display: "flex",
                  gap: "1rem",
                  fontFamily: "montserrat alternates",
                  fontWeight: 700,
                  color: "#277585",
                }}
              >
                <div style={{ background: "#ffc46f", padding: "1rem" }}></div>{" "}
                {severityCounts["3"]}
              </li>
              <li
                style={{
                  display: "flex",
                  gap: "1rem",
                  fontFamily: "montserrat alternates",
                  fontWeight: 700,
                  color: "#277585",
                }}
              >
                <div style={{ background: "#D3CE6F", padding: "1rem" }}></div>{" "}
                {severityCounts["2"]}
              </li>
              <li
                style={{
                  display: "flex",
                  gap: "1rem",
                  fontFamily: "montserrat alternates",
                  fontWeight: 700,
                  color: "#277585",
                }}
              >
                <div style={{ background: "#a6d76e", padding: "1rem" }}></div>{" "}
                {severityCounts["1"]}
              </li>
            </ul>
          </div>
        </div>
        <div className="dashboard-section" style={{ width: "100%" }}>
          <h2>High Severity Cases</h2>
          {flaggedCases.length > 0 ? (
            <ul>
              {flaggedCases.slice(-4).map((caseItem) => (
              <li
                key={caseItem.id}
                className={`severity-${caseItem.severity}`}
                style={{ textAlign: "left" }}
              >
                <strong>Severity:</strong> {caseItem.severity} {" "} |{" "}
                <strong>Student:</strong>{" "}
                <Link to={`/admin/students/${caseItem.user_id || caseItem.id}`} style={{color: "#277585"}}>
                  {caseItem.user || "Anonymous"}
                </Link> <br />
                {caseItem.user_input}<br />
              </li>
              ))}
            </ul>
          ) : (
            <p>No high severity cases.</p>
          )}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          width: "80%",
          margin: "0 auto",
          gap: "2rem",
        }}
      >
        <div className="dashboard-section">
          <h2>Student Summary</h2>
          <p>Total Entries: {uniqueUsers.length}</p>
          <p>Recent Activity: {recentActivity.length}</p>
          <Link to="/admin/students" className="btn" style={{
            display: "inline-block",
            background: "#277585",
            color: "white",
            padding: "0.5rem 1rem",
            borderRadius: "0.5rem",
            textDecoration: "none",
            marginTop: "1rem"
          }}>
            Manage Students
          </Link>
        </div>

        <div className="dashboard-section">
          <h2>Recent Activity</h2>
          {recentActivity.length > 0 ? (
            <ul>
              {recentActivity.map((activity) => (
                <li key={activity.id}>
                  <strong>Entry ID:</strong> {activity.id} |{" "}
                  <strong>Input:</strong> {activity.user_input} |{" "}
                  <strong>Response:</strong> {activity.ai_output}
                </li>
              ))}
            </ul>
          ) : (
            <p>No recent activity.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
