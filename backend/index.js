/**
 * 🚀 SMART STUDY ROOM BACKEND
 * Razorpay + Firebase
 * Render compatible
 */

/* ================= LOAD ENV ================= */
require("dotenv").config();

/* ================= IMPORTS ================= */
const express = require("express");
const crypto = require("crypto");
const Razorpay = require("razorpay");
const cors = require("cors");

/* ================= FIREBASE ADMIN ================= */
const admin = require("firebase-admin");

/* ================= FIREBASE INIT (ENV BASED) ================= */
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    }),
    databaseURL: process.env.FIREBASE_DATABASE_URL,
  });
}

const db = admin.firestore();
const rtdb = admin.database();
const { Timestamp } = admin.firestore;

/* ================= EXPRESS APP ================= */
const app = express();
const PORT = process.env.PORT || 5000;

/* ================= CORS ================= */
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://smart-study-room-aiot.web.app",
      "https://smart-study-room-aiot.firebaseapp.com",
    ],
    methods: ["GET", "POST"],
    allowedHeaders: [
      "Content-Type",
      "X-Razorpay-Signature",
      "x-razorpay-signature",
    ],
  })
);

/* JSON parser (NOT for webhook) */
app.use(express.json());

/* ================= ENV CHECK ================= */
if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.error("❌ Razorpay ENV keys missing");
  process.exit(1);
}

if (!process.env.RAZORPAY_WEBHOOK_SECRET) {
  console.warn("⚠️ Razorpay webhook not configured yet");
}

console.log("✅ Razorpay backend keys loaded");

/* ================= RAZORPAY INIT ================= */
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/* ================= CONFIG ================= */
const BOOKING_APPROVAL_MINUTES = 5;
const STUDENT_CANCEL_MINUTES = 5;

/* ================= AUTO SYSTEM LOCK ================= */
let isRunning = false;

/* ======================================================
   💳 CREATE RAZORPAY ORDER
====================================================== */
app.post("/razorpay/create-order", async (req, res) => {
  try {
    const { amount } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Invalid amount" });
    }

    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    });

    res.json(order);
  } catch (err) {
    console.error("❌ Razorpay order error:", err);
    res.status(500).json({ error: "Order creation failed" });
  }
});

/* ======================================================
   🔐 VERIFY PAYMENT
====================================================== */
app.post("/razorpay/verify", (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest("hex");

    if (expectedSignature === razorpay_signature) {
      return res.json({ status: "success" });
    }

    res.status(400).json({ status: "failure" });
  } catch (err) {
    console.error("❌ Verification error:", err);
    res.status(500).json({ error: "Verification failed" });
  }
});

/* ======================================================
   🔔 RAZORPAY WEBHOOK
====================================================== */
app.post(
  "/razorpay/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    try {
      if (!process.env.RAZORPAY_WEBHOOK_SECRET) {
        return res.status(200).send("Webhook ignored");
      }

      const signature = req.headers["x-razorpay-signature"];

      const expected = crypto
        .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET)
        .update(req.body)
        .digest("hex");

      if (signature !== expected) {
        return res.status(400).send("Invalid signature");
      }

      const event = JSON.parse(req.body.toString());

      if (event.event === "payment.captured") {
        const payment = event.payload.payment.entity;

        const snap = await db
          .collection("bookingRequests")
          .where("razorpayOrderId", "==", payment.order_id)
          .get();

        snap.forEach((doc) => {
          doc.ref.update({
            paymentStatus: "paid",
            razorpayPaymentId: payment.id,
            paidAt: Timestamp.now(),
          });
        });
      }

      res.json({ status: "ok" });
    } catch (err) {
      console.error("🔥 Webhook error:", err.message);
      res.status(500).send("Webhook failed");
    }
  }
);

/* ======================================================
   ⏱ AUTO SYSTEM MANAGER
====================================================== */
async function autoSystemManager() {
  if (isRunning) return;
  isRunning = true;

  const now = Timestamp.now();

  try {
    const bookingSnap = await db
      .collection("bookingRequests")
      .where("status", "==", "pending")
      .get();

    const batch = db.batch();

    bookingSnap.forEach((doc) => {
      const data = doc.data();
      if (!data.createdAt) return;

      const diff =
        (now.toMillis() - data.createdAt.toMillis()) / 60000;

      if (diff >= BOOKING_APPROVAL_MINUTES) {
        batch.update(doc.ref, {
          status: "approved",
          approvedAt: now,
          autoApproved: true,
        });
      }
    });

    await batch.commit();
  } catch (err) {
    console.error("🔥 Auto system error:", err.message);
  } finally {
    isRunning = false;
  }
}

/* ================= ROOT ================= */
app.get("/", (req, res) => {
  res.send("✅ Smart Study Room backend running");
});

/* ================= START ================= */
console.log("⏱ Auto system manager started");
setInterval(autoSystemManager, 60 * 1000);

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
