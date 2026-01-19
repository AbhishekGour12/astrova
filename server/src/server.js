import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import http from "http";
import { fileURLToPath } from "url";

import MongoDBConnect from "./config/MongoDBConnect.js";
import { initSocket } from "./services/socket.js";
import { shiprocketCron } from "./cron/shiprocketCron.js";

/* =======================
   ROUTES
======================= */
import userRoutes from "./routes/userRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import chatRoutes from "./routes/chatsRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import userInterestRoutes from "./routes/userIntrested.js";
import ratingRoutes from "./routes/ratingRoutes.js";
import orderRoutes from "./routes/ordersRoutes.js";
import couponRoutes from "./routes/couponRoutes.js";
import shippingRoutes from "./routes/shippingRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import remedyRoutes from "./routes/remedyRoutes.js";
import astrologerRoutes from "./routes/astrologerRoutes.js";
import callRoutes from "./routes/callRoutes.js"
import payoutRoutes from "./routes/payoutRoutes.js"
import reviewRoutes from "./routes/reviewRoutes.js"
import adminPayoutRoutes from "./routes/adminPayoutRoutes.js"
import contactRoutes from "./routes/contactRoutes.js"
/* =======================
   INITIAL SETUP
======================= */
dotenv.config();
const app = express();
const server = http.createServer(app);

/* =======================
   SOCKET.IO INIT
======================= */
const io = initSocket(server);
// Attach io to app for access in controllers
app.set("io", io);



/* =======================
   ES MODULE DIR FIX
======================= */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* =======================
   GLOBAL MIDDLEWARES
======================= */
app.use(cors());



app.use(express.json());
app.use(express.urlencoded({ extended: true }));


/* =======================
   STATIC FILES
======================= */
app.use(
  "/uploads/products",
  express.static(path.join(process.cwd(), "uploads", "products"))
);

/* =======================
   ROUTES
======================= */
app.use("/api/auth", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/user-interests", userInterestRoutes);
app.use("/api/ratings", ratingRoutes);
app.use("/api/order", orderRoutes);
app.use("/api/coupon", couponRoutes);
app.use("/api/shipping", shippingRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/remedy", remedyRoutes);
app.use("/api/astrologer", astrologerRoutes);
app.use("/api/call", callRoutes);
app.use("/api/payouts", payoutRoutes)
app.use("/api/reviews", reviewRoutes)
app.use("/api/admin-payout/astrologerpayouts", adminPayoutRoutes)
app.use("/api/contact", contactRoutes)
/* =======================
   HEALTH CHECK
======================= */
app.get("/health", (req, res) => {
  res.json({
    success: true,
    status: "OK",
    uptime: process.uptime(),
    timestamp: new Date(),
  });
});

/* =======================
   ERROR HANDLER
======================= */
app.use((err, req, res, next) => {
  console.error("❌ Server Error:", err.stack);
  res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
});

/* =======================
   DB + CRON + SERVER START
======================= */
MongoDBConnect();
shiprocketCron();

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
