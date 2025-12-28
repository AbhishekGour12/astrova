import api from "./api";

export const chatAPI = {
  /* ================= USER ================= */

  startChat: async (astrologerId) => {
    const res = await api.post("/chat/start", { astrologerId });
    return res.data;
  },

  getMyChats: async () => {
    const res = await api.get("/chat/my");
    return res.data;
  },

  getMessages: async (chatId) => {
    const res = await api.get(`/chat/messages/${chatId}`);
    return res.data;
  },

  /* ================= ASTROLOGER ================= */

  getAstrologerChats: async () => {
    const astrologerId = localStorage.getItem("astrologerId");
    if (!astrologerId) throw new Error("Astrologer not logged in");

    const res = await api.get(`/chat/astrologer/my/${astrologerId}`);
    return res.data;
  },

  getAstrologerMessages: async (chatId) => {
    const res = await api.get(`/chat/astrologer/messages/${chatId}`);
    return res.data;
  },
};
