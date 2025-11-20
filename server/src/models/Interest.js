import mongoose from "mongoose";

const UserInterestSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    isLiked: { type: Boolean, default: false },
    likeCount: { type: Number, default: 0 }
  },
  { timestamps: true }
);

// Ensure one interest per user-product combination
UserInterestSchema.index({ userId: 1, productId: 1 }, { unique: true });

export default mongoose.model("UserInterested", UserInterestSchema);