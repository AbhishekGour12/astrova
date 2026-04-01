import mongoose from "mongoose";
import slugify from 'slugify'
// Helper function to ensure integer values
const toInteger = (value) => Math.round(Number(value));

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, unique: true },
    description: { type: String },
    price: { type: Number, required: true , set: toInteger},
    stock: { type: Number, min: 0, default: 0 },
    productType: { type: String, required: true }, // 🟢 dynamic editable type
    availableTypes: {
      type: [String],
      default: ["Bracelet", "Rudraksha", "Yantra", "Chain", "Gemstone", "Pendant", "Stones", "Pyramids", "Tortoise"],
    },
    category: { type: String, required: true, default: ["Gift", "Love", "Money", "Evil Eye", "Health", "Gifting", "Career"]}, // admin-editable list of product types
     // For shipping (in kg)
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

// Save se pehle slug generate
ProductSchema.pre("save", function (next) {
  if (!this.slug && this.name) {
    this.slug =
      slugify(this.name, { lower: true, strict: true }) +
      "-" +
      Date.now(); // unique banane ke liye
  }
  next();
});

export default mongoose.model("Product", ProductSchema);
