import "../App.css";
import { useRooms } from "../context/RoomContext";
import { useState } from "react";

export default function Allocation() {
  const { rooms, allocateRoom } = useRooms();
  const [message, setMessage] = useState("");

  const handleAllocate = (room) => {
    if (room.occupied) {
      setMessage(`❌ ${room.name} is already occupied`);
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    allocateRoom(room.id);
    setMessage(`✅ ${room.name} allocated successfully`);
    setTimeout(() => setMessage(""), 3000);
  };

  return (
    <div className="page">
      <div className="hero admin-hero">
        <h1>Room Allocation</h1>
        <p>Allocate available rooms manually</p>
      </div>

      {message && <p className="info-text">{message}</p>}

      <div className="card-grid">
        {rooms.map((room) => (
          <div
            key={room.id}
            className={`glass-card ${
              room.occupied ? "danger" : "success"
            }`}
          >
            <h2>{room.name}</h2>
            <p>
              Status:{" "}
              <strong>
                {room.occupied ? "Occupied" : "Available"}
              </strong>
            </p>

            <button
              className="primary-btn"
              disabled={room.occupied}
              onClick={() => handleAllocate(room)}
            >
              {room.occupied ? "Unavailable" : "Allocate"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
