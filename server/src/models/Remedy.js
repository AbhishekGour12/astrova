import mongoose from "mongoose";
import { type } from "os";

const RemedySchema = new mongoose.Schema({
  title: { type: String, required: true },
  shortDescription: String,
  description: String,

  image: {
    type: String, // image URL/path
    required: true,
  },

  price: {
    type: Number,
    required: true,
  },

  category: {
    type: String, // puja, healing, spell, etc
  },
  duration:{
    type: String

  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, { timestamps: true });

export default mongoose.model("Remedy", RemedySchema);
