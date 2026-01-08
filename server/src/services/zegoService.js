import crypto from "crypto";

export function generateZegoToken({
  appId,
  serverSecret,
  userId,
  roomId,
  userName,
  expire = 3600 // 1 hour
}) {
  // Payload structure for Zego
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
    expire: expire,
  };

  try {
    // Convert to JSON
    const payloadStr = JSON.stringify(payload);
    
    // Base64 encode
    const base64Payload = Buffer.from(payloadStr).toString('base64');
    
    // Generate signature
    const signature = crypto
      .createHmac('sha256', serverSecret)
      .update(base64Payload)
      .digest('hex');

    // Return token format: base64Payload.signature
    return `${base64Payload}.${signature}`;
  } catch (error) {
    console.error("Zego token generation error:", error);
    throw new Error("Failed to generate Zego token");
  }
}

// Helper to generate kit token for frontend
export function generateKitToken({
  appId,
  serverSecret,
  roomId,
  userId,
  userName
}) {
  const token = generateZegoToken({
    appId,
    serverSecret,
    roomId,
    userId,
    userName
  });

  return {
    appID: appId,
    serverSecret: serverSecret,
    roomID: roomId,
    userID: userId,
    userName: userName,
    token: token
  };
}