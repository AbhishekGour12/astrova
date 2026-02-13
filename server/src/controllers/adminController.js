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




export const deleteALLUser = async (req, res) => {
  try {
    await User.deleteMany();
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
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


export const deleteALLProduct = async (req, res) => {
  try {
    await Product.deleteMany();
    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};







// Helper for consistent status checking
const PAID_STATUS = ["captured", "success"]; 

// 1. Get Main Dashboard Stats (Overview, Recent Orders, Top Products)
export const getDashboardStats = async (req, res) => {
  try {
    const [
      usersCount,
      astrologersCount,
      productsCount,
      totalOrders,
      pendingOrders,
      revenueData,
      recentOrders,
      topProducts
    ] = await Promise.all([
      User.countDocuments(),
      Astrologer.countDocuments({ isApproved: true }),
      Product.countDocuments(),
      Order.countDocuments(),
      Order.countDocuments({ shiprocketStatus: "Pending" }),
      
      // Fixed: Check for both 'captured' and 'success'
      Payment.aggregate([
        { $match: { status: { $in: PAID_STATUS } } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]),

      Order.find()
        .populate('userId', 'username email')
        .sort({ createdAt: -1 })
        .limit(10)
        .lean(),

      // Top Selling Products
      Order.aggregate([
        { $unwind: "$items" },
        { $group: { 
          _id: "$items.product", 
          totalSold: { $sum: "$items.quantity" },
          totalRevenue: { $sum: { $multiply: ["$items.quantity", "$items.price"] } }
        }},
        { $sort: { totalSold: -1 } },
        { $limit: 5 },
        { $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product'
        }},
        { $unwind: "$product" },
        { $project: {
          productId: "$_id",
          productName: "$product.name",
          productImage: { $arrayElemAt: ["$product.imageUrls", 0] },
          totalSold: 1,
          totalRevenue: 1
        }}
      ])
    ]);

    const totalRevenue = revenueData[0]?.total || 0;

    // Calculate Today vs Yesterday for Growth %
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const [todaysData, yesterdaysData] = await Promise.all([
        Payment.aggregate([
            { $match: { status: { $in: PAID_STATUS }, createdAt: { $gte: today } } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]),
        Payment.aggregate([
            { $match: { status: { $in: PAID_STATUS }, createdAt: { $gte: yesterday, $lt: today } } },
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ])
    ]);

    const todaysRevenue = todaysData[0]?.total || 0;
    const yesterdaysRevenue = yesterdaysData[0]?.total || 0;

    const revenueGrowth = yesterdaysRevenue > 0 
      ? (((todaysRevenue - yesterdaysRevenue) / yesterdaysRevenue) * 100).toFixed(1)
      : todaysRevenue > 0 ? 100 : 0;

    res.json({
      success: true,
      data: {
        overview: {
          usersCount,
          astrologersCount,
          productsCount,
          totalOrders,
          pendingOrders,
          todaysRevenue,
          totalRevenue,
          revenueGrowth: parseFloat(revenueGrowth)
        },
        recentOrders: recentOrders.map(order => ({
            _id: order._id,
            orderNumber: `ORD${order._id.toString().slice(-6).toUpperCase()}`,
            userName: order.userId?.username || 'N/A',
            userEmail: order.userId?.email || 'N/A',
            totalAmount: order.totalAmount,
            orderStatus: order.shiprocketStatus,
            createdAt: order.createdAt,
            itemsCount: order.items?.length || 0
        })),
        topProducts
      }
    });

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// 2. Get Detailed Revenue Analytics (For Chart)
export const getRevenueAnalytics = async (req, res) => {
  try {
    const { period = 'month' } = req.query; 
    const now = new Date();
    let matchPeriod, groupFormat;

    // Logic to determine time range
    switch (period) {
      case 'day': // Last 30 Days
        matchPeriod = new Date();
        matchPeriod.setDate(now.getDate() - 30);
        groupFormat = { year: { $year: "$createdAt" }, month: { $month: "$createdAt" }, day: { $dayOfMonth: "$createdAt" } };
        break;
      case 'week': // Last 12 Weeks
        matchPeriod = new Date();
        matchPeriod.setDate(now.getDate() - (7 * 12));
        groupFormat = { year: { $year: "$createdAt" }, week: { $week: "$createdAt" } };
        break;
      case 'year': // Last 5 Years
         matchPeriod = new Date();
         matchPeriod.setFullYear(now.getFullYear() - 5);
         groupFormat = { year: { $year: "$createdAt" } };
         break;
      default: // Last 6 Months (default)
        matchPeriod = new Date();
        matchPeriod.setMonth(now.getMonth() - 6);
        groupFormat = { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } };
    }

    const revenueData = await Payment.aggregate([
      {
        $match: {
          status: { $in: PAID_STATUS }, // FIXED: Using consistent status
          createdAt: { $gte: matchPeriod }
        }
      },
      {
        $group: {
          _id: groupFormat,
          revenue: { $sum: "$amount" },
          orders: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1, "_id.week": 1 } }
    ]);

    // Format for Chart.js / Recharts
    const formattedData = revenueData.map(item => {
        let label = '';
        if (period === 'day') label = `${item._id.day}/${item._id.month}`;
        else if (period === 'week') label = `W${item._id.week}`;
        else if (period === 'month') label = getMonthName(item._id.month);
        else if (period === 'year') label = item._id.year.toString();
        
        return { label, revenue: item.revenue, orders: item.orders };
    });

    res.json({ success: true, data: { period, analytics: formattedData } });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};



const getMonthName = (monthNum) => 
  ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][monthNum - 1];

// Get quick stats for dashboard cards
export const getQuickStats = async (req, res) => {
  try {
    const [
      usersCount,
      astrologersCount,
      productsCount,
      totalOrders,
      pendingOrders,
      todaysOrders,
      todaysRevenue,
      totalRevenue
    ] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      Astrologer.countDocuments({ isApproved: true }),
      Product.countDocuments(),
      Order.countDocuments(),
      Order.countDocuments({ shiprocketStatus: "Pending" }),
      
      // Today's orders
      Order.countDocuments({
        createdAt: { $gte: new Date().setHours(0, 0, 0, 0) }
      }),
      
      // Today's revenue
      Payment.aggregate([
        { 
          $match: { 
            status: "captured",
            createdAt: { $gte: new Date().setHours(0, 0, 0, 0) }
          }
        },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]),
      
      // Total revenue
      Payment.aggregate([
        { $match: { status: "captured" } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ])
    ]);

    const stats = {
      usersCount,
      astrologersCount,
      productsCount,
      totalOrders,
      pendingOrders,
      todaysOrders,
      todaysRevenue: todaysRevenue[0]?.total || 0,
      totalRevenue: totalRevenue[0]?.total || 0
    };

    res.json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('Error fetching quick stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching quick statistics',
      error: error.message
    });
  }
};