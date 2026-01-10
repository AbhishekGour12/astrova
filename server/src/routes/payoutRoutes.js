import express from "express";
import {
  getPayouts,
  initiatePayout,
  getPayoutStatus,
  handlePayoutWebhook
} from "../controllers/payoutController.js";

const router = express.Router();

router.get("/:astrologerId", getPayouts);
router.post("/:astrologerId/initiate", initiatePayout);
router.get("/status/:payoutId", getPayoutStatus);
router.post("/webhooks/razorpayx", handlePayoutWebhook);

export default router;