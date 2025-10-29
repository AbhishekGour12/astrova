import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
    paymentId: String,
    amount: Number,
    method: String, // Razorpay, Stripe, UPI
    status: { type: String, default: "initiated" },
  },
  { timestamps: true }
);

export default mongoose.model("Payment", paymentSchema);
