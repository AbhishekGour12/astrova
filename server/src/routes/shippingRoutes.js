import express from "express";
import { shippingCharge } from "../controllers/shippingController.js";


const router = express.Router();

router.post("/charge", shippingCharge);

export default router;
