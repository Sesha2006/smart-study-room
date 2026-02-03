const razorpay = require("./client");

module.exports = async (req, res) => {
  try {
    const { amount } = req.body;

    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: "INR",
      receipt: `rcpt_${Date.now()}`,
    });

    res.json(order);
  } catch (err) {
    res.status(500).json({ error: "Order creation failed" });
  }
};
