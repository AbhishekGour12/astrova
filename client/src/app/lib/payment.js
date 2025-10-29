import api from "./api";

export const paymentAPI = {
  createOrder: async (orderData) => {
    try {
      const res = await api.post("/payment/create-order", orderData);
      return res.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to create payment order.");
    }
  },

  verifyPayment: async (data) => {
    try {
      const res = await api.post("/payment/verify", data);
      return res.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Payment verification failed.");
    }
  },
};
