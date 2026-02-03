import "../App.css";
import { useEffect, useState } from "react";
import {
  collection,
  updateDoc,
  doc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  getDocs,
} from "firebase/firestore";
import { db } from "../firebase";

import PendingStudents from "../components/PendingStudents";

/*
  AUTO_MINUTES = 15
  Frontend fallback logic only.
  Real auto-approve / auto-refund → Cloud Functions later
*/
const AUTO_MINUTES = 15;

export default function AdminDashboard() {
  /* ================= ROOMS ================= */
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "rooms"), (snap) => {
      setRooms(
        snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }))
      );
    });
    return () => unsub();
  }, []);

  const roomMap = rooms.reduce((acc, r) => {
    acc[r.id] = r.name;
    return acc;
  }, {});

  const totalRooms = rooms.length;
  const availableRooms = rooms.filter((r) => !r.occupied).length;
  const occupiedRooms = rooms.filter((r) => r.occupied).length;

  /* ================= PENDING BOOKINGS ================= */
  const [pendingRequests, setPendingRequests] = useState([]);

  useEffect(() => {
    const q = query(
      collection(db, "bookingRequests"),
      where("status", "==", "pending")
    );

    return onSnapshot(q, (snap) => {
      setPendingRequests(
        snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }))
      );
    });
  }, []);

  /* ================= AUTO APPROVE (DEMO ONLY) ================= */
  useEffect(() => {
    if (pendingRequests.length === 0) return;

    const now = Date.now();

    pendingRequests.forEach(async (req) => {
      if (!req.createdAt) return;

      const diffMinutes =
        (now - req.createdAt.toMillis()) / 60000;

      if (diffMinutes >= AUTO_MINUTES) {
        await updateDoc(doc(db, "bookingRequests", req.id), {
          status: "approved",
          approvedAt: serverTimestamp(),
          autoApproved: true,
        });
      }
    });
  }, [pendingRequests]);

  /* ================= APPROVE REQUEST ================= */
  const approveRequest = async (request) => {
    const slotQuery = query(
      collection(db, "bookingRequests"),
      where("roomId", "==", request.roomId),
      where("date", "==", request.date),
      where("time", "==", request.time)
    );

    const snap = await getDocs(slotQuery);

    const occupiedMembers = snap.docs
      .filter(
        (d) =>
          d.id !== request.id &&
          ["pending", "approved"].includes(d.data().status)
      )
      .reduce((sum, d) => sum + (d.data().members || 1), 0);

    const requestedMembers = request.members || 1;

    if (occupiedMembers + requestedMembers > 6) {
      alert(
        `❌ Cannot approve. Only ${
          6 - occupiedMembers
        } seat(s) available`
      );
      return;
    }

    await updateDoc(doc(db, "bookingRequests", request.id), {
      status: "approved",
      approvedAt: serverTimestamp(),
      autoApproved: false,
    });
  };

  /* ================= REJECT + INITIATE REFUND ================= */
  const rejectRequest = async (request) => {
    if (!window.confirm("Reject booking and initiate refund?")) return;

    await updateDoc(doc(db, "bookingRequests", request.id), {
      status: "rejected",
      rejectedAt: serverTimestamp(),

      // 💰 REFUND FLOW
      refundStatus: "initiated",
      refundMode: "manual", // Razorpay auto later
      refundReason: "admin_rejected",
    });
  };

  /* ================= UI ================= */
  return (
    <div className="page">
      {/* HERO */}
      <div className="hero admin-hero">
        <h1>Admin Dashboard</h1>
        <p>Manage rooms, bookings & refunds</p>
      </div>

      {/* STATS */}
      <div className="card-grid">
        <div className="glass-card">
          <h3>Total Rooms</h3>
          <p className="stat">{totalRooms}</p>
        </div>

        <div className="glass-card success">
          <h3>Available Rooms</h3>
          <p className="stat">{availableRooms}</p>
        </div>

        <div className="glass-card danger">
          <h3>Occupied Rooms</h3>
          <p className="stat">{occupiedRooms}</p>
        </div>

        <div className="glass-card warning">
          <h3>Pending Requests</h3>
          <p className="stat">{pendingRequests.length}</p>
        </div>
      </div>

      {/* BOOKINGS */}
      <div className="section">
        <h2>Approve Booking Requests</h2>

        {pendingRequests.length === 0 && (
          <p className="muted">No pending requests</p>
        )}

        <div className="card-grid">
          {pendingRequests.map((r) => (
            <div key={r.id} className="glass-card">
              <h3>
                Room: {r.roomName || roomMap[r.roomId]}
              </h3>
              <p>Date: {r.date}</p>
              <p>Time: {r.time}</p>
              <p>User: {r.userEmail}</p>
              <p>💰 Payment: {r.paymentStatus}</p>

              <div className="btn-row">
                <button
                  className="primary-btn"
                  onClick={() => approveRequest(r)}
                >
                  Approve
                </button>

                <button
                  className="danger-btn"
                  onClick={() => rejectRequest(r)}
                >
                  Reject & Refund
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* STUDENTS */}
      <PendingStudents />
    </div>
  );
}
