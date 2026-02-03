import "../App.css";
import { useRequests } from "../context/RequestContext";
import { useRooms } from "../context/RoomContext";
import { auth } from "../firebase";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

export default function PendingRequests() {
  const { requests = [] } = useRequests() || {};
  const { rooms = [] } = useRooms() || {};

  const email = auth.currentUser?.email;

  /* 🔄 MAP ROOM ID → ROOM NAME */
  const roomMap = rooms.reduce((acc, r) => {
    acc[r.id] = r.name;
    return acc;
  }, {});

  /* ⏳ USER PENDING BOOKINGS */
  const pendingRequests = requests.filter(
    (r) => r.userEmail === email && r.status === "pending"
  );

  /* 💰 DEMO PAYMENT (FOR TEST MODE / COLLEGE REVIEW) */
  const markAsPaid = async (booking) => {
    await updateDoc(doc(db, "bookingRequests", booking.id), {
      paymentStatus: "paid",
      paymentProvider: "demo",
      razorpayOrderId: null,
      razorpayPaymentId: null,
      paidAt: serverTimestamp(),
    });
  };

  /* ❌ CANCEL + REFUND */
  const cancelRequest = async (booking) => {
    if (
      !window.confirm(
        "Cancel this booking?\n\nRefund will be initiated (demo/manual)."
      )
    )
      return;

    await updateDoc(doc(db, "bookingRequests", booking.id), {
      status: "cancelled",
      cancelledBy: "user",
      cancelledAt: serverTimestamp(),

      refundStatus: "initiated",
      refundMode: booking.paymentProvider === "razorpay" ? "razorpay" : "manual",
      refundReason: "user_cancelled",
    });
  };

  return (
    <div className="page">
      <div className="hero student-hero">
        <h1>Pending Requests</h1>
        <p>Requests awaiting admin approval</p>
      </div>

      {pendingRequests.length === 0 && (
        <p className="muted">No pending requests</p>
      )}

      <div className="card-grid">
        {pendingRequests.map((b) => (
          <div key={b.id} className="glass-card warning">
            <h3>{roomMap[b.roomId] || "Unknown Room"}</h3>

            <p>📅 Date: {b.date}</p>
            <p>⏰ Time: {b.time}</p>
            <p>👥 Participants: {b.members || 1}</p>

            <p className="info-text">
              💰 Payment:{" "}
              <strong>
                {b.paymentStatus === "paid"
                  ? `Paid (${b.paymentProvider})`
                  : "Unpaid"}
              </strong>
            </p>

            <p className="info-text">
              🔄 Refund Status: {b.refundStatus || "Not initiated"}
            </p>

            {/* ✅ DEMO PAYMENT BUTTON */}
            {b.paymentStatus !== "paid" && (
              <button
                className="primary-btn"
                onClick={() => markAsPaid(b)}
              >
                Mark as Paid (Demo)
              </button>
            )}

            <button
              className="danger-btn"
              onClick={() => cancelRequest(b)}
            >
              Cancel & Initiate Refund
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
