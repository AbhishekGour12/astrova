import express from "express";
import { createOrder, verifyPayment } from "../controllers/paymentController.js";
import { authMiddleware, onlyUser } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/create-order", authMiddleware, onlyUser, createOrder);
router.post("/verify", verifyPayment);

export default router;
