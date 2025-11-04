import User from "../models/User.js";
import Admin from "../models/Admin.js";
import Astrologer from "../models/Astrologer.js";
import Product from "../models/Products.js";
import Order from "../models/Order.js";
import Payment from "../models/Payment.js";
import Chat from "../models/Chat.js";

// ===================== //
// 🔐 ADMIN DASHBOARD OPS //
// ===================== //

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
    const astrologers = await Astrologer.find().sort({ createdAt: -1 });
    res.json(astrologers);
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
    const astrologer = await Astrologer.findByIdAndUpdate(
      req.params.id,
      { verified: true },
      { new: true }
    );
    res.json({ message: "Astrologer approved", astrologer });
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
    const orders = await Order.find().populate("user products.product");
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
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
    const payments = await Payment.find().populate("orderId");
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
