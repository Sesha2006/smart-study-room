import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "../App.css";
import { useRequests } from "../context/RequestContext";
import { useRooms } from "../context/RoomContext";
import { auth } from "../firebase";
import { onAuthStateChanged } from "firebase/auth";

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { requests = [] } = useRequests() || {};
  const { rooms = [] } = useRooms() || {};

  const [currentEmail, setCurrentEmail] = useState(null);
  const [now, setNow] = useState(new Date());

  /* ================= AUTH ================= */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) {
        navigate("/login");
      } else {
        setCurrentEmail(user.email);
      }
    });
    return () => unsub();
  }, [navigate]);

  /* ================= CLOCK ================= */
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  /* ================= USER REQUESTS ================= */
  const myRequests = Array.isArray(requests)
    ? requests.filter((r) => r?.userEmail === currentEmail)
    : [];

  /* ================= ROOM MAP ================= */
  const roomMap = Array.isArray(rooms)
    ? rooms.reduce((acc, r) => {
        if (r?.id) acc[r.id] = r.name || "Unknown Room";
        return acc;
      }, {})
    : {};

  /* ================= STATS ================= */
  const availableRooms = Array.isArray(rooms)
    ? rooms.filter((r) => r?.occupied === false).length
    : 0;

  /* ================= TIME HELPERS ================= */
  const getStartTime = (date, time) => {
    if (!date || !time) return null;
    const start = time.split(" - ")[0];
    return new Date(`${date}T${start}`);
  };

  const getEndTime = (date, time) => {
    if (!date || !time) return null;
    const end = time.split(" - ")[1];
    return new Date(`${date}T${end}`);
  };

  /* ================= BOOKINGS ================= */
  const approvedBookings = myRequests.filter(
    (r) => r?.status === "approved"
  );

  // ✅ FIXED ACTIVE BOOKING LOGIC
  const activeBookings = approvedBookings.filter((b) => {
    const start = getStartTime(b?.date, b?.time);
    const end = getEndTime(b?.date, b?.time);
    return start && end && now >= start && now < end;
  });

  const futureBookings = approvedBookings
    .map((b) => {
      const startTime = getStartTime(b?.date, b?.time);
      return startTime ? { ...b, startTime } : null;
    })
    .filter(Boolean)
    .filter((b) => b.startTime > now)
    .sort((a, b) => a.startTime - b.startTime);

  const earliestSlot = futureBookings.length
    ? futureBookings[0].startTime.getTime()
    : null;

  const nextBookings = futureBookings.filter(
    (b) => b.startTime.getTime() === earliestSlot
  );

  const pendingCount = myRequests.filter(
    (r) => r?.status === "pending"
  ).length;

  /* ================= UI ================= */
  return (
    <div className="page">
      <div className="hero student-hero">
        <h1>Student Dashboard</h1>
        <p>Manage your study room bookings efficiently</p>
      </div>

      <div className="card-grid stats-grid">
        <div className="glass-card stat-card success">
          <h4>Available Rooms</h4>
          <span className="stat">{availableRooms}</span>
        </div>

        <div className="glass-card stat-card">
          <h4>Active Booking</h4>
          <span className="stat">{activeBookings.length}</span>
        </div>

        <div className="glass-card stat-card warning">
          <h4>Pending Requests</h4>
          <span className="stat">{pendingCount}</span>
        </div>
      </div>

      <div className="dashboard-layout">
        <div className="section">
          <h2>Student Actions</h2>

          <div className="action-grid">
            <div className="action-card" onClick={() => navigate("/rooms")}>
              <h3>View Rooms</h3>
              <p>Browse available & occupied rooms</p>
            </div>

            <div
              className="action-card accent"
              onClick={() => navigate("/request-room")}
            >
              <h3>Request Room</h3>
              <p>Send a booking request to admin</p>
            </div>

            <div
              className="action-card warning"
              onClick={() => navigate("/pending-requests")}
            >
              <h3>Pending Requests</h3>
              <p>View & cancel pending bookings</p>
            </div>

            <div
              className="action-card"
              onClick={() => navigate("/my-bookings")}
            >
              <h3>My Bookings</h3>
              <p>Approved & rejected bookings</p>
            </div>

            <div
              className="action-card"
              onClick={() => navigate("/usage-history")}
            >
              <h3>Usage History</h3>
              <p>View past room usage</p>
            </div>
          </div>
        </div>

        <div className="section highlight-panel">
          <h2>Quick Info</h2>

          <div className="glass-card">
            <h4>Next Booking(s)</h4>

            {nextBookings.length > 0 ? (
              nextBookings.map((b, index) => (
                <div key={b.id || index}>
                  <strong>{roomMap[b.roomId] || "Unknown Room"}</strong>
                  <div>📅 {b.date}</div>
                  <div>⏰ {b.time}</div>
                  <div>👥 Participants: {b.members ?? 1}</div>
                </div>
              ))
            ) : (
              <p>No upcoming bookings</p>
            )}
          </div>

          <div className="glass-card">
            <h4>Status</h4>
            <p className="success-text">All systems operational</p>
          </div>
        </div>
      </div>
    </div>
  );
}
