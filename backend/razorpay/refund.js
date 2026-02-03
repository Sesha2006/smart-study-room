const razorpay = require("./client");

module.exports = async (req, res) => {
  const { paymentId, amount } = req.body;

  try {
    const refund = await razorpay.payments.refund(paymentId, {
      amount: amount * 100,
    });

    res.json(refund);
  } catch (err) {
    res.status(500).json({ error: "Refund failed" });
  }
};
