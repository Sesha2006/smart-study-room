import { useLocation, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";
import "../styles/navbar.css";

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, role } = useAuth();

  /* ===============================
     AUTH PAGES (LOGIN / SIGNUP)
  ================================ */
  const isAuthPage =
    location.pathname === "/login" ||
    location.pathname === "/signup";

  if (isAuthPage) {
    return (
      <div className="navbar auth-only">
        <h2>Smart Study Rooms</h2>
        <div className="navbar-links">
          <Link to="/login">Login</Link>
          <Link to="/signup">Signup</Link>
        </div>
      </div>
    );
  }

  /* ===============================
     LOGOUT
  ================================ */
  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login", { replace: true });
  };

  /* ===============================
     DASHBOARD NAVBAR
  ================================ */
  return (
    <div className="navbar">
      <h2>Smart Study Rooms</h2>

      <div className="navbar-links">
        {/* ================= ADMIN ================= */}
        {role === "admin" && (
          <>
            <Link to="/admin">Dashboard</Link>
            <Link to="/rooms">Rooms</Link>
            <Link to="/room-management">Management</Link>
            <Link to="/allocation">Allocation</Link>
            <Link to="/monitor">Monitor</Link>
            <Link to="/analytics">Analytics</Link>
            <Link to="/profile">Profile</Link>
          </>
        )}

        {/* ================= STUDENT ================= */}
        {role === "student" && (
          <>
            <Link to="/student">Dashboard</Link>
            <Link to="/rooms">Rooms</Link>
            <Link to="/profile">Profile</Link>
          </>
        )}

        {/* ================= LOGOUT ================= */}
        {user && (
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        )}
      </div>
    </div>
  );
}
