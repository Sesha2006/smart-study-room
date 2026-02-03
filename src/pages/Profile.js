import "../styles/profile.css";
import { useAuth } from "../auth/AuthContext";
import { useRequests } from "../context/RequestContext";
import { useRooms } from "../context/RoomContext";
import { signOut } from "firebase/auth";
import { auth } from "../firebase";

export default function Profile() {
  const { user, role } = useAuth();
  const { requests } = useRequests();
  const { rooms } = useRooms();

  if (!user) return null;

  /* ================= REALTIME CALCULATIONS ================= */

  // Rooms viewed → total rooms available in system
  const roomsViewed = rooms.length;

  // Allocations → approved bookings (admin or student specific)
  const allocations =
    role === "admin"
      ? requests.filter((r) => r.status === "approved").length
      : requests.filter(
          (r) =>
            r.status === "approved" &&
            r.userEmail === user.email
        ).length;

  return (
    <div className="profile-page">
      <div className="profile-header">
        <h1>User Profile</h1>
        <p>Account information & activity</p>
      </div>

      <div className="profile-cards">
        {/* ACCOUNT */}
        <div className="profile-card">
          <h3>Account</h3>
          <p>Email: {user.email}</p>
          <p>
            Role: <strong>{role}</strong>
          </p>
        </div>

        {/* USAGE (REALTIME) */}
        <div className="profile-card">
          <h3>Usage</h3>
          <p>Rooms Viewed: {roomsViewed}</p>
          <p>Allocations: {allocations}</p>
        </div>

        {/* SETTINGS */}
        <div className="profile-card">
          <h3>Settings</h3>
          <button
            onClick={() => {
              if (window.confirm("Are you sure you want to logout?")) {
                signOut(auth);
              }
            }}
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
