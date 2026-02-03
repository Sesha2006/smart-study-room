/**
 * ⏱ AUTO SYSTEM RUNNER
 * Cloud-function-like logic (but normal Node.js)
 */

const { Timestamp } = require("firebase-admin/firestore");

const BOOKING_APPROVAL_MINUTES = 5;
const STUDENT_CANCEL_MINUTES = 5;

let isRunning = false;

async function autoSystemRunner({ db, auth }) {
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
      const batch = db.batch();

      bookingSnap.forEach((doc) => {
        const data = doc.data();
        if (!data.createdAt) return;

        const diffMinutes =
          (now.toMillis() - data.createdAt.toMillis()) / 60000;

        if (diffMinutes >= BOOKING_APPROVAL_MINUTES) {
          batch.update(doc.ref, {
            status: "approved",
            approvedAt: now,
            autoApproved: true,
          });
        }
      });

      await batch.commit();
    }

    /* ---------- AUTO REMOVE UNAPPROVED USERS ---------- */
    const userSnap = await db
      .collection("users")
      .where("status", "!=", "approved")
      .get();

    for (const doc of userSnap.docs) {
      const user = doc.data();
      if (!user.uid || !user.createdAt) continue;

      const diffMinutes =
        (now.toMillis() - user.createdAt.toMillis()) / 60000;

      if (diffMinutes >= STUDENT_CANCEL_MINUTES) {
        await auth.deleteUser(user.uid);
        await db.collection("users").doc(doc.id).delete();

        console.log(`❌ User auto-removed → ${user.email}`);
      }
    }

  } catch (err) {
    console.error("🔥 Auto system error:", err.message);
  } finally {
    isRunning = false;
  }
}

module.exports = { autoSystemRunner };
