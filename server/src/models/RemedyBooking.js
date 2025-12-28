import mongoose from "mongoose";

const RemedyBookingSchema = new mongoose.Schema({
  remedyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Remedy",
  },

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  form: {
    name: String,
    email: String,
    phone: String,
    problem: String,
    message: String,
    duration: String
  },

  paymentId: String,

  status: {
    type: String,
    enum: ["paid", "contacted", "completed"],
    default: "paid",
  },
}, { timestamps: true });

export default mongoose.model("RemedyBooking", RemedyBookingSchema);
