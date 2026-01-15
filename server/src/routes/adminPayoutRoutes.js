// routes/payoutRoutes.js
import express from "express";
import {
  getAstrologersWithUnpaidEarnings,
  processManualPayout,
  getAstrologerPayoutHistory,
  getPayoutDetails,
  generateWeeklyPayoutReport,
  bulkProcessPayouts
} from "../controllers/adminPayoutController.js";

const router = express.Router();

// Protected routes - only for admin


// Get astrologers with unpaid earnings
router.get("/astrologers/unpaid", getAstrologersWithUnpaidEarnings);

// Process manual payout
router.post("/process/manual", processManualPayout);

// Get astrologer payout history
router.get("/history/:astrologerId", getAstrologerPayoutHistory);

// Get payout details
router.get("/details/:payoutId", getPayoutDetails);

// Generate weekly report
router.get("/report/weekly", generateWeeklyPayoutReport);

// Bulk process payouts
router.post("/bulk/process", bulkProcessPayouts);

export default router;