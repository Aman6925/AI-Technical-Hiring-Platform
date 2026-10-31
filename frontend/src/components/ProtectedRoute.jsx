
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function ProtectedRoute({ children, allowedRoles }) {
  const { user, isAuthenticated } = useAuth();

  // User login nahi hai
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  // User ka role allowed nahi hai
  if (!allowedRoles.includes(user.role)) {
    if (user.role === "recruiter") {
      return <Navigate to="/recruiter/dashboard" replace />;
    }

    return <Navigate to="/candidate/dashboard" replace />;
  }

  return children;
}

export default ProtectedRoute;
