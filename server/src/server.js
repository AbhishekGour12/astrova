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

// =======================
// ✅ INITIAL SETUP
// =======================
dotenv.config();
const app = express();

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

// =======================
// ✅ ROUTES
// =======================
app.use("/api/auth", userRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/chats", chatsRoutes);

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
