import jwt from "jsonwebtoken";
import { randomUUID } from "crypto";
import axios from "axios";

class HMSService {
  constructor() {
    this.accessKey = process.env.HMS_ACCESS_KEY;
    this.secretKey = process.env.HMS_SECRET_KEY;
    this.templateId = process.env.HMS_TEMPLATE_ID;
    this.baseURL = "https://api.100ms.live/v2";
  }

  /* ================= 1. MANAGEMENT TOKEN (For Room Creation) ================= */
  generateManagementToken() {
    const now = Math.floor(Date.now() / 1000);
    const payload = {
      access_key: this.accessKey,
      type: "management",
      version: 2,
      jti: randomUUID(),
      iat: now,
      exp: now + 3600, // 1 hour
    };
    return jwt.sign(payload, this.secretKey, { algorithm: "HS256" });
  }

  /* ================= 2. JOIN TOKEN (For User/Astro) ================= */
  // Yeh function bina kisi SDK ke 100ms compatible Join Token banayega
  async generateJoinToken({ roomId, userId, role }) {
    try {
      const now = Math.floor(Date.now() / 1000);
      const payload = {
        access_key: this.accessKey,
        room_id: roomId,
        user_id: String(userId),
        role: role,
        type: "app",
        version: 2,
        iat: now,
        nbf: now,
        exp: now + (24 * 60 * 60), // 24 hours
        jti: randomUUID(),
      };

      // 🔥 Signature generation
      return jwt.sign(payload, this.secretKey, { algorithm: "HS256" });
    } catch (error) {
      console.error("Token Error:", error);
      throw error;
    }
  }

  /* ================= 3. CREATE ROOM (Axios Version) ================= */
  async createRoom(roomName) {
    try {
      const token = this.generateManagementToken();
      const res = await axios.post(
        `${this.baseURL}/rooms`,
        {
          name: roomName || `call-${Date.now()}`,
          template_id: this.templateId,
          region: "in",
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      return res.data;
    } catch (error) {
      console.error("Room Creation Error:", error.response?.data || error.message);
      throw error;
    }
  }
}

export default new HMSService();