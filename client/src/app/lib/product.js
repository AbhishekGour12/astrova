import api from "./api";

export const productAPI = {
  createProduct: async (data) => {
    try {
      const res = await api.post("/product", data);
      return res.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to create product.");
    }
  },

  getProducts: async () => {
    try {
      const res = await api.get("/product");
      return res.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to load products.");
    }
  },

  getProductById: async (id) => {
    try {
      const res = await api.get(`/product/${id}`);
      return res.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to load product.");
    }
  },

  updateProduct: async (id, data) => {
    try {
      const res = await api.put(`/product/${id}`, data);
      return res.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to update product.");
    }
  },

  deleteProduct: async (id) => {
    try {
      const res = await api.delete(`/product/${id}`);
      return res.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to delete product.");
    }
  },
};
