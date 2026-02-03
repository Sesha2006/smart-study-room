const crypto = require("crypto");
const { db } = require("../firebase/admin");

module.exports = async (req, res) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

  const signature = req.headers["x-razorpay-signature"];
  const expected = crypto
    .createHmac("sha256", secret)
    .update(req.body)
    .digest("hex");

  if (signature !== expected) {
    return res.status(400).send("Invalid signature");
  }

  const event = JSON.parse(req.body.toString());

  if (event.event === "payment.captured") {
    const payment = event.payload.payment.entity;

    await db.collection("bookingRequests").doc(payment.notes.bookingId).update({
      paymentStatus: "paid",
      razorpayPaymentId: payment.id,
      razorpayOrderId: payment.order_id,
      paidAt: new Date(),
    });
  }

  res.json({ status: "ok" });
};
