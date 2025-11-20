import mongoose from "mongoose";

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },
  discountType: { type: String, enum: ["percentage", "flat"], required: true },
  discountValue: { type: Number, required: true },
  minAmount: { type: Number, default: 0 },
  maxDiscount: { type: Number, default: 99999 },
  expiresAt: { type: Date, required: true },
  active: {type: Boolean}
});

export default mongoose.model("Coupon", couponSchema);
