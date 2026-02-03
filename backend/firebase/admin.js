const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { getDatabase } = require("firebase-admin/database");

const serviceAccount = require("../serviceAccountKey.json");

initializeApp({
  credential: cert(serviceAccount),
  databaseURL: "https://smart-study-room-aiot-default-rtdb.firebaseio.com",
});

module.exports = {
  db: getFirestore(),
  rtdb: getDatabase(),
};