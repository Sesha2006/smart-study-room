import "../App.css";
import { useRooms } from "../context/RoomContext";

export default function Rooms() {
  const { rooms } = useRooms();

  return (
    <div className="page">
      <div className="hero">
        <h1>Rooms</h1>
        <p>Current room availability</p>
      </div>

      {rooms.length === 0 ? (
        <p className="muted" style={{ textAlign: "center" }}>
          No rooms available
        </p>
      ) : (
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
