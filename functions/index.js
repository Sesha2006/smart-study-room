/**
 * 🚀 NORMAL NODE INDEX.JS
 * Replacement for Firebase Cloud Functions
 * Runs with `npm start`
 */

const express = require("express");
const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore, Timestamp } = require("firebase-admin/firestore");
const { getDatabase } = require("firebase-admin/database");
const { getAuth } = require("firebase-admin/auth");

const serviceAccount = require("./serviceAccountKey.json"); // gitignored

/* ================= FIREBASE ADMIN INIT ================= */
initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();
const rtdb = getDatabase();
const auth = getAuth();

/* ================= TIME LIMITS ================= */
const BOOKING_APPROVAL_MINUTES = 5;
const STUDENT_CANCEL_MINUTES = 5;

/* ================= LOCK ================= */
let isRunning = false;

/* ======================================================
   ⏱ AUTO MANAGE BOOKINGS + STUDENTS
   (replaces onSchedule)
====================================================== */
async function autoManageSystem() {
  if (isRunning) return;
  isRunning = true;

  const now = Timestamp.now();

  try {
    /* ---------- AUTO APPROVE BOOKINGS ---------- */
    const bookingSnap = await db
      .collection("bookingRequests")
      .where("status", "==", "pending")
      .get();

    if (!bookingSnap.empty) {
      const bookingBatch = db.batch();

      bookingSnap.forEach((doc) => {
        const data = doc.data();
        if (!data.createdAt) return;

        const diffMinutes =
          (now.toMillis() - data.createdAt.toMillis()) / 60000;

        if (diffMinutes >= BOOKING_APPROVAL_MINUTES) {
          bookingBatch.update(doc.ref, {
            status: "approved",
            approvedAt: now,
            autoApproved: true,
          });
        }
      });

      await bookingBatch.commit();
    }

    /* ---------- AUTO CANCEL STUDENTS ---------- */
    const studentSnap = await db
      .collection("users")
      .where("role", "==", "student")
      .where("status", "==", "pending")
      .get();

    if (!studentSnap.empty) {
      const studentBatch = db.batch();

      studentSnap.forEach((doc) => {
        const data = doc.data();
        if (!data.createdAt) return;

        const diffMinutes =
          (now.toMillis() - data.createdAt.toMillis()) / 60000;

        if (diffMinutes >= STUDENT_CANCEL_MINUTES) {
          studentBatch.update(doc.ref, {
            status: "rejected",
            rejectedAt: now,
            autoCancelled: true,
          });
        }
      });

      await studentBatch.commit();
    }
  } catch (err) {
    console.error("🔥 autoManageSystem error:", err.message);
  } finally {
    isRunning = false;
  }
}

/* ======================================================
   🔁 RTDB → FIRESTORE
   (replaces onValueWritten)
====================================================== */
function startRtdbToFirestoreSync() {
  rtdb.ref("rooms").on("value", async (snapshot) => {
    const rooms = snapshot.val();
    if (!rooms) return;

    for (const roomId of Object.keys(rooms)) {
      const data = rooms[roomId];
      if (!data || data._source === "firestore") continue;

      await db.collection("rooms").doc(roomId).set(
        {
          ...data,
          _source: "rtdb",
          syncedAt: Timestamp.now(),
        },
        { merge: true }
      );
    }
  });
}

/* ======================================================
   🔁 FIRESTORE → RTDB
   (replaces onDocumentWritten)
====================================================== */
function startFirestoreToRtdbSync() {
  db.collection("rooms").onSnapshot((snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === "removed") return;

      const data = change.doc.data();
      if (data._source === "rtdb") return;

      rtdb.ref(`rooms/${change.doc.id}`).update({
        ...data,
        _source: "firestore",
        syncedAt: Date.now(),
      });
    });
  });
}

/* ================= EXPRESS SERVER ================= */
const app = express();
const PORT = 5000;

app.get("/", (req, res) => {
  res.send("✅ Normal Node backend running");
});

/* ================= START SYSTEM ================= */
console.log("⏱ Auto manager started (Normal Node)");
setInterval(autoManageSystem, 60 * 1000); // every 1 minute

startRtdbToFirestoreSync();
startFirestoreToRtdbSync();

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
