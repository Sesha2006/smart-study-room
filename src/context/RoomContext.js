// 📦 React
import { createContext, useContext, useEffect, useState } from "react";

// 🔥 Firebase
import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  onSnapshot,
  serverTimestamp,
  getDoc,
} from "firebase/firestore";

import { db } from "../firebase";

// 🌐 Context
const RoomContext = createContext();

// 🧠 Provider
export function RoomProvider({ children }) {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  /* =====================================================
     🔥 REAL-TIME LISTENER
     ✅ Reads rooms where document ID = room name
  ===================================================== */
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "rooms"), (snapshot) => {
      const roomData = snapshot.docs
        .map((d) => ({
          id: d.id,      // 🔥 document name (Room A)
          ...d.data(),   // contains name, occupied
        }))
        // 🔒 strict validation
        .filter(
          (room) =>
            typeof room.name === "string" &&
            room.name.trim().length >= 3 &&
            room.id === room.name &&
            typeof room.occupied === "boolean"
        );

      setRooms(roomData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  /* =====================================================
     ➕ ADD ROOM
     ✅ Document name = Room name
  ===================================================== */
  const addRoom = async (name, capacity = 6) => {
    if (!name) return;

    const trimmed = name.trim();
    if (trimmed.length < 3) {
      throw new Error("Room name must be at least 3 characters");
    }

    // ✅ normalize name (Room A, Room B, etc.)
    const roomName =
      trimmed.charAt(0).toUpperCase() + trimmed.slice(1);

    const roomRef = doc(db, "rooms", roomName);

    // ❌ prevent duplicates
    const exists = await getDoc(roomRef);
    if (exists.exists()) return;

    await setDoc(roomRef, {
      name: roomName,
      capacity,
      occupied: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  };

  /* =====================================================
     ✏️ UPDATE ROOM NAME
     ⚠️ Rename = create new doc + delete old doc
  ===================================================== */
  const updateRoom = async (oldName, newName) => {
    if (!oldName || !newName) return;

    const trimmed = newName.trim();
    if (trimmed.length < 3) return;

    const normalized =
      trimmed.charAt(0).toUpperCase() + trimmed.slice(1);

    const oldRef = doc(db, "rooms", oldName);
    const newRef = doc(db, "rooms", normalized);

    const snap = await getDoc(oldRef);
    if (!snap.exists()) return;

    const exists = await getDoc(newRef);
    if (exists.exists()) return;

    await setDoc(newRef, {
      ...snap.data(),
      name: normalized,
      updatedAt: serverTimestamp(),
    });

    await deleteDoc(oldRef);
  };

  /* =====================================================
     🗑️ DELETE ROOM
  ===================================================== */
  const deleteRoom = async (name) => {
    if (!name) return;
    await deleteDoc(doc(db, "rooms", name));
  };

  /* =====================================================
     🔁 STATUS UPDATES (NO CREATION)
  ===================================================== */
  const toggleRoomStatus = async (name) => {
    const room = rooms.find((r) => r.id === name);
    if (!room) return;

    await updateDoc(doc(db, "rooms", name), {
      occupied: !room.occupied,
      updatedAt: serverTimestamp(),
    });
  };

  const allocateRoom = async (name) => {
    if (!name) return;
    await updateDoc(doc(db, "rooms", name), {
      occupied: true,
      updatedAt: serverTimestamp(),
    });
  };

  const freeRoom = async (name) => {
    if (!name) return;
    await updateDoc(doc(db, "rooms", name), {
      occupied: false,
      updatedAt: serverTimestamp(),
    });
  };

  return (
    <RoomContext.Provider
      value={{
        rooms,
        loading,
        addRoom,
        updateRoom,
        deleteRoom,
        toggleRoomStatus,
        allocateRoom,
        freeRoom,
      }}
    >
      {children}
    </RoomContext.Provider>
  );
}

// 🎣 Hook
export const useRooms = () => useContext(RoomContext);
