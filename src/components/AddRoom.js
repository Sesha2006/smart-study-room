import { useState } from "react";
import { useRooms } from "../context/RoomContext";
import "../App.css";

export default function AddRoom() {
  const { addRoom } = useRooms();

  const [name, setName] = useState("");
  const [capacity, setCapacity] = useState(1);
  const [loading, setLoading] = useState(false);

  const handleAddRoom = async (e) => {
    e.preventDefault();

    const trimmedName = name.trim();
    if (!trimmedName) return;

    try {
      setLoading(true);
      await addRoom(trimmedName, Number(capacity)); // ✅ ONLY THIS
      setName("");
      setCapacity(1);
    } catch (err) {
      console.error("Failed to add room:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card">
      <h3>Add New Room</h3>

      <form onSubmit={handleAddRoom}>
        <input
          type="text"
          placeholder="Room Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <input
          type="number"
          min="1"
          placeholder="Capacity"
          value={capacity}
          onChange={(e) => setCapacity(e.target.value)}
        />

        <button className="primary-btn" disabled={loading}>
          {loading ? "Adding..." : "Add Room"}
        </button>
      </form>
    </div>
  );
}
