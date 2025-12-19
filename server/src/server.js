import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import path from "path";
import { fileURLToPath } from "url";

import MongoDBConnect from "./config/MongoDBConnect.js";
import userRoutes from "./routes/userRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import chatsRoutes from "./routes/chatsRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import userInterestRoutes from "./routes/userIntrested.js";
import ratingRoutes from "./routes/ratingRoutes.js";
import orderRoutes from "./routes/ordersRoutes.js"
import couponRoutes from "./routes/couponRoutes.js";
import shippingRoutes from "./routes/shippingRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import { shiprocketCron } from "./cron/shiprocketCron.js";

// =======================
// ✅ INITIAL SETUP
// =======================
const app = express();
dotenv.config()
// For ES module __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// =======================
// ✅ MIDDLEWARES
// =======================
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

// =======================
// ✅ STATIC FILE SERVING
// =======================
// This allows access to uploaded product images via URL:
// e.g., http://localhost:5000/uploads/products/filename.jpg
app.use(
  "/uploads/products",
  express.static(path.join(process.cwd(), "uploads", "products"))
);
shiprocketCron()
// =======================
// ✅ ROUTES
// =======================
app.use("/api/auth", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/chats", chatsRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/user-interests', userInterestRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/order', orderRoutes);
app.use("/api/coupon", couponRoutes);
app.use("/api/shipping", shippingRoutes);
app.use("/api/payment", paymentRoutes);



// =======================
// ✅ DATABASE CONNECTION
// =======================
MongoDBConnect();

// =======================
// ✅ SERVER START
// =======================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});
