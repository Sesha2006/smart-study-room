import { createContext, useContext, useEffect, useState } from "react";
import {
  collection,
  addDoc,
  onSnapshot,
  serverTimestamp,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../auth/AuthContext";

const RequestContext = createContext(null);

const MAX_CAPACITY = 6;

export function RequestProvider({ children }) {
  const { user } = useAuth();
  const [requests, setRequests] = useState([]);

  /* 🔄 REALTIME LISTENER */
  useEffect(() => {
    if (!user) return;

    const unsub = onSnapshot(
      collection(db, "bookingRequests"),
      (snap) => {
        setRequests(
          snap.docs.map((d) => ({
            id: d.id,
            ...d.data(), // includes date & bookingDate
          }))
        );
      }
    );

    return () => unsub();
  }, [user]);

  /* ✅ ADD REQUEST (BOOKING + PAYMENT SAFE) */
  const addRequest = async (data) => {
    if (!user) throw new Error("User not authenticated");

    const {
      roomId,
      roomName,
      date,
      time,
      members = 1,
    } = data;

    /* 🔒 CAPACITY CHECK */
    const q = query(
      collection(db, "bookingRequests"),
      where("roomId", "==", roomId),
      where("date", "==", date),
      where("time", "==", time),
      where("status", "in", ["pending", "approved"])
    );

    const snap = await getDocs(q);

    const usedSeats = snap.docs.reduce(
      (sum, d) => sum + (d.data().members || 1),
      0
    );

    if (usedSeats + members > MAX_CAPACITY) {
      throw new Error(
        `Only ${MAX_CAPACITY - usedSeats} seat(s) left for this slot`
      );
    }

    /* 💾 WRITE TO FIRESTORE */
    await addDoc(collection(db, "bookingRequests"), {
      // 🏠 booking info
      roomId,
      roomName,
      date,                 // original
      bookingDate: date,    // ✅ ADDED (fix for UI)
      time,
      members,

      // 💰 payment info
      amount: data.amount ?? 0,
      paymentProvider: data.paymentProvider ?? "razorpay",
      paymentStatus: data.paymentStatus ?? "unpaid",

      razorpayOrderId: data.razorpayOrderId ?? null,
      razorpayPaymentId: data.razorpayPaymentId ?? null,
      paidAt: data.paidAt ?? null,

      // 🔁 refund info
      refundStatus: data.refundStatus ?? "not_initiated",

      // 📌 booking state
      status: data.status ?? "pending",

      // 👤 user meta
      userEmail: user.email,
      createdAt: serverTimestamp(),
    });
  };

  return (
    <RequestContext.Provider value={{ requests, addRequest }}>
      {children}
    </RequestContext.Provider>
  );
}

export const useRequests = () => useContext(RequestContext);
