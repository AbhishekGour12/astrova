import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  items: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      quantity: Number,
      price: Number,
    }
  ],

  shippingAddress: Object,
  subtotal: Number,
  gstAmount: Number,
  shippingCharge: Number,
  discount: Number,
  totalAmount: Number,

  // Payment
  paymentMethod: { type: String, enum: ["cod", "online"], default: "cod" },
  paymentStatus: { type: String, enum: ["Pending", "Paid", "Failed"], default: "Pending" },
  paymentDetails: Object,

  // SHIPROCKET ORDER DATA
  shiprocketOrderId: String,
  shipmentId: String,
  awbCode: String,

  // 👇 Ye status automatically Shiprocket se update hoga  
  shiprocketStatus: { type: String, default: "Pending" }, 
  shiprocketStatusDate: Date,
  

}, { timestamps: true });

export default mongoose.model("Order", orderSchema);
