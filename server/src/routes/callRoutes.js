import express from "express";
import {
  startCall,
  acceptCallByAstrologer,
  rejectCallByAstrologer,
  endCallByUser,
  endCallByAstrologer,
  getUserActiveCall,
  getAstrologerActiveCall,
  getCallStatus,
  getZegoToken,
  getCallDetailsWithToken,
  endCall,
  getAstrologerCallHistory,
  getAstrologerWaitingCalls,
  getAstrologerAllPendingCalls
} from "../controllers/callController.js";

import { authMiddleware, onlyUser } from "../middleware/authMiddleware.js";


import crypto from "crypto";
const router = express.Router();

/* ================= USER ROUTES ================= */
router.post("/user/start", authMiddleware, onlyUser, startCall);
router.get("/user/active", authMiddleware, onlyUser, getUserActiveCall);
router.post("/user/end/:callId", authMiddleware, onlyUser, endCallByUser);

/* ================= ASTROLOGER ROUTES ================= */
router.get("/astrologer/waiting/:astrologerId", getAstrologerWaitingCalls);
router.get("/astrologer/pending/:astrologerId", getAstrologerAllPendingCalls);
router.post("/astrologer/accept/:callId/:astrologerId", acceptCallByAstrologer);
router.post("/astrologer/reject/:callId/:astrologerId", rejectCallByAstrologer);
router.get("/astrologer/active/:astrologerId", getAstrologerActiveCall);
router.post("/astrologer/end/:callId/:astrologerId", endCallByAstrologer);
router.get("/astrologer/history", getAstrologerCallHistory)

/* ================= SHARED ================= */
router.get("/status/:callId", getCallStatus);
router.post("/token", getZegoToken); // For generating Zego tokens
router.get("/details/:callId", getCallDetailsWithToken); // Get call details with Zego token

// Utility endpoint for system to end calls
router.post("/end/:callId", async (req, res) => {
  const { callId } = req.params;
  const { endedBy } = req.body;
  
  await endCall(callId, endedBy);
  res.json({ success: true });
});
// In your backend, add this endpoint:
// routes/call.js
router.post('/zego-token', async (req, res) => {
  try {
    const { roomId, userId, userName } = req.body;
    
    if (!roomId || !userId) {
      return res.status(400).json({
        success: false,
        message: "Room ID and User ID required"
      });
    }

    // Generate Zego token (use proper method)
    const token = generateZegoToken({
      appId: Number(process.env.ZEGO_APP_ID || "1531051351"),
      serverSecret: process.env.ZEGO_SERVER_SECRET || "1514a5e9c7fadddfbf79230b40e58b7b",
      roomId: roomId,
      userId: userId,
      userName: userName || `User_${userId}`
    });

    res.json({
      success: true,
      appId: Number(process.env.ZEGO_APP_ID),
      token: token, // MUST be a string
      roomId: roomId,
      userId: userId,
      userName: userName || `User_${userId}`
    });
  } catch (err) {
    console.error("Zego token error:", err);
    res.status(500).json({ 
      success: false, 
      message: "Failed to generate Zego token" 
    });
  }
});

// Token generation function
function generateZegoToken({ appId, serverSecret, userId, roomId, userName }) {
  const payload = {
    app_id: appId,
    user_id: userId,
    room_id: roomId,
    privilege: {
      1: 1, // Login room
      2: 1  // Publish stream
    },
    nonce: Math.floor(Math.random() * 1000000),
    ctime: Math.floor(Date.now() / 1000),
    expire: 3600, // 1 hour
  };

  const payloadStr = JSON.stringify(payload);
  const base64Payload = Buffer.from(payloadStr).toString('base64');
  
  const signature = crypto
    .createHmac('sha256', serverSecret)
    .update(base64Payload)
    .digest('hex');

  // Return format: base64Payload.signature
  return `${base64Payload}.${signature}`;
}
export default router;