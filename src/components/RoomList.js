import { useEffect, useState } from "react";
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../firebase";

export default function RoomList() {
  const [rooms, setRooms] = useState([]);

  useEffect(() => {
    return onSnapshot(collection(db, "rooms"), (snap) => {
      setRooms(
        snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      );
    });
  }, []);

  const changeStatus = async (id, status) => {
    await updateDoc(doc(db, "rooms", id), { status });
  };

  const deleteRoom = async (id) => {
    if (window.confirm("Delete this room?")) {
      await deleteDoc(doc(db, "rooms", id));
    }
  };

  return (
    <div className="section">
      <h2>Manage Rooms</h2>

      <div className="card-grid">
        {rooms.map((room) => (
          <div key={room.id} className="glass-card">
            <h3>{room.name}</h3>
            <p>Capacity: {room.capacity}</p>
            <p>Status: {room.status}</p>

            <div className="btn-row">
              <button
                className="primary-btn"
                onClick={() => changeStatus(room.id, "available")}
              >
                Available
              </button>

              <button
                className="primary-btn"
                onClick={() => changeStatus(room.id, "maintenance")}
              >
                Maintenance
              </button>

              <button
                className="danger-btn"
                onClick={() => deleteRoom(room.id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
