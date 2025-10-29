import api from "./api";

export const chatAPI = {
  startChat: async (data) => {
    try {
      const res = await api.post("/chat/start", data);
      return res.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to start chat.");
    }
  },

  getUserChats: async (userId) => {
    try {
      const res = await api.get(`/chat/user/${userId}`);
      return res.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to load chats.");
    }
  },

  sendMessage: async (messageData) => {
    try {
      const res = await api.post("/chat/message/send", messageData);
      return res.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to send message.");
    }
  },

  getMessages: async (chatId) => {
    try {
      const res = await api.get(`/chat/message/${chatId}`);
      return res.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to fetch messages.");
    }
  },
};
