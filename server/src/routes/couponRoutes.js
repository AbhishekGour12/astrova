import express from "express";
import {
  createCoupon,
  getCoupons,
  getCouponById,
  updateCoupon,
  deleteCoupon,
  toggleCouponStatus,
  validateCoupon,
  applyCoupon,
} from "../controllers/couponController.js";

const router = express.Router();
router.post("/apply", applyCoupon)
router.post("/", createCoupon);
router.get("/", getCoupons);
router.get("/:id", getCouponById);
router.patch("/:id", updateCoupon);
router.delete("/:id", deleteCoupon);
router.patch("/toggle/:id", toggleCouponStatus);

// apply coupon in checkout
router.post("/validate", validateCoupon);

export default router;
