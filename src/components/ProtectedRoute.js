import { Navigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function ProtectedRoute({ children, requiredRole }) {
  const { user, role, status, loading } = useAuth();

  // ✅ DO NOT return null
  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: "40vh" }}>
        Checking authentication...
      </div>
    );
  }

  // 🔒 Not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 🚫 Student not approved
  if (role === "student" && status !== "approved") {
    return <Navigate to="/pending-approval" replace />;
  }

  // 🚫 Role mismatch
  if (requiredRole && role !== requiredRole) {
    return <Navigate to="/login" replace />;
  }

  return children;
}