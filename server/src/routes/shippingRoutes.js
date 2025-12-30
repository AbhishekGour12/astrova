import express from "express";
import { shippingCharge } from "../controllers/shippingController.js";

import { authMiddleware, onlyUser } from "../middleware/authMiddleware.js";
import { trackUserOrder } from "../controllers/orderController.js";


const router = express.Router();
router.use(authMiddleware, onlyUser)
router.post("/charge", shippingCharge);
router.get("/track/:shipmentId", trackUserOrder );

export default router;
