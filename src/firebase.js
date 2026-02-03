import { initializeApp } from "firebase/app";
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getFunctions } from "firebase/functions"; // ✅ ADD THIS

const firebaseConfig = {
  apiKey: "AIzaSyAQqJUl9Z_dBuRB7vVTR-y7W5chs3OKvSU",
  authDomain: "smart-study-room-aiot.firebaseapp.com",
  databaseURL: "https://smart-study-room-aiot-default-rtdb.firebaseio.com",
  projectId: "smart-study-room-aiot",
  storageBucket: "smart-study-room-aiot.firebasestorage.app",
  messagingSenderId: "1083396902922",
  appId: "1:1083396902922:web:9757d529e5a4b87e1bcff3",
};

const app = initializeApp(firebaseConfig);

/* 🔐 AUTH */
export const auth = getAuth(app);

/* 🔥 PERSIST LOGIN */
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log("Auth persistence set");
  })
  .catch((err) => {
    console.error("Auth persistence error:", err);
  });

/* 🧾 FIRESTORE */
export const db = getFirestore(app);

/* ☁️ CLOUD FUNCTIONS (OTP, backend logic) */
export const functions = getFunctions(app); // ✅ ADD THIS