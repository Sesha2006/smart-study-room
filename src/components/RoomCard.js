function RoomCard({ room, onAllocate }) {
  return (
    <div className={`room-card ${room.status}`}>
      <h2>{room.name}</h2>

      <span className="status">{room.status}</span>

      {room.status === "available" ? (
        <button onClick={onAllocate}>Allocate</button>
      ) : (
        <button disabled>Occupied</button>
      )}
    </div>
  );
}

export default RoomCard;
