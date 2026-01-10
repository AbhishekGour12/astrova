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
    
    const payouts = await Payout.find({ astrologer: astrologerId })
      .sort({ createdAt: -1 })
      .limit(20);
    
    const currentDate = new Date();
    const oneWeekAgo = new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    // Get weekly earnings data
    const weeklyEarnings = await AstrologerEarning.aggregate([
      {
        $match: {
          astrologer: new mongoose.Types.ObjectId(astrologerId),
          isPaid: false,
          createdAt: { $gte: oneWeekAgo }
        }
      },
      {
        $group: {
          _id: "$serviceType",
          totalAmount: { $sum: "$amount" },
          totalMinutes: { $sum: "$minutes" },
          sessionCount: { $sum: 1 }
        }
      }
    ]);
    
    // Calculate totals
    let totalChatEarnings = 0;
    let totalCallEarnings = 0;
    let totalChatMinutes = 0;
    let totalCallMinutes = 0;
    let totalChatSessions = 0;
    let totalCallSessions = 0;
    
    weeklyEarnings.forEach(earning => {
      if (earning._id === "CHAT") {
        totalChatEarnings = earning.totalAmount;
        totalChatMinutes = earning.totalMinutes;
        totalChatSessions = earning.sessionCount;
      } else if (earning._id === "CALL") {
        totalCallEarnings = earning.totalAmount;
        totalCallMinutes = earning.totalMinutes;
        totalCallSessions = earning.sessionCount;
      }
    });
    
    const totalWeeklyEarnings = totalChatEarnings + totalCallEarnings;
    const totalSessions = totalChatSessions + totalCallSessions;
    
    // Get astrologer's balance info
    const astrologer = await Astrologer.findById(astrologerId)
      .select("totalEarnings pendingEarnings paidEarnings razorpayFundAccountId");
    
    if (!astrologer) {
      return res.status(404).json({
        success: false,
        message: "Astrologer not found"
      });
    }
    
    res.status(200).json({
      success: true,
      payouts,
      balance: astrologer.pendingEarnings || 0,
      totalEarnings: astrologer.totalEarnings || 0,
      paidEarnings: astrologer.paidEarnings || 0,
      weeklyStats: {
        totalEarnings: totalWeeklyEarnings,
        totalSessions,
        chat: {
          earnings: totalChatEarnings,
          minutes: totalChatMinutes,
          sessions: totalChatSessions
        },
        call: {
          earnings: totalCallEarnings,
          minutes: totalCallMinutes,
          sessions: totalCallSessions
        }
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
    
    // Get astrologer with fund account
    const astrologer = await Astrologer.findById(astrologerId);
    
    if (!astrologer) {
      return res.status(404).json({
        success: false,
        message: "Astrologer not found"
      });
    }
    
    if (!astrologer.razorpayFundAccountId) {
      return res.status(400).json({
        success: false,
        message: "Bank account not linked"
      });
    }
    
    // Get unpaid earnings
    const oneWeekAgo = new Date(new Date().getTime() - 7 * 24 * 60 * 60 * 1000);
    
    const unpaidEarnings = await AstrologerEarning.find({
      astrologer: astrologerId,
      isPaid: false,
      createdAt: { $gte: oneWeekAgo }
    });
    
    if (unpaidEarnings.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No earnings available for payout"
      });
    }
    
    // Calculate totals
    const totalAmount = unpaidEarnings.reduce((sum, earning) => sum + earning.amount, 0);
    const chatEarnings = unpaidEarnings.filter(e => e.serviceType === "CHAT");
    const callEarnings = unpaidEarnings.filter(e => e.serviceType === "CALL");
    
    // Create payout in RazorpayX
    const payoutData = {
      account_number: "2323230041764445", // Your RazorpayX account number
      fund_account_id: astrologer.razorpayFundAccountId,
      amount: totalAmount * 100, // Convert to paise
      currency: "INR",
      mode: "IMPS",
      purpose: "payout",
      queue_if_low_balance: true,
      reference_id: `PAYOUT_${Date.now()}_${astrologerId}`,
      notes: {
        astrologerId: astrologerId,
        astrologerName: astrologer.fullName,
        weekStart: oneWeekAgo.toISOString(),
        weekEnd: new Date().toISOString()
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
    
    // Create payout record in database
    const payout = new Payout({
      astrologer: astrologerId,
      payoutId: razorpayPayout.id,
      amount: totalAmount,
      status: razorpayPayout.status,
      method: "bank_transfer",
      purpose: "payout",
      mode: "IMPS",
      referenceId: razorpayPayout.reference_id,
      utr: razorpayPayout.utr,
      fees: razorpayPayout.fees ? razorpayPayout.fees / 100 : 0,
      tax: razorpayPayout.tax ? razorpayPayout.tax / 100 : 0,
      payoutType: "WEEKLY",
      weekStartDate: oneWeekAgo,
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
        accountNumber: astrologer.bankAccountNumber.slice(-4)
      }
    });
    
    await payout.save();
    
    // Mark earnings as paid
    await AstrologerEarning.updateMany(
      {
        astrologer: astrologerId,
        isPaid: false,
        createdAt: { $gte: oneWeekAgo }
      },
      { isPaid: true }
    );
    
    // Update astrologer's earnings
    astrologer.pendingEarnings = Math.max(0, (astrologer.pendingEarnings || 0) - totalAmount);
    astrologer.paidEarnings = (astrologer.paidEarnings || 0) + totalAmount;
    await astrologer.save();
    
    res.status(200).json({
      success: true,
      message: "Payout initiated successfully",
      payout: payout,
      payoutId: razorpayPayout.id
    });
    
  } catch (error) {
    console.error("Initiate payout error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to initiate payout"
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