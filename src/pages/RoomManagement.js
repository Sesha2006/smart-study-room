import { useState } from "react";
import { useRooms } from "../context/RoomContext";
import "../App.css";

export default function RoomManagement() {
  const {
    rooms = [],
    addRoom,
    deleteRoom,
    updateRoom,
    toggleRoomStatus,
  } = useRooms() || {};

  const [roomName, setRoomName] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editingName, setEditingName] = useState("");

  /* ================= ADD ROOM ================= */
  const handleAddRoom = () => {
    const name = roomName.trim();
    if (!name) return; // 🔒 BLOCK EMPTY ROOMS

    addRoom(name); // 🔥 ONLY ONE CALL
    setRoomName("");
  };

  /* ================= SAVE EDIT ================= */
  const handleSaveEdit = (id) => {
    const name = editingName.trim();
    if (!name) return;

    updateRoom(id, name);
    setEditingId(null);
    setEditingName("");
  };

  return (
    <div className="page">
      <div className="hero admin-hero">
        <h1>Room Management</h1>
        <p>Add, edit, delete & manage rooms</p>
      </div>

      {/* ================= ADD ROOM ================= */}
      <div className="glass-card" style={{ marginBottom: "24px" }}>
        <h3>Add New Room</h3>

        <div className="btn-row">
          <input
            placeholder="Room name (e.g. Room A)"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
          />

          <button
            className="primary-btn"
            onClick={handleAddRoom}
          >
            Add Room
          </button>
        </div>
      </div>

      {/* ================= ROOM LIST ================= */}
      {rooms.length === 0 ? (
        <p className="muted" style={{ textAlign: "center" }}>
          No rooms added yet
        </p>
      ) : (
        <div className="card-grid">
          {rooms
            // 🔒 HARD GUARD AGAINST INVALID ROOMS
            .filter((room) => room.name && room.name.trim() !== "")
            .map((room) => (
              <div key={room.id} className="glass-card">
                {editingId === room.id ? (
                  <>
                    <input
                      value={editingName}
                      onChange={(e) =>
                        setEditingName(e.target.value)
                      }
                    />

                    <div className="btn-row">
                      <button
                        className="primary-btn"
                        onClick={() =>
                          handleSaveEdit(room.id)
                        }
                      >
                        Save
                      </button>

                      <button
                        className="danger-btn"
                        onClick={() => {
                          setEditingId(null);
                          setEditingName("");
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <h3>{room.name}</h3>

                    <p>
                      Status:{" "}
                      <strong>
                        {room.occupied
                          ? "Occupied"
                          : "Available"}
                      </strong>
                    </p>

                    <div className="btn-row">
                      <button
                        className="primary-btn"
                        onClick={() => {
                          setEditingId(room.id);
                          setEditingName(room.name);
                        }}
                      >
                        Edit
                      </button>

                      <button
                        className="primary-btn"
                        onClick={() =>
                          toggleRoomStatus(
                            room.id,
                            room.occupied
                          )
                        }
                      >
                        Toggle Status
                      </button>

                      <button
                        className="danger-btn"
                        onClick={() =>
                          deleteRoom(room.id)
                        }
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
