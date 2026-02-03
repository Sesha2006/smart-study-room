/**
 * ⏰ Scheduler (Cloud-Function-like)
 */

function startScheduler(task, intervalMs) {
  console.log("⏰ Scheduler started");

  // run immediately (like cold start)
  task();

  setInterval(task, intervalMs);
}

module.exports = { startScheduler };
