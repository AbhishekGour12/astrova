import Razorpay from "razorpay";
import Payment from "../models/Payment.js";
import Order from "../models/Order.js";

export const initiatePayment = async (req, res) => {
  const { amount } = req.body;
  const instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY,
    key_secret: process.env.RAZORPAY_SECRET,
  });

  try {
    const order = await instance.orders.create({
      amount: amount * 100, // convert to paisa
      currency: "INR",
      receipt: "order_" + new Date().getTime(),
    });

    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ✅ Verify payment & create order entry
export const verifyPayment = async (req, res) => {
  try {
    const { paymentId, razorpayOrderId, amount, userId, products, shippingAddress, shippingCharge } = req.body;

    // Calculate GST
    const gstAmount = (amount * 18) / 100;
    const totalAmount = amount + gstAmount + shippingCharge;

    // Save order
    const order = await Order.create({
      userId,
      products,
      gstAmount,
      shippingCharge,
      subtotal: amount,
      totalAmount,
      shippingAddress,
      paymentStatus: "Paid",
    });

    // Save payment
    await Payment.create({
      orderId: order._id,
      paymentId,
      razorpayOrderId,
      amount: totalAmount,
      method: "Razorpay",
      status: "Paid",
    });

    res.json({ success: true, message: "Payment verified and order created", orderId: order._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
