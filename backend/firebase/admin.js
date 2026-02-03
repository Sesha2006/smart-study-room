const admin = require("firebase-admin");

let credential;

// Render / Production → ENV
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  credential = admin.credential.cert(
    JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT)
  );
}
// Local → file
else {
  credential = admin.credential.cert(
    require("../serviceAccountKey.json")
  );
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential,
    databaseURL:
      "https://smart-study-room-aiot-default-rtdb.firebaseio.com/",
  });

  console.log("🔥 Firebase Admin initialized");
}

const db = admin.firestore();
const rtdb = admin.database();

module.exports = { admin, db, rtdb };
