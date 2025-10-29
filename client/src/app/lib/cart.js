import api from "./api";

export const cartAPI = {
  addToCart: async (data) => {
    try {
      const res = await api.post("/cart/add", data);
      return res.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to add to cart.");
    }
  },

  getCart: async (userId) => {
    try {
      const res = await api.get(`/cart/${userId}`);
      return res.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to fetch cart.");
    }
  },

  removeItem: async (cartItemId) => {
    try {
      const res = await api.delete(`/cart/item/${cartItemId}`);
      return res.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to remove item.");
    }
  },
};
