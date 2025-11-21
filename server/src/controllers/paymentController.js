import Razorpay from "razorpay";
import crypto from "crypto";
console.log(process.env.RAZORPAY_KEY)

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY || "rzp_test_pEZdDpwnJejkWR",
  key_secret: process.env.RAZORPAY_SECRET ||"YVC6HQFJ8OJGeFq6MNzCzjEN",
});

export const createOrder = async (req, res) => {
  try {
    const { amount } = req.body;
    console.log(amount)

    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: "INR",
      receipt: "receipt_order_" + Date.now(),
    });

    res.json(order);
  } catch (err) {
    console.log(err.message)
    res.status(500).json({ message: err.message });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    const sign = crypto
      .createHmac("sha256", process.env.RZP_KEY_SECRET || "YVC6HQFJ8OJGeFq6MNzCzjEN")
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (sign !== razorpay_signature)
      return res.status(400).json({ message: "Invalid payment signature" });

    res.json({ success: true });
  } catch (err) {
    console.log(err.message)
    res.status(500).json({ message: err.message });
  }
};
