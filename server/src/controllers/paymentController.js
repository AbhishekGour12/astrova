import Razorpay from "razorpay";
import crypto from "crypto";
import Payment from "../models/Payment.js";

import dotenv from "dotenv";
import User from "../models/User.js";
dotenv.config()
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY,
  key_secret: process.env.RAZORPAY_SECRET 
});

export const createOrder = async (req, res) => {
  try {
    const { amount, phone } = req.body;
    
    
    const user = await User.findOne({phone: phone})

    const order = await razorpay.orders.create({
      amount: amount,
      currency: "INR",
      receipt: "receipt_order_" + Date.now(),
    });
    // -----------------------------------
// SAVE PAYMENT INFO (COMMON FOR ALL)
// -----------------------------------

 await Payment.create({
      user: user._id,
      razorpayOrderId: order.id,
      amount: amount / 100,
      method: "Razorpay",
      status: "initiated",
    });
  


    res.json(order);
  } catch (err) {
    console.log(err.message)
    res.status(500).json({ message: err.message });
  }
};
export const verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;
    console.log(razorpay_order_id)

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: "Missing payment fields" });
    }

    const sign = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET )
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (sign !== razorpay_signature) {
      await Payment.findOneAndUpdate(
        { razorpayOrderId: razorpay_order_id },
        { status: "failed" }
      );

      return res.status(400).json({ message: "Invalid signature" });
    }
    
    await Payment.findOneAndUpdate(
      { razorpayOrderId: razorpay_order_id },
      {
        status: "success",
        razorpayPaymentId: razorpay_payment_id,
      }
    );

    return res.json({ success: true });
  } catch (err) {
    console.error("Verify error:", err.message);
    res.status(500).json({ message: err.message });
  }
};
