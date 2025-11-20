import express from "express";
import {
  getDashboardStats,
  getAllUsers,
  deleteUser,
  getAllAstrologers,
  approveAstrologer,
  deleteAstrologer,
  getAllOrders,
  updateOrderStatus,
  getAllPayments,
  getAllChats,
  deleteChat,
  getAllAdmins,
  addSubAdmin,
  deleteSubAdmin,
} from "../controllers/adminController.js";
import {

  getProducts,
 
  getProductTypes,
  addProductType,
  addBulkProductsWithImages,
  uploadBulkProductsWithImages,
  deleteProduct,
  updateProduct,
} from "../controllers/productController.js";
import multer from "multer";
import  { uploadExcelAndImages, uploadImages } from "../utils/multer.js";
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






//Product

router.post(
  "/product",
  uploadImages.array("images", 50), // allow up to 50 product images
  addBulkProductsWithImages
);

// ✅ Excel upload (single file)
router.post(
  "/bulk-upload",
  uploadExcelAndImages.fields([
    { name: "excelFile", maxCount: 1 },
    { name: "productImages", maxCount: 50 },
  ]),
  uploadBulkProductsWithImages
);

// ✅ Product types management
router.get("/types", getProductTypes);
router.post("/types", addProductType);

// ✅ Get all products
router.get("/product", getProducts);
router.put("/:id", uploadImages.array("images", 50), updateProduct)
router.delete("/:id", deleteProduct)



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
