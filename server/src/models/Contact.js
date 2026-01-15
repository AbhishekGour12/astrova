// models/Contact.js
import mongoose from "mongoose";

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true,
    minlength: [2, "Name must be at least 2 characters"]
  },
  
  email: {
    type: String,
    required: [true, "Email is required"],
    trim: true,
    lowercase: true,
    match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"]
  },
  
  phone: {
    type: String,
    trim: true,
    default: ""
  },
  
  subject: {
    type: String,
    required: [true, "Subject is required"],
    trim: true,
    enum: [
      "general",
      "technical",
      "billing",
      "astrologer",
      "feedback",
      "other"
    ],
    default: "general"
  },
  
  message: {
    type: String,
    required: [true, "Message is required"],
    trim: true,
    minlength: [10, "Message must be at least 10 characters"]
  },
  
  astrologerInterest: {
    type: Boolean,
    default: false
  },
  
  status: {
    type: String,
    enum: ["pending", "read", "replied", "closed"],
    default: "pending"
  },
  
 
  
  // Optional: if user is logged in
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }
  
}, {
  timestamps: true
});

// Index for faster queries
contactSchema.index({ email: 1, createdAt: -1 });
contactSchema.index({ status: 1 });

const Contact = mongoose.models.Contact || mongoose.model("Contact", contactSchema);
export default Contact;