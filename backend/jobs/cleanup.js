/**
 * 🧹 FULL CLEANUP + VALIDATION SCRIPT (LOCAL)
 * ------------------------------------------
 *
 * USERS:
 * - Delete if:
 *   1. status === "rejected"
 *   2. status === "pending" AND older than 24 hours
 *   3. invalid email
 * - Delete from:
 *   - Firebase Auth
 *   - Firestore users collection
 * - NEVER delete esp32@room.com
 *
 * BOOKINGS:
 * - Delete rejected bookingRequests older than 1 day
 */

const { initializeApp, cert } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const { getFirestore, Timestamp } = require("firebase-admin/firestore");

/* 🔑 SERVICE ACCOUNT */
const serviceAccount = require("./serviceAccountKey.json");

/* 🔥 INIT FIREBASE */
initializeApp({
  credential: cert(serviceAccount),
});

const auth = getAuth();
const db = getFirestore();

/* ⏱ CONFIG */
const PENDING_LIMIT_HOURS = 24;
const BOOKING_EXPIRY_DAYS = 1;

/* ✅ EMAIL VALIDATION */
const isValidEmail = (email) => {
  if (!email) return false;
  const emailRegex =
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

async function cleanupAndValidate() {
  console.log("🧹 Cleanup & validation started...");

  const usersSnap = await db.collection("users").get();
  const bookingsSnap = await db.collection("bookingRequests").get();

  const now = Timestamp.now();

  let deletedAuthUsers = 0;
  let deletedFirestoreUsers = 0;
  let deletedBookings = 0;

  /* ================= USERS ================= */
  for (const doc of usersSnap.docs) {
    const user = doc.data();
    const uid = doc.id;

    if (!user) continue;

    /* 🛑 HARD PROTECT ESP32 ACCOUNT */
    if (user.email === "esp32@room.com") {
      console.log("🛑 Skipped protected account → esp32@room.com");
      continue;
    }

    if (!user.status || !user.createdAt?.toMillis) continue;

    const ageHours =
      (now.toMillis() - user.createdAt.toMillis()) /
      (1000 * 60 * 60);

    const shouldDelete =
      user.status === "rejected" ||
      (user.status === "pending" && ageHours > PENDING_LIMIT_HOURS) ||
      !isValidEmail(user.email);

    if (!shouldDelete) continue;

    try {
      /* 🔐 DELETE AUTH USER */
      try {
        if (user.email) {
          const authUser = await auth.getUserByEmail(user.email);
          await auth.deleteUser(authUser.uid);
          deletedAuthUsers++;
          console.log(`🔐 Auth deleted → ${user.email}`);
        } else {
          await auth.deleteUser(uid);
          deletedAuthUsers++;
          console.log(`🔐 Auth deleted → UID ${uid}`);
        }
      } catch (e) {
        console.log(
          `⚠️ Auth user not found → ${user.email || uid}`
        );
      }

      /* 🧾 DELETE FIRESTORE USER */
      await doc.ref.delete();
      deletedFirestoreUsers++;
      console.log(
        `❌ Firestore user deleted → ${user.email || uid}`
      );
    } catch (err) {
      console.error(
        `⚠️ Failed to delete user ${user.email || uid}:`,
        err.message
      );
    }
  }

  /* ================= BOOKINGS ================= */
  for (const doc of bookingsSnap.docs) {
    const booking = doc.data();

    if (
      booking.status !== "rejected" ||
      !booking.createdAt?.toMillis
    )
      continue;

    const ageDays =
      (now.toMillis() - booking.createdAt.toMillis()) /
      (1000 * 60 * 60 * 24);

    if (ageDays >= BOOKING_EXPIRY_DAYS) {
      await doc.ref.delete();
      deletedBookings++;
      console.log(
        `🗑️ Rejected booking deleted → ${doc.id}`
      );
    }
  }

  /* ================= SUMMARY ================= */
  console.log("✅ Cleanup completed");
  console.log(`🔐 Auth users deleted: ${deletedAuthUsers}`);
  console.log(`👤 Firestore users deleted: ${deletedFirestoreUsers}`);
  console.log(`📅 Rejected bookings deleted: ${deletedBookings}`);
}

/* 🚀 RUN SCRIPT */
cleanupAndValidate().catch((err) => {
  console.error("🔥 Script failed:", err);
});
