const crypto = require("crypto");

module.exports = (req, res) => {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  } = req.body;

  const body = `${razorpay_order_id}|${razorpay_payment_id}`; // ✅ fixed

  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest("hex");

  if (expected === razorpay_signature) {
    return res.json({ status: "success" });
  }

  res.status(400).json({ status: "failure" });
};
