/* ===================== STYLES ===================== */
import "../App.css";

/* ===================== CONTEXT ===================== */
import { useRequests } from "../context/RequestContext";
import { useRooms } from "../context/RoomContext";

/* ===================== FIREBASE ===================== */
import { auth } from "../firebase";

/* ===================== UTILS ===================== */
/* 🧾 RECEIPT UTILS */
import {
  generateReceiptId,
  downloadReceiptPDF,
} from "../utils/receiptUtils";

/* ================================================== */
/*                    COMPONENT                      */
/* ================================================== */

export default function UsageHistory() {
  const { requests } = useRequests();
  const { rooms } = useRooms();

  /* ================= ROOM MAP ================= */
  const roomMap = rooms.reduce((acc, room) => {
    acc[room.id] = room.name;
    return acc;
  }, {});

  /* ================= TIME PARSER ================= */
  const toEndDateTime = (date, time) => {
    const endTime = time.split(" - ")[1];
    return new Date(`${date} ${endTime}`);
  };

  const now = new Date();
  const userEmail = auth.currentUser?.email;

  /* ================= ACTIVE BOOKINGS ================= */
  const activeBookings = requests.filter(
    (r) =>
      r.userEmail === userEmail &&
      r.status === "approved" &&
      toEndDateTime(r.date, r.time) > now
  );

  /* ================= PAST BOOKINGS ================= */
  const pastBookings = requests
    .filter(
      (r) => r.userEmail === userEmail && r.status === "approved"
    )
    .map((r) => ({
      ...r,
      endTime: toEndDateTime(r.date, r.time),
    }))
    .filter((r) => r.endTime <= now)
    .sort((a, b) => b.endTime - a.endTime);

  /* ===================== UI ===================== */
  return (
    <div className="page">
      <div className="hero student-hero">
        <h1>Usage History</h1>
        <p>Your bookings and receipts</p>
      </div>

      {/* ===== ACTIVE RECEIPTS ===== */}
      {activeBookings.length > 0 && (
        <>
          <h2>📄 Active Booking Receipts</h2>
          <div className="card-grid">
            {activeBookings.map((b) => (
              <div key={b.id} className="glass-card">
                <h3>Study Room Booking Receipt</h3>

                <p>
                  <strong>Receipt ID:</strong>{" "}
                  {generateReceiptId(b)}
                </p>

                <p>
                  <strong>Room:</strong>{" "}
                  {roomMap[b.roomId] || b.roomName || "Unknown Room"}
                </p>

                <p><strong>Date:</strong> {b.date}</p>
                <p><strong>Time:</strong> {b.time}</p>
                <p><strong>Participants:</strong> {b.members}</p>

                <p className="success-text">✔ Approved by Admin</p>

                <button
                  className="primary-btn"
                  onClick={() =>
                    downloadReceiptPDF(
                      b,
                      roomMap[b.roomId] || b.roomName
                    )
                  }
                >
                  Download PDF Receipt
                </button>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ===== EMPTY STATE ===== */}
      {pastBookings.length === 0 && activeBookings.length === 0 && (
        <p className="muted">No usage history available</p>
      )}

      {/* ===== COMPLETED BOOKINGS ===== */}
      {pastBookings.length > 0 && (
        <>
          <h2>📘 Completed Usage History</h2>
          <div className="card-grid">
            {pastBookings.map((b) => (
              <div key={b.id} className="glass-card">
                <h3>{roomMap[b.roomId] || "Unknown Room"}</h3>

                <p><strong>Date:</strong> {b.date}</p>
                <p><strong>Time:</strong> {b.time}</p>
                <p><strong>Participants:</strong> {b.members}</p>

                <p className="success-text">✔ Completed</p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
