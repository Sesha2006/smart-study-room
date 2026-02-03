/**
 * 🧹 AUTH CLEANUP ONLY
 * - Deletes Auth users who are NOT approved
 * - Firestore users are NOT deleted
 */

const { initializeApp, cert } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const { getFirestore } = require("firebase-admin/firestore");

const serviceAccount = require("./serviceAccountKey.json");

initializeApp({
  credential: cert(serviceAccount),
});

const auth = getAuth();
const db = getFirestore();

async function cleanupAuthOnly() {
  console.log("🧹 Auth cleanup started...");

  const usersSnap = await db.collection("users").get();
  let deleted = 0;

  for (const doc of usersSnap.docs) {
    const user = doc.data();

    if (user.status === "approved") continue; // ✅ SAFE
    if (!user.uid) continue;

    try {
      await auth.deleteUser(user.uid);
      deleted++;
      console.log(`❌ Auth deleted → ${user.email}`);
    } catch (err) {
      console.log(`⚠️ Failed → ${user.email}: ${err.message}`);
    }
  }

  console.log(`✅ Auth cleanup completed. Deleted: ${deleted}`);
}

cleanupAuthOnly().catch(console.error);
