import mongoose from "mongoose";

const AdminSchema = new mongoose.Schema(
  {
    // Base Details
    adminId: {type: String, required: true, unique: true, ref:"User" },
    name: { type: String, required: true },
    phone: { type: Number, required: true, unique: true },
    
    role: { type: String, default: "admin" }, // Superadmin / Subadmin

    // Profile & Contact Info
   
    profileImageUrl: { type: String },
    bio: { type: String, default: "" },

    // Role Permissions & Access
    permissions: {
      type: [String],
      default: [
        "manage_users",
        "manage_products",
        "manage_orders",
        "manage_astrologers",
        "view_reports",
      ],
    },

    // Dashboard Metrics
    totalUsers: { type: Number, default: 0 },
    totalOrders: { type: Number, default: 0 },
    totalAstrologers: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 },

    // Activity Logs (for auditing actions)
    activityLogs: [
      {
        action: { type: String }, // e.g., "Deleted User", "Approved Astrologer"
        targetId: { type: mongoose.Schema.Types.ObjectId, refPath: "activityLogs.targetModel" },
        targetModel: { type: String }, // dynamic ref: 'User', 'Astrologer', 'Order', etc.
        timestamp: { type: Date, default: Date.now },
      },
    ],

    // For future notification / communication system
    notifications: [
      {
        message: String,
        link: String,
        isRead: { type: Boolean, default: false },
        createdAt: { type: Date, default: Date.now },
      },
    ],

    // Admin Status
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date, default: null },
  },
  { timestamps: true }
);

export default mongoose.model("Admin", AdminSchema);
