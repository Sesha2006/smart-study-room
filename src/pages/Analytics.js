import "../App.css";
import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { useRooms } from "../context/RoomContext";

export default function Analytics() {
  const { rooms } = useRooms();
  const [bookings, setBookings] = useState([]);

  /* 🔥 REALTIME BOOKINGS */
  useEffect(() => {
    return onSnapshot(collection(db, "bookingRequests"), (snap) => {
      setBookings(snap.docs.map(d => d.data()));
    });
  }, []);

  const totalRooms = rooms.length;
  const occupiedRooms = rooms.filter(r => r.occupied).length;
  const availableRooms = totalRooms - occupiedRooms;

  const occupancyRate =
    totalRooms === 0 ? 0 : Math.round((occupiedRooms / totalRooms) * 100);

  const systemEfficiency = 100 - occupancyRate;

  /* 🔥 SIMPLE PEAK USAGE LOGIC */
  const timeCount = {};
  bookings.forEach(b => {
    if (b.time) timeCount[b.time] = (timeCount[b.time] || 0) + 1;
  });

  const peakTime =
    Object.keys(timeCount).length === 0
      ? "No data"
      : Object.entries(timeCount).sort((a, b) => b[1] - a[1])[0][0];

  return (
    <div className="page">
      <div className="hero admin-hero">
        <h1>Analytics</h1>
        <p>Usage trends & room insights</p>
      </div>

      <div className="card-grid">
        <div className="glass-card">
          <h3>Occupancy Rate</h3>
          <p className="stat">{occupancyRate}%</p>
          <p>{occupiedRooms} of {totalRooms} rooms occupied</p>
        </div>

        <div className="glass-card">
          <h3>Peak Usage</h3>
          <p className="stat">{peakTime}</p>
          <p>Highest booking activity</p>
        </div>

        <div className="glass-card">
          <h3>Available Rooms</h3>
          <p className="stat">{availableRooms}</p>
          <p>Ready for booking</p>
        </div>

        <div className="glass-card">
          <h3>System Efficiency</h3>
          <p className="stat">{systemEfficiency}%</p>
          <p>Free capacity</p>
        </div>
      </div>
    </div>
  );
}