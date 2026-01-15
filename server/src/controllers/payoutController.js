import Payout from "../models/Payout.js";
import Astrologer from "../models/Astrologer.js";
import AstrologerEarning from "../models/AstrologerEarning.js";
import mongoose from "mongoose";
import axios from "axios";


const razorpayX = axios.create({
  baseURL: "https://api.razorpay.com/v1",
  auth: {
    username: process.env.RAZORPAY_KEY || "rzp_test_RwXcLi65KXy3eV" ,
    password: process.env.RAZORPAY_SECRET || "QMecJwhjnGFqqSfRr1dcfieJ",
  },
  headers: {
    "Content-Type": "application/json",
  },
});

export const getPayouts = async (req, res) => {
  try {
    const { astrologerId } = req.params;
    
    // 1. Get History (Past Payouts)
    const payouts = await Payout.find({ astrologer: astrologerId })
      .sort({ createdAt: -1 })
      .limit(20);
    
    // 2. Get "Ready to Payout" (All Unpaid Earnings)
    // We aggregate EVERYTHING that is isPaid: false
    const unpaidStats = await AstrologerEarning.aggregate([
      {
        $match: {
          astrologer: new mongoose.Types.ObjectId(astrologerId),
          isPaid: false 
        }
      },
      {
        $group: {
          _id: "$serviceType", // Group by CHAT or CALL
          totalAmount: { $sum: "$amount" },
          totalMinutes: { $sum: "$minutes" },
          sessionCount: { $sum: 1 }
        }
      }
    ]);
    
    // Process Aggregation Results
    let pendingAmount = 0;
    let chat = { earnings: 0, minutes: 0, sessions: 0 };
    let call = { earnings: 0, minutes: 0, sessions: 0 };

    unpaidStats.forEach(stat => {
      pendingAmount += stat.totalAmount;
      if (stat._id === "CHAT") {
        chat.earnings = stat.totalAmount;
        chat.minutes = stat.totalMinutes;
        chat.sessions = stat.sessionCount;
      } else if (stat._id === "CALL") {
        call.earnings = stat.totalAmount;
        call.minutes = stat.totalMinutes;
        call.sessions = stat.sessionCount;
      }
    });

    res.status(200).json({
      success: true,
      payouts: payouts, // Array of past payouts
      unpaidBalance: pendingAmount, // Amount ready for next week
      stats: {
        chat,
        call,
        totalSessions: chat.sessions + call.sessions
      }
    });
    
  } catch (error) {
    console.error("Get payouts error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch payouts"
    });
  }
};

export const initiatePayout = async (req, res) => {
  try {
    const { astrologerId } = req.params;

    // Get astrologer
    const astrologer = await Astrologer.findById(astrologerId);
    
    if (!astrologer) {
      return res.status(404).json({ success: false, message: "Astrologer not found" });
    }

    if (!astrologer.razorpayFundAccountId) {
      return res.status(400).json({ success: false, message: "Bank account not linked" });
    }

    // Get unpaid earnings
    const unpaidEarnings = await AstrologerEarning.find({
      astrologer: astrologerId,
      isPaid: false
    });

    if (unpaidEarnings.length === 0) {
      return res.status(400).json({ success: false, message: "No earnings available for payout" });
    }

    // Calculate totals
    const totalAmount = unpaidEarnings.reduce((sum, earning) => sum + earning.amount, 0);
    const chatEarnings = unpaidEarnings.filter(e => e.serviceType === "CHAT");
    const callEarnings = unpaidEarnings.filter(e => e.serviceType === "CALL");

    // ✅ FIXED: Shortened Reference ID to stay under 40 chars
    // Logic: "PAY_" (4) + Last 10 chars of ID (10) + "_" (1) + Timestamp (13) = 28 chars
    const shortId = astrologerId.toString().slice(-10);
    const uniqueReferenceId = `PAY_${shortId}_${Date.now()}`;

    // Create payout in RazorpayX
    const payoutData = {
      account_number: "2323230070422060", // Your RazorpayX account number
      fund_account_id: astrologer.razorpayFundAccountId,
      amount: Math.round(totalAmount * 100), // Convert to paise
      currency: "INR",
      mode: "IMPS",
      purpose: "payout",
      queue_if_low_balance: true,
      reference_id: uniqueReferenceId,
      notes: {
        astrologerId: astrologerId, // Full ID is still safe in notes
        astrologerName: astrologer.fullName.substring(0, 30) // Truncate name just in case
      }
    };

    let razorpayPayout;
    try {
      const response = await razorpayX.post("/payouts", payoutData);
      razorpayPayout = response.data;
    } catch (razorpayError) {
      console.error("Razorpay payout error:", razorpayError.response?.data);
      return res.status(500).json({
        success: false,
        message: razorpayError.response?.data?.error?.description || "Payout initiation failed"
      });
    }

    // --- DATABASE UPDATES ---
    try {
        const payout = new Payout({
          astrologer: astrologerId,
          payoutId: razorpayPayout.id,
          amount: totalAmount,
          status: razorpayPayout.status,
          method: "bank_transfer",
          purpose: "payout",
          mode: "IMPS",
          referenceId: razorpayPayout.reference_id,
          utr: razorpayPayout.utr || null, 
          fees: razorpayPayout.fees ? razorpayPayout.fees / 100 : 0,
          tax: razorpayPayout.tax ? razorpayPayout.tax / 100 : 0,
          payoutType: "WEEKLY",
          weekEndDate: new Date(),
          totalEarnings: totalAmount,
          totalSessions: unpaidEarnings.length,
          chatSessions: chatEarnings.length,
          callSessions: callEarnings.length,
          chatEarnings: chatEarnings.reduce((sum, e) => sum + e.amount, 0),
          callEarnings: callEarnings.reduce((sum, e) => sum + e.amount, 0),
          notes: {
            astrologerName: astrologer.fullName,
            bankName: astrologer.bankName,
            accountNumber: astrologer.bankAccountNumber ? astrologer.bankAccountNumber.slice(-4) : "XXXX"
          }
        });

        await payout.save();

        const earningIds = unpaidEarnings.map(e => e._id);
        await AstrologerEarning.updateMany(
          { _id: { $in: earningIds } },
          { isPaid: true }
        );

        astrologer.pendingEarnings = Math.max(0, (astrologer.pendingEarnings || 0) - totalAmount);
        astrologer.paidEarnings = (astrologer.paidEarnings || 0) + totalAmount;
        await astrologer.save();

        res.status(200).json({
          success: true,
          message: "Payout initiated successfully",
          payout: payout,
          payoutId: razorpayPayout.id
        });

    } catch (dbError) {
      console.log(dbError.message)
        console.error("CRITICAL ERROR: Money sent but DB update failed!", dbError);
        console.error("Razorpay Payout ID:", razorpayPayout.id);
        return res.status(500).json({
            success: false,
            message: "Payout processed but database update failed. Please contact admin.",
            error: dbError.message
        });
    }

  } catch (error) {
    console.error("Initiate payout error:", error); 
    res.status(500).json({
      success: false,
      message: "Failed to initiate payout",
      error: error.message
    });
  }
};

export const getPayoutStatus = async (req, res) => {
  try {
    const { payoutId } = req.params;
    
    const payout = await Payout.findOne({ payoutId });
    
    if (!payout) {
      return res.status(404).json({
        success: false,
        message: "Payout not found"
      });
    }
    
    // Get latest status from Razorpay
    try {
      const response = await razorpayX.get(`/payouts/${payoutId}`);
      const razorpayData = response.data;
      
      // Update status if changed
      if (payout.status !== razorpayData.status) {
        payout.status = razorpayData.status;
        payout.utr = razorpayData.utr;
        payout.fees = razorpayData.fees ? razorpayData.fees / 100 : 0;
        payout.tax = razorpayData.tax ? razorpayData.tax / 100 : 0;
        
        if (razorpayData.settled_at) {
          payout.settledAt = new Date(razorpayData.settled_at * 1000);
        }
        
        await payout.save();
      }
      
      res.status(200).json({
        success: true,
        payout: payout,
        razorpayStatus: razorpayData
      });
      
    } catch (razorpayError) {
      // Return local data if Razorpay API fails
      res.status(200).json({
        success: true,
        payout: payout,
        note: "Using cached data"
      });
    }
    
  } catch (error) {
    console.error("Get payout status error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to get payout status"
    });
  }
};

// Webhook handler for RazorpayX payout updates
export const handlePayoutWebhook = async (req, res) => {
  try {
    const event = req.body;
    
    // Verify webhook signature (important for production)
    // const razorpaySignature = req.headers["x-razorpay-signature"];
    
    if (event.event === "payout.processed" || event.event === "payout.reversed" || event.event === "payout.failed") {
      const payoutId = event.payload.payout.entity.id;
      
      const payout = await Payout.findOne({ payoutId });
      if (payout) {
        payout.status = event.payload.payout.entity.status.toUpperCase();
        payout.utr = event.payload.payout.entity.utr;
        payout.fees = event.payload.payout.entity.fees ? event.payload.payout.entity.fees / 100 : 0;
        payout.tax = event.payload.payout.entity.tax ? event.payload.payout.entity.tax / 100 : 0;
        
        if (event.payload.payout.entity.settled_at) {
          payout.settledAt = new Date(event.payload.payout.entity.settled_at * 1000);
        }
        
        await payout.save();
      }
    }
    
    res.status(200).json({ success: true });
    
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(500).json({ success: false });
  }
};