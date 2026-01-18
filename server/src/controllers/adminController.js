import User from "../models/User.js";
import Admin from "../models/Admin.js";
import Astrologer from "../models/Astrologer.js";
import Product from "../models/Products.js";
import Order from "../models/Order.js";
import Payment from "../models/Payment.js";
import Chat from "../models/Chat.js";
import sendEmail from "../utils/sendEmail.js";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import axios from "axios";
import dotenv from "dotenv";
import * as XLSX from 'xlsx';

// ===================== //
// 🔐 ADMIN DASHBOARD OPS //
// ===================== //



dotenv.config()
 const razorpayX = axios.create({
  baseURL: "https://api.razorpay.com/v1",
  auth: {
    username: process.env.RAZORPAY_KEY,
    password: process.env.RAZORPAY_SECRET 
  },
  headers: {
    "Content-Type": "application/json",
  },
});



/**
 * @desc Get overall dashboard stats
 * @route GET /api/admin/stats
 */
export const getDashboardStats = async (req, res) => {
  try {
    const usersCount = await User.countDocuments();
    const astrologersCount = await Astrologer.countDocuments();
    const productsCount = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalPayments = await Payment.aggregate([{ $group: { _id: null, total: { $sum: "$amount" } } }]);

    res.json({
      usersCount,
      astrologersCount,
      productsCount,
      totalOrders,
      totalRevenue: totalPayments[0]?.total || 0,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ===================== //
// 👥 USER MANAGEMENT //
// ===================== //

/**
 * @desc Get all users
 * @route GET /api/admin/users
 */
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * @desc Delete a user
 * @route DELETE /api/admin/users/:id
 */
export const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ===================== //
// 🔮 ASTROLOGER MANAGEMENT //
// ===================== //

/**
 * @desc Get all astrologers
 * @route GET /api/admin/astrologers
 */
export const getAllAstrologers = async (req, res) => {
  try {
    const astrologers = await Astrologer.find({isApproved: true}).sort({ createdAt: -1 });
    res.json(astrologers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



/**
 * @desc Delete astrologer
 * @route DELETE /api/admin/astrologers/:id
 */
export const deleteAstrologer = async (req, res) => {
  try {
    await Astrologer.findByIdAndDelete(req.params.id);
    res.json({ message: "Astrologer removed successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ===================== //
// 🛒 PRODUCT MANAGEMENT //
// ===================== //

/**
 * @desc Add new product
 * @route POST /api/admin/products
 */

/**
 * @desc Update product
 * @route PUT /api/admin/products/:id
 */

/**
 * @desc Delete product
 * @route DELETE /api/admin/products/:id
 */
export const deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ===================== //
// 📦 ORDER MANAGEMENT //
// ===================== //

/**
 * @desc Get all orders
 * @route GET /api/admin/orders
 */
export const getAllOrders = async (req, res) => {
  try {
   const orders = await Order.find()
  .populate("items.product")   // product details
  .populate("userId", "username email phone") // user details
  .sort({ createdAt: -1 });

res.json({
  success: true,
  count: orders.length,
  orders
});

  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log(error.message)
  }
};

/**
 * @desc Update order status
 * @route PATCH /api/admin/orders/:id
 */
export const updateOrderStatus = async (req, res) => {
  try {
    const updated = await Order.findByIdAndUpdate(
      req.params.id,
      { orderStatus: req.body.status },
      { new: true }
    );
    res.json({ message: "Order status updated", updated });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ===================== //
// 💰 PAYMENT MANAGEMENT //
// ===================== //

/**
 * @desc Get all payments
 * @route GET /api/admin/payments
 */
export const getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find().populate("orderId", "shipmentId", "totalAmount");
    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ===================== //
// 💬 CHAT MANAGEMENT //
// ===================== //

/**
 * @desc Get all chats in system
 * @route GET /api/admin/chats
 */
export const getAllChats = async (req, res) => {
  try {
    const chats = await Chat.find().populate("participants");
    res.json(chats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * @desc Delete a chat thread
 * @route DELETE /api/admin/chats/:id
 */
export const deleteChat = async (req, res) => {
  try {
    await Chat.findByIdAndDelete(req.params.id);
    res.json({ message: "Chat deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ===================== //
// 🧑‍💼 ADMIN MANAGEMENT //
// ===================== //

/**
 * @desc Get all admins
 * @route GET /api/admin/admins
 */
export const getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.find();
    res.json(admins);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * @desc Add sub-admin
 * @route POST /api/admin/add-admin
 */
export const addSubAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const admin = await Admin.create({ name, email, password });
    res.json({ message: "Sub-admin added", admin });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

/**
 * @desc Delete sub-admin
 * @route DELETE /api/admin/admins/:id
 */
export const deleteSubAdmin = async (req, res) => {
  try {
    await Admin.findByIdAndDelete(req.params.id);
    res.json({ message: "Admin removed" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



/**
 * @desc Approve astrologer (Admin verification)
 * @route PATCH /api/admin/astrologers/approve/:id
 */

export const approveAstrologer = async (req, res) => {
  try {
    const astrologer = await Astrologer.findById(req.params.id);
    if (!astrologer) {
      return res.status(404).json({ message: "Astrologer not found" });
    }

    if (astrologer.isApproved) {
      return res.status(400).json({ message: "Already approved" });
    }

    /* ================= 1️⃣ PASSWORD ================= */
    const rawPassword = crypto.randomBytes(6).toString("hex");
    astrologer.password = await bcrypt.hash(rawPassword, 10);

    /* ================= 2️⃣ CREATE CONTACT ================= */
    const contactRes = await razorpayX.post("/contacts", {
      name: astrologer.fullName,
      email: astrologer.email,
      contact: astrologer.phone,
      type: astrologer.isAdmin ? "vendor" : "employee",
      reference_id: astrologer._id.toString(),
    });

    const contactId = contactRes.data.id;

    /* ================= 3️⃣ CREATE FUND ACCOUNT ================= */
    const fundAccountRes = await razorpayX.post("/fund_accounts", {
      contact_id: contactId,
      account_type: "bank_account",
      bank_account: {
        name: astrologer.fullName,
        ifsc: astrologer.ifsc,
        account_number: astrologer.bankAccountNumber,
      },
    });

    /* ================= 4️⃣ SAVE DB ================= */
    astrologer.razorpayContactId = contactId;
    astrologer.razorpayFundAccountId = fundAccountRes.data.id;
    astrologer.isApproved = true;
    astrologer.approvedAt = new Date();
    await astrologer.save();

    /* ================= 5️⃣ EMAIL ================= */
    await sendEmail({
      to: astrologer.email,
      subject: "Astrologer Account Approved",
      html: `
        <h3>Welcome ${astrologer.fullName}</h3>
        <p>Your account has been approved.</p>
        <p><b>Email:</b> ${astrologer.email}</p>
        <p><b>Password:</b> ${rawPassword}</p>
        <p>Please login and change your password.</p>
      `,
    });

    res.json({
      success: true,
      message: astrologer.isAdmin
        ? "Admin approved with RazorpayX fund account"
        : "Astrologer approved with RazorpayX fund account",
    });

  } catch (err) {
    console.error("Approve astrologer error:", err.response?.data || err.message);
    res.status(500).json({
      message: err.response?.data?.error?.description || err.message,
    });
  }
};






// Simple fetch all payments
export const getAllPayment = async (req, res) => {
  try {
    const payments = await Payment.find({})
      .populate({
        path: "orderId",
        select: "orderNumber customerName"
      })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: payments,
      count: payments.length
    });
  } catch (error) {
    console.error("Get payments error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch payments"
    });
  }
};

// Export payments to Excel
export const exportPayments = async (req, res) => {
  try {
    const payments = await Payment.find({})
      .populate({
        path: "orderId",
        select: "orderNumber customerName"
      })
      .sort({ createdAt: -1 });

    // Format data for Excel
    const excelData = payments.map(payment => ({
      "Order ID": payment.orderId?._id || "N/A",
      "Order Number": payment.orderId?.orderNumber || "N/A",
      "Customer": payment.orderId?.customerName || "N/A",
      "Payment ID": payment.paymentId || "N/A",
      "Amount": payment.amount,
      "Method": payment.method,
      "Status": payment.status,
      "Date": new Date(payment.createdAt).toLocaleString()
    }));

    // Create workbook
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(excelData);
    
    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, "Payments");
    
    // Generate buffer
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Set response headers
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=payments.xlsx');
    
    // Send Excel file
    res.send(excelBuffer);

  } catch (error) {
    console.error("Export error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to export payments"
    });
  }
};