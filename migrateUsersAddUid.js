/**
 * 🔄 ADD UID TO ALL USERS
 * (approved + rejected + pending)
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

async function migrateUsersAddUid() {
  console.log("🔄 UID migration started...");

  const usersSnap = await db.collection("users").get();
  let updated = 0;

  for (const doc of usersSnap.docs) {
    const user = doc.data();

    if (user.uid || !user.email) continue;

    try {
      const authUser = await auth.getUserByEmail(user.email);

      await db.collection("users").doc(doc.id).update({
        uid: authUser.uid,
      });

      updated++;
      console.log(`✅ UID added → ${user.email}`);
    } catch {
      console.log(`⚠️ Auth user not found → ${user.email}`);
    }
  }

  console.log(`🎉 UID migration done. Updated: ${updated}`);
}

migrateUsersAddUid().catch(console.error);
