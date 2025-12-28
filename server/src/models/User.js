import mongoose from "mongoose";
import { type } from "os";

const AstroProfileSchema = new mongoose.Schema({
  fullName: { type: String },
  gender: {
    type: String,
    enum: ["male", "female", "other"],
  },

  dateOfBirth: { type: Date },

  birthDetails: {
    day: Number,
    month: Number,
    year: Number,
    hour: Number,
    minute: Number,
  },

  birthPlace: {
    city: String,
    state: String,
    country: String,
    latitude: Number,
    longitude: Number,
    timezone: Number,
  },

  maritalStatus: {
    type: String,
    enum: ["single", "married", "divorced", "widowed"],
  },

  occupation: String,

  problemAreas: {
    love: { type: Boolean, default: false },
    career: { type: Boolean, default: false },
    health: { type: Boolean, default: false },
    marriage: { type: Boolean, default: false },
    finance: { type: Boolean, default: false },
  },

  

}, { _id: false });

/* ================= USER SCHEMA ================= */

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true,
  },
  phone: {
    type: String,
    unique: true,
    required: true,
  },
  isProfileComplete: {
    type: Boolean,
    default: false,
  },
  walletBalance:{
    type: Number,
    default: 0,
    min: 0
    
  },

  astroProfile: AstroProfileSchema,


}, {
  timestamps: true, // createdAt + updatedAt auto
});

const User = mongoose.model("User", UserSchema);

export default User;
