import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const PrivateRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div
        className="loading"
        style={{
          fontSize: "3rem",
          fontFamily: "'Montserrat Alternates', sans-serif",
          fontWeight: 700,
          color: "#277585",
          textAlign: "center",
        }}
      >
        Loading...
      </div>
    );
  }

  return user ? <Outlet /> : <Navigate to="/login" />;
};

export default PrivateRoute;
