// src/utils/timeUtils.js

export function getStartDateTime(date, timeSlot) {
  const [start] = timeSlot.split(" - ");
  const [hour, minute] = start.split(":").map(Number);

  const d = new Date(date);
  d.setHours(hour, minute, 0, 0);
  return d;
}

export function getEndDateTime(date, timeSlot) {
  const [, end] = timeSlot.split(" - ");
  const [hour, minute] = end.split(":").map(Number);

  const d = new Date(date);
  d.setHours(hour, minute, 0, 0);
  return d;
}
