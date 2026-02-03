/* ===================== STYLES ===================== */
import "../App.css";

/* ===================== CONTEXT ===================== */
import { useRequests } from "../context/RequestContext";
import { useRooms } from "../context/RoomContext";

/* ===================== FIREBASE ===================== */
import { auth } from "../firebase";

/* ================================================== */
/*                    COMPONENT                      */
/* ================================================== */

export default function MyBookings() {
  const { requests } = useRequests();
  const { rooms } = useRooms();

  const currentEmail = auth.currentUser?.email || null;

  /* ================= ROOM MAP ================= */
  const roomMap = rooms.reduce((acc, r) => {
    acc[r.id] = r.name;
    return acc;
  }, {});

  /* ================= TIME PARSER ================= */
  const getStartTime = (date, time) => {
    const start = time.split(" - ")[0];
    return new Date(`${date}T${start}`);
  };

  /* ================= ONLY APPROVED BOOKINGS ================= */
  const myBookings = requests
    .filter(
      (r) =>
        r.userEmail === currentEmail &&
        r.status === "approved"
    )
    .map((r) => ({
      ...r,
      startTime: getStartTime(r.date, r.time),
    }))
    .sort((a, b) => b.startTime - a.startTime)
    .slice(0, 20);

  /* ===================== UI ===================== */
  return (
    <div className="page">
      <div className="hero student-hero">
        <h1>My Bookings</h1>
        <p>Approved booking history</p>
      </div>

      {myBookings.length === 0 && (
        <p className="muted">No approved bookings found</p>
      )}

      <div className="card-grid">
        {myBookings.map((b) => (
          <div
            key={b.id}
            className="glass-card success"
          >
            <h3>{roomMap[b.roomId] || "Unknown Room"}</h3>

            <p><strong>Date:</strong> {b.date}</p>
            <p><strong>Time:</strong> {b.time}</p>
            <p><strong>Participants:</strong> {b.members}</p>

            <p>
              Status:{" "}
              <strong className="status-approved">
                APPROVED
              </strong>
            </p>

            <p className="success-text">✅ Approved</p>
          </div>
        ))}
      </div>
    </div>
  );
}
