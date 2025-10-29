import express from "express";
import {
  getDashboardStats,
  getAllUsers,
  deleteUser,
  getAllAstrologers,
  approveAstrologer,
  deleteAstrologer,
  addProduct,
  updateProduct,
  deleteProduct,
  getAllOrders,
  updateOrderStatus,
  getAllPayments,
  getAllChats,
  deleteChat,
  getAllAdmins,
  addSubAdmin,
  deleteSubAdmin,
} from "../controllers/adminController.js";

const router = express.Router();

// Dashboard
router.get("/stats", getDashboardStats);

// Users
router.get("/users", getAllUsers);
router.delete("/users/:id", deleteUser);

// Astrologers
router.get("/astrologers", getAllAstrologers);
router.patch("/astrologers/approve/:id", approveAstrologer);
router.delete("/astrologers/:id", deleteAstrologer);

// Products
router.post("/products", addProduct);
router.put("/products/:id", updateProduct);
router.delete("/products/:id", deleteProduct);

// Orders
router.get("/orders", getAllOrders);
router.patch("/orders/:id", updateOrderStatus);

// Payments
router.get("/payments", getAllPayments);

// Chats
router.get("/chats", getAllChats);
router.delete("/chats/:id", deleteChat);

// Admins
router.get("/admins", getAllAdmins);
router.post("/add-admin", addSubAdmin);
router.delete("/admins/:id", deleteSubAdmin);

export default router;
