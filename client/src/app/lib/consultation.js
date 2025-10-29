import api from "./api";

export const consultationAPI = {
  createPackage: async (data) => {
    try {
      const res = await api.post("/consultation/package", data);
      return res.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to create package.");
    }
  },

  getPackages: async () => {
    try {
      const res = await api.get("/consultation/package");
      return res.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to load packages.");
    }
  },

  bookConsultation: async (data) => {
    try {
      const res = await api.post("/consultation/book", data);
      return res.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to book consultation.");
    }
  },

  getBookings: async (userId) => {
    try {
      const res = await api.get(`/consultation/booking/${userId}`);
      return res.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to load bookings.");
    }
  },
};
