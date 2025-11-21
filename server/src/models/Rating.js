// models/Rating.js
import mongoose from "mongoose";

const RatingSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
      validate: {
        validator: Number.isFinite,
        message: "Rating must be a number"
      }
    },
    review: { type: String, trim: true, default: "" },
    // Optional: allow editing history
    editedAt: { type: Date, default: null }
  },
  { timestamps: true }
);

// Unique index: one rating per user per product
RatingSchema.index({ userId: 1, productId: 1 }, { unique: true });

// Static helper: recalc product average rating and reviewCount
RatingSchema.statics.recalculateProductStats = async function (productId) {
  const Rating = this;
  const agg = await Rating.aggregate([
    { $match: { productId: mongoose.Types.ObjectId(productId) } },
    {
      $group: {
        _id: "$productId",
        avgRating: { $avg: "$rating" },
        count: { $sum: 1 }
      }
    }
  ]);

  if (agg.length === 0) {
    // No ratings — set defaults on product
    await mongoose.model("Product").findByIdAndUpdate(productId, {
      rating: 0,
      reviewCount: 0
    });
    return { avgRating: 0, count: 0 };
  }

  const { avgRating, count } = agg[0];
  await mongoose.model("Product").findByIdAndUpdate(productId, {
    rating: Number(avgRating.toFixed(2)),
    reviewCount: count
  });

  return { avgRating, count };
};

export default mongoose.model("Rating", RatingSchema);
