import { useEffect, useState } from "react";
import "../styles/monitor.css";
import "../App.css";
import { useRooms } from "../context/RoomContext";

/* ✅ RAILWAY TIME FORMATTER (24-hour) */
function formatRailwayTime(date) {
  return date.toLocaleString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

export default function Monitor() {
  const { rooms } = useRooms();

  /* ✅ REALTIME CURRENT TIME */
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="monitor-container">
      <div className="monitor-header">
        <h1>Live Study Room Monitor</h1>
        <p>Real-time occupancy & availability status</p>
      </div>

      {rooms.length === 0 ? (
        <p className="muted" style={{ textAlign: "center" }}>
          No rooms available
        </p>
      ) : (
        <div className="monitor-grid">
          {rooms.map((room) => (
            <div
              key={room.id}
              className={`monitor-card ${
                room.occupied ? "active" : "inactive"
              }`}
            >
              <h3>{room.name}</h3>

              <span
                className={`status-badge ${
                  room.occupied
                    ? "status-active"
                    : "status-inactive"
                }`}
              >
                {room.occupied ? "Occupied" : "Available"}
              </span>

              <p>
                <strong>Status:</strong>{" "}
                {room.occupied ? "IN USE" : "FREE"}
              </p>

              {/* ✅ RAILWAY TIME DISPLAY */}
              <p>
                <strong>Last Updated:</strong>{" "}
                {formatRailwayTime(now)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
