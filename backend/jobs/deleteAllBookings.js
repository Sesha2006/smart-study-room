/**
 * 🧹 DELETE ALL BOOKINGS SCRIPT (ADMIN)
 * ------------------------------------
 *
 * BOOKINGS:
 * - Deletes ALL documents from:
 *   - bookingRequests collection
 *
 * ⚠️ WARNING:
 * - This is irreversible
 * - Use ONLY in local / admin environment
 */

const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

/* 🔑 SERVICE ACCOUNT */
const serviceAccount = require("../serviceAccountKey.json");

/* 🔥 INIT FIREBASE ADMIN */
initializeApp({
  credential: cert(serviceAccount),
});

const db = getFirestore();

/* ================= MAIN FUNCTION ================= */
async function deleteAllBookings() {
  console.log("🧹 Deleting ALL bookings...");

  const bookingsSnap = await db
    .collection("bookingRequests")
    .get();

  if (bookingsSnap.empty) {
    console.log("ℹ️ No bookings found");
    return;
  }

  let deletedCount = 0;

  for (const doc of bookingsSnap.docs) {
    await doc.ref.delete();
    deletedCount++;
    console.log(`🗑️ Deleted booking → ${doc.id}`);
  }

  console.log("✅ ALL BOOKINGS DELETED");
  console.log(`📅 Total deleted: ${deletedCount}`);
}

/* 🚀 RUN SCRIPT */
deleteAllBookings().catch((err) => {
  console.error("🔥 Script failed:", err.message);
});
