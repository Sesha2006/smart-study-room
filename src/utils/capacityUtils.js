export const getRemainingCapacity = (
  room,
  requests,
  date,
  time
) => {
  const capacity = room.capacity ?? 6; // 🔥 fallback

  const used = requests
    .filter(
      (r) =>
        r.roomId === room.id &&
        r.date === date &&
        r.time === time &&
        (r.status === "approved" || r.status === "pending")
    )
    .reduce((sum, r) => sum + (r.members || 1), 0);

  return capacity - used;
};
