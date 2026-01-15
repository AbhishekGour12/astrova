// controllers/payoutController.js
import AstrologerEarning from "../models/AstrologerEarning.js";
import Astrologer from "../models/Astrologer.js";
import Payout from "../models/Payout.js";

/* ======================================================
   GET ALL ASTROLOGERS WITH UNPAID EARNINGS
====================================================== */
export const getAstrologersWithUnpaidEarnings = async (req, res) => {
  try {
    const { weekStart, weekEnd, search, page = 1, limit = 20 } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build filter for unpaid earnings
    let earningFilter = { isPaid: false };
    
    // Add date filter if provided
    if (weekStart && weekEnd) {
      earningFilter.createdAt = {
        $gte: new Date(weekStart),
        $lte: new Date(weekEnd)
      };
    }

    // Get all unpaid earnings grouped by astrologer
    const earningsAggregation = await AstrologerEarning.aggregate([
      { $match: earningFilter },
      {
        $group: {
          _id: "$astrologer",
          totalAmount: { $sum: "$amount" },
          totalMinutes: { $sum: "$minutes" },
          totalSessions: { $sum: 1 },
          chatSessions: {
            $sum: { $cond: [{ $eq: ["$serviceType", "CHAT"] }, 1, 0] }
          },
          callSessions: {
            $sum: { $cond: [{ $eq: ["$serviceType", "CALL"] }, 1, 0] }
          },
          chatEarnings: {
            $sum: { $cond: [{ $eq: ["$serviceType", "CHAT"] }, "$amount", 0] }
          },
          callEarnings: {
            $sum: { $cond: [{ $eq: ["$serviceType", "CALL"] }, "$amount", 0] }
          },
          earnings: { $push: "$$ROOT" }
        }
      },
      {
        $lookup: {
          from: "astrologers",
          localField: "_id",
          foreignField: "_id",
          as: "astrologerDetails"
        }
      },
      { $unwind: "$astrologerDetails" },
      {
        $project: {
          astrologerId: "$_id",
          astrologerDetails: {
            fullName: "$astrologerDetails.fullName",
            email: "$astrologerDetails.email",
            phone: "$astrologerDetails.phone",
            bankName: "$astrologerDetails.bankName",
            bankAccountNumber: "$astrologerDetails.bankAccountNumber",
            ifsc: "$astrologerDetails.ifsc",
            razorpayContactId: "$astrologerDetails.razorpayContactId",
            razorpayFundAccountId: "$astrologerDetails.razorpayFundAccountId"
          },
          totalAmount: 1,
          totalMinutes: 1,
          totalSessions: 1,
          chatSessions: 1,
          callSessions: 1,
          chatEarnings: 1,
          callEarnings: 1,
          earnings: 1
        }
      },
      { $sort: { totalAmount: -1 } }
    ]);

    // Apply search filter
    let filteredAstrologers = earningsAggregation;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredAstrologers = earningsAggregation.filter(item => 
        item.astrologerDetails.fullName.toLowerCase().includes(searchLower) ||
        item.astrologerDetails.email.toLowerCase().includes(searchLower) ||
        item.astrologerDetails.phone.includes(search)
      );
    }

    // Pagination
    const total = filteredAstrologers.length;
    const paginatedAstrologers = filteredAstrologers.slice(skip, skip + limitNum);

    // Get weekly summary
    const weeklySummary = await getWeeklyUnpaidSummary(weekStart, weekEnd);

    res.json({
      success: true,
      data: {
        astrologers: paginatedAstrologers,
        weeklySummary,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum)
        }
      }
    });
  } catch (error) {
    console.error("Get astrologers with unpaid earnings error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch astrologers data"
    });
  }
};

/* ======================================================
   GET WEEKLY UNPAID SUMMARY
====================================================== */
export const getWeeklyUnpaidSummary = async (weekStart, weekEnd) => {
  try {
    let filter = { isPaid: false };
    
    if (weekStart && weekEnd) {
      filter.createdAt = {
        $gte: new Date(weekStart),
        $lte: new Date(weekEnd)
      };
    } else {
      // Default to last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      filter.createdAt = { $gte: sevenDaysAgo };
    }

    const summary = await AstrologerEarning.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$amount" },
          totalAstrologers: { $addToSet: "$astrologer" },
          totalSessions: { $sum: 1 },
          chatSessions: {
            $sum: { $cond: [{ $eq: ["$serviceType", "CHAT"] }, 1, 0] }
          },
          callSessions: {
            $sum: { $cond: [{ $eq: ["$serviceType", "CALL"] }, 1, 0] }
          },
          chatEarnings: {
            $sum: { $cond: [{ $eq: ["$serviceType", "CHAT"] }, "$amount", 0] }
          },
          callEarnings: {
            $sum: { $cond: [{ $eq: ["$serviceType", "CALL"] }, "$amount", 0] }
          }
        }
      },
      {
        $project: {
          totalAmount: 1,
          totalAstrologers: { $size: "$totalAstrologers" },
          totalSessions: 1,
          chatSessions: 1,
          callSessions: 1,
          chatEarnings: 1,
          callEarnings: 1
        }
      }
    ]);

    return summary[0] || {
      totalAmount: 0,
      totalAstrologers: 0,
      totalSessions: 0,
      chatSessions: 0,
      callSessions: 0,
      chatEarnings: 0,
      callEarnings: 0
    };
  } catch (error) {
    console.error("Weekly summary error:", error);
    return {
      totalAmount: 0,
      totalAstrologers: 0,
      totalSessions: 0,
      chatSessions: 0,
      callSessions: 0,
      chatEarnings: 0,
      callEarnings: 0
    };
  }
};

/* ======================================================
   PROCESS MANUAL PAYOUT
====================================================== */
export const processManualPayout = async (req, res) => {
  try {
    const { astrologerId, amount, earnings, paymentMode, transactionId, paymentDate, notes } = req.body;
    

    // Validate astrologer
    const astrologer = await Astrologer.findById(astrologerId);
    if (!astrologer) {
      return res.status(404).json({
        success: false,
        message: "Astrologer not found"
      });
    }

    // Validate earnings
    const earningDocs = await AstrologerEarning.find({
      _id: { $in: earnings },
      astrologer: astrologerId,
      isPaid: false
    });

    if (earningDocs.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid unpaid earnings found"
      });
    }

    // Calculate total from selected earnings
    const calculatedAmount = earningDocs.reduce((sum, earning) => sum + earning.amount, 0);
    
    if (Math.abs(calculatedAmount - amount) > 1) { // Allow 1 rupee difference
      return res.status(400).json({
        success: false,
        message: "Amount doesn't match selected earnings total"
      });
    }

    // Create payout record
    const payoutId = `PAYOUT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const payout = await Payout.create({
      astrologer: astrologerId,
      payoutId,
      amount,
      currency: "INR",
      status: "MANUAL_PAID",
      method: "bank_transfer",
      mode: paymentMode || "MANUAL",
      referenceId: transactionId,
      payoutType: "MANUAL",
      totalEarnings: amount,
      totalSessions: earningDocs.length,
      chatSessions: earningDocs.filter(e => e.serviceType === "CHAT").length,
      callSessions: earningDocs.filter(e => e.serviceType === "CALL").length,
      chatEarnings: earningDocs.filter(e => e.serviceType === "CHAT")
        .reduce((sum, e) => sum + e.amount, 0),
      callEarnings: earningDocs.filter(e => e.serviceType === "CALL")
        .reduce((sum, e) => sum + e.amount, 0),
      manualPaymentDetails: {
        paymentDate: paymentDate ? new Date(paymentDate) : new Date(),
        paymentMode: paymentMode || "MANUAL",
        transactionId,
        paidBy: "admin",
        notes
      },
      earningIds: earnings,
      adminNotes: notes,
      
      settledAt: new Date()
    });

    // Update earnings as paid
    await AstrologerEarning.updateMany(
      { _id: { $in: earnings } },
      { 
        isPaid: true,
        payoutDate: new Date(),
        payoutBatchId: payoutId,
        notes: `Paid manually via ${paymentMode || "MANUAL"} on ${new Date().toLocaleDateString()}`
      }
    );

    // Update astrologer's earnings
    await Astrologer.findByIdAndUpdate(astrologerId, {
      $inc: {
        paidEarnings: amount,
        pendingEarnings: -amount
      }
    });

    // Fetch updated payout with populated data
    const populatedPayout = await Payout.findById(payout._id)
      .populate("astrologer", "fullName email phone bankName bankAccountNumber ifsc")
      

    res.json({
      success: true,
      message: "Payout processed successfully",
      payout: populatedPayout
    });
  } catch (error) {
    console.error("Process manual payout error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to process payout"
    });
  }
};

/* ======================================================
   GET ASTROLOGER PAYOUT HISTORY
====================================================== */
export const getAstrologerPayoutHistory = async (req, res) => {
  try {
    const { astrologerId } = req.params;
    const { page = 1, limit = 10, startDate, endDate } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build filter
    let filter = { astrologer: astrologerId };
    
    if (startDate && endDate) {
      filter.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const payouts = await Payout.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate("paidByAdmin", "name email")
      .populate("earningIds");

    const total = await Payout.countDocuments(filter);

    res.json({
      success: true,
      data: {
        payouts,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum)
        }
      }
    });
  } catch (error) {
    console.error("Get payout history error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch payout history"
    });
  }
};

/* ======================================================
   GET PAYOUT DETAILS
====================================================== */
export const getPayoutDetails = async (req, res) => {
  try {
    const { payoutId } = req.params;

    const payout = await Payout.findById(payoutId)
      .populate("astrologer", "fullName email phone bankName bankAccountNumber ifsc")
     
      .populate({
        path: "earningIds",
        populate: [
          { path: "user", select: "name email" },
          { path: "chat", select: "startedAt endedAt" },
          { path: "call", select: "startedAt endedAt callType" }
        ]
      });

    if (!payout) {
      return res.status(404).json({
        success: false,
        message: "Payout not found"
      });
    }

    res.json({
      success: true,
      payout
    });
  } catch (error) {
    console.error("Get payout details error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch payout details"
    });
  }
};

/* ======================================================
   GENERATE WEEKLY PAYOUT REPORT
====================================================== */
export const generateWeeklyPayoutReport = async (req, res) => {
  try {
    const { weekStart, weekEnd } = req.query;
    
    if (!weekStart || !weekEnd) {
      return res.status(400).json({
        success: false,
        message: "Week start and end dates are required"
      });
    }

    const startDate = new Date(weekStart);
    const endDate = new Date(weekEnd);

    // Get all unpaid earnings for the week
    const unpaidEarnings = await AstrologerEarning.aggregate([
      {
        $match: {
          isPaid: false,
          createdAt: {
            $gte: startDate,
            $lte: endDate
          }
        }
      },
      {
        $lookup: {
          from: "astrologers",
          localField: "astrologer",
          foreignField: "_id",
          as: "astrologerDetails"
        }
      },
      { $unwind: "$astrologerDetails" },
      {
        $group: {
          _id: "$astrologer",
          astrologerDetails: { $first: "$astrologerDetails" },
          totalAmount: { $sum: "$amount" },
          earnings: { $push: "$$ROOT" }
        }
      },
      { $sort: { totalAmount: -1 } }
    ]);

    // Calculate totals
    const totalAmount = unpaidEarnings.reduce((sum, item) => sum + item.totalAmount, 0);
    const totalAstrologers = unpaidEarnings.length;

    res.json({
      success: true,
      report: {
        weekStart: startDate,
        weekEnd: endDate,
        totalAmount,
        totalAstrologers,
        astrologers: unpaidEarnings,
        generatedAt: new Date()
      }
    });
  } catch (error) {
    console.error("Generate weekly report error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate report"
    });
  }
};

/* ======================================================
   BULK PROCESS PAYOUTS
====================================================== */
export const bulkProcessPayouts = async (req, res) => {
  try {
    const { astrologerIds, weekStart, weekEnd, paymentMode, notes } = req.body;
    const adminId = req.user.id;

    const results = [];
    const errors = [];

    for (const astrologerId of astrologerIds) {
      try {
        // Get all unpaid earnings for this astrologer in the date range
        const earnings = await AstrologerEarning.find({
          astrologer: astrologerId,
          isPaid: false,
          createdAt: {
            $gte: new Date(weekStart),
            $lte: new Date(weekEnd)
          }
        });

        if (earnings.length === 0) {
          errors.push({ astrologerId, error: "No unpaid earnings found" });
          continue;
        }

        const totalAmount = earnings.reduce((sum, earning) => sum + earning.amount, 0);
        const earningIds = earnings.map(e => e._id);

        // Create payout record
        const payoutId = `BULK_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
        
        const payout = await Payout.create({
          astrologer: astrologerId,
          payoutId,
          amount: totalAmount,
          currency: "INR",
          status: "MANUAL_PAID",
          method: "bank_transfer",
          mode: paymentMode || "MANUAL",
          payoutType: "WEEKLY",
          weekStartDate: new Date(weekStart),
          weekEndDate: new Date(weekEnd),
          totalEarnings: totalAmount,
          totalSessions: earnings.length,
          chatSessions: earnings.filter(e => e.serviceType === "CHAT").length,
          callSessions: earnings.filter(e => e.serviceType === "CALL").length,
          chatEarnings: earnings.filter(e => e.serviceType === "CHAT")
            .reduce((sum, e) => sum + e.amount, 0),
          callEarnings: earnings.filter(e => e.serviceType === "CALL")
            .reduce((sum, e) => sum + e.amount, 0),
          manualPaymentDetails: {
            paymentDate: new Date(),
            paymentMode: paymentMode || "MANUAL",
            transactionId: `BULK_${Date.now()}`,
            paidBy: "admin",
            notes
          },
          earningIds,
          adminNotes: `Bulk payment: ${notes}`,
          
          settledAt: new Date()
        });

        // Update earnings
        await AstrologerEarning.updateMany(
          { _id: { $in: earningIds } },
          { 
            isPaid: true,
            payoutDate: new Date(),
            payoutBatchId: payoutId,
            notes: `Bulk paid via ${paymentMode || "MANUAL"} on ${new Date().toLocaleDateString()}`
          }
        );

        // Update astrologer
        await Astrologer.findByIdAndUpdate(astrologerId, {
          $inc: {
            paidEarnings: totalAmount,
            pendingEarnings: -totalAmount
          }
        });

        results.push({
          astrologerId,
          payoutId: payout.payoutId,
          amount: totalAmount,
          success: true
        });
      } catch (error) {
        errors.push({ astrologerId, error: error.message });
      }
    }

    res.json({
      success: true,
      message: `Processed ${results.length} payouts, ${errors.length} failed`,
      results,
      errors
    });
  } catch (error) {
    console.error("Bulk process payouts error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to process bulk payouts"
    });
  }
};