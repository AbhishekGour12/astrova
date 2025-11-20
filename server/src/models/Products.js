import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    stock: { type: Number, default: 0 },
    productType: { type: String, required: true }, // 🟢 dynamic editable type
    availableTypes: {
      type: [String],
      default: ["Bracelet", "Rudraksha", "Yantra", "Chain", "Gemstone", "Pendant", "Stones", "Pyramids", "Tortoise"],
    },
    category: { type: String, required: true, default: ["Gift", "Love", "Money", "Evil Eye", "Health", "Gifting", "Career"]}, // admin-editable list of product types
    weight: { type: Number, required: true }, // For shipping (in kg)
    imageUrls: { type: [String], default: [] },
    gstPercent: { type: Number, default: 18 },
    totalPrice: { type: Number },
    isFeatured: { type: Boolean, default: false },
    rating: { type: Number, default: 0, min: 0, max: 5 }
  },
  { timestamps: true }
);

// 🧮 Auto calculate total price
ProductSchema.pre("save", function (next) {
  const gst = (this.price * this.gstPercent) / 100;
  this.totalPrice = this.price + gst + (this.courierCharge || 0);
  next();
});

export default mongoose.model("Product", ProductSchema);
