// ⚛️ React
import { useState, useMemo, useEffect } from "react";
import "../App.css";

// 🌐 Contexts
import { useRequests } from "../context/RequestContext";
import { useRooms } from "../context/RoomContext";

// 🧮 Helpers
import { getRemainingCapacity } from "../utils/capacityUtils";

// 🔥 Firebase
import { serverTimestamp } from "firebase/firestore";

/* ================= PRICES ================= */
const PRICES = {
  short: 20,
  normal: 40,
  long: 60,
};

const MAX_CAPACITY = 6;

/* ================= SLOT GENERATOR ================= */
const pad = (n) => n.toString().padStart(2, "0");

const generateSlots = (startHour, endHour, durationMinutes) => {
  const slots = [];
  let current = startHour * 60;
  const end = endHour * 60;

  while (current + durationMinutes <= end) {
    const sh = Math.floor(current / 60);
    const sm = current % 60;
    const eh = Math.floor((current + durationMinutes) / 60);
    const em = (current + durationMinutes) % 60;

    slots.push(`${pad(sh)}:${pad(sm)} - ${pad(eh)}:${pad(em)}`);
    current += durationMinutes;
  }
  return slots;
};

/* ⏰ TIME SLOTS */
const TIME_SLOTS = {
  short: generateSlots(8, 20, 30),
  normal: generateSlots(8, 20, 60),
  long: generateSlots(8, 20, 90),
};

export default function RequestRoom() {
  const { requests = [], addRequest } = useRequests();
  const { rooms = [] } = useRooms();

  /* ================= STATE ================= */
  const [date, setDate] = useState("");
  const [slotType, setSlotType] = useState("");
  const [time, setTime] = useState("");
  const [roomId, setRoomId] = useState("");
  const [roomName, setRoomName] = useState("");
  const [members, setMembers] = useState(1);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const amount = PRICES[slotType] || 0;

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

  /* ================= RESET ROOM ON DATE/TIME CHANGE ================= */
  useEffect(() => {
    setRoomId("");
    setRoomName("");
  }, [date, time]);

  /* ================= VALID TIME ================= */
  const validTimeSlots = useMemo(() => {
    if (!date || !slotType) return [];

    const today = new Date();
    const selectedDate = new Date(date);
    today.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);

    const slots = TIME_SLOTS[slotType] || [];

    if (selectedDate > today) return slots;

    if (selectedDate.getTime() === today.getTime()) {
      const now = new Date();
      return slots.filter((slot) => {
        const start = slot.split(" - ")[0];
        return new Date(`${date}T${start}`) > now;
      });
    }

    return [];
  }, [date, slotType]);

  /* ================= AVAILABLE ROOMS ================= */
  const availableRooms = useMemo(() => {
    if (!date || !time) return [];
    return rooms.filter(
      (room) =>
        !room.occupied &&
        getRemainingCapacity(room, requests, date, time) >= members
    );
  }, [rooms, requests, date, time, members]);

  /* ================= SAVE BOOKING ================= */
  const saveBooking = async (paymentMeta) => {
    await addRequest({
      roomId,
      roomName,
      date,
      time,
      slotType,
      members,
      amount,

      paymentProvider: "razorpay",
      paymentStatus: paymentMeta.status,
      razorpayOrderId: paymentMeta.orderId,
      razorpayPaymentId: paymentMeta.paymentId,
      paidAt: serverTimestamp(),

      refundStatus: "not_initiated",
      status: "pending",
      createdAt: serverTimestamp(),
    });

    setSuccess("✅ Booking submitted successfully");

    setDate("");
    setSlotType("");
    setTime("");
    setRoomId("");
    setRoomName("");
    setMembers(1);
  };

  /* ================= PAYMENT ================= */
  const startPayment = async () => {
    setError("");
    setSuccess("");

    if (!roomId || !date || !time || !slotType) {
      setError("All fields are required");
      return;
    }

    if (!BACKEND_URL) {
      setError("Backend URL missing (.env)");
      return;
    }

    const razorpayKey = process.env.REACT_APP_RAZORPAY_KEY_ID;

    if (!razorpayKey || typeof window.Razorpay === "undefined") {
      setError("Razorpay not loaded");
      return;
    }

    try {
      const res = await fetch(
        `${BACKEND_URL}/razorpay/create-order`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount }),
        }
      );

      if (!res.ok) throw new Error("Order creation failed");

      const order = await res.json();

      const options = {
        key: razorpayKey,
        amount: order.amount,
        currency: "INR",
        name: "Smart Study Room",
        description: "Room Booking",
        order_id: order.id,

        handler: async function (response) {
          await saveBooking({
            status: "paid",
            orderId: order.id,
            paymentId: response.razorpay_payment_id,
          });
        },

        theme: { color: "#0f172a" },
      };

      new window.Razorpay(options).open();
    } catch (err) {
      console.error(err);
      setError("Payment failed. Try again.");
    }
  };

  /* ================= UI ================= */
  return (
    <div className="page">
      <div className="hero student-hero">
        <h1>Request Room</h1>
        <p>Secure booking with Razorpay</p>
      </div>

      <div className="glass-card form-card">
        {error && <p className="error-text">{error}</p>}
        {success && <p className="success-text">{success}</p>}

        <label>Date</label>
        <input
          type="date"
          value={date}
          min={new Date().toISOString().split("T")[0]}
          onChange={(e) => setDate(e.target.value)}
        />

        <label>Slot Type</label>
        <select value={slotType} onChange={(e) => setSlotType(e.target.value)}>
          <option value="">Select Slot Type</option>
          <option value="short">Short (30 mins)</option>
          <option value="normal">Normal (1 hour)</option>
          <option value="long">Long (1.5 hours)</option>
        </select>

        <label>Time Slot</label>
        <select value={time} onChange={(e) => setTime(e.target.value)}>
          <option value="">Select Time</option>
          {validTimeSlots.map((slot) => (
            <option key={slot} value={slot}>
              {slot}
            </option>
          ))}
        </select>

        <label>Members</label>
        <input
          type="number"
          min="1"
          max={MAX_CAPACITY}
          value={members}
          onChange={(e) => setMembers(Number(e.target.value))}
        />

        <label>Room</label>
        <select
          value={roomId}
          onChange={(e) => {
            const r = availableRooms.find((x) => x.id === e.target.value);
            setRoomId(e.target.value);
            setRoomName(r?.name || "");
          }}
        >
          <option value="">Select Room</option>
          {availableRooms.map((room) => {
            const remaining = getRemainingCapacity(room, requests, date, time);
            return (
              <option key={room.id} value={room.id}>
                {room.name} — {remaining} seats left
              </option>
            );
          })}
        </select>

        <p>💰 Amount: ₹{amount}</p>

        <button className="primary-btn" onClick={startPayment}>
          Pay & Book
        </button>
      </div>
    </div>
  );
}
