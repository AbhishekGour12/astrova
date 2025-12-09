import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
    paymentId: String,
    razorpayOrderId: String,
    amount: Number,
    method: { type: String, enum: ["Razorpay", "Stripe", "UPI", "Cash"], default: "Razorpay" },
    status: { type: String, default: "initiated" },
  },
  { timestamps: true }
);

export default mongoose.model("Payment", paymentSchema);
