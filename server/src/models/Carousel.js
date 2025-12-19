import mongoose from "mongoose";

const slideSchema = new mongoose.Schema({
  image: { type: String, required: true },
  title: { type: String, default: "" },
  subtitle: { type: String, default: "" },
  description: { type: String, default: "" },
  showButton: { type: Boolean, default: false },
  buttonText: { type: String, default: "" },
  buttonLink: { type: String, default: "" },
  buttonColor: {
    type: String,
    default: "bg-purple-600 hover:bg-purple-700",
  },
  order: { type: Number, default: 0 },
});

const carouselSchema = new mongoose.Schema(
  {
    page: {
      type: String,
      required: true,
      enum: ["home", "products", "remedies"],
      unique: true,
    },
    slides: [slideSchema],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export default mongoose.model("Carousel", carouselSchema);