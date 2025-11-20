import mongoose from "mongoose";
import Product from "../models/Products.js"

const CartSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true
        },
        quantity: { type: Number, required: true, default: 1 },
        addedAt: { type: Date, default: Date.now }
      }
    ],
    totalAmount: { type: Number, default: 0 }
  },
  { timestamps: true }
);

// FIXED total calculation (product.price now comes from DB)
CartSchema.pre("save", async function (next) {
  let total = 0;

  for (const item of this.items) {
    const product = await Product.findById(item.product);
    if (product) {
      total += product.price * item.quantity;
    }
  }

  this.totalAmount = total;
  next();
});

export default mongoose.model("Cart", CartSchema);
