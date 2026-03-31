import mongoose from "mongoose";
// Helper function to ensure integer values
const toInteger = (value) => Math.round(Number(value));

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true , set: toInteger},
    stock: { type: Number, min: 0, default: 0 },
    productType: { type: String, required: true }, // 🟢 dynamic editable type
    availableTypes: {
      type: [String],
      default: ["Bracelet", "Rudraksha", "Yantra", "Chain", "Gemstone", "Pendant", "Stones", "Pyramids", "Tortoise"],
    },
    category: { type: String, required: true, default: ["Gift", "Love", "Money", "Evil Eye", "Health", "Gifting", "Career"]}, // admin-editable list of product types
    weight: { type: Number, required: true }, // For shipping (in kg)
    imageUrls: { type: [String], default: [] },
    gstPercent: { type: Number, default: 18 },
    totalPrice: { type: Number, set: toInteger },
    isFeatured: { type: Boolean, default: false },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    weight: { type: Number, default: 0.2 },   // KG
    length: { type: Number, default: 10 },   // CM
    breadth: { type: Number, default: 10 },  // CM
    height: { type: Number, default: 10 }, 
    offerPercent: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },

    discountedPrice: {
      type: Number
    },
  // CM

  },
  { timestamps: true }
);




export default mongoose.model("Product", ProductSchema);
