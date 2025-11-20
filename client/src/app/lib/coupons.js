import api from "./api"; // your axios instance

export const couponAPI = {

    // -------------------- GET ALL COUPONS --------------------
    getAll: async () => {
        try {
            const res = await api.get("/coupon");
            return res.data;
        } catch (err) {
            throw new Error(err.response?.data?.message || "Failed to fetch coupons");
        }
    },

    // -------------------- CREATE COUPON --------------------
    create: async (data) => {
        try {
            const res = await api.post("/coupon", data);
            return res.data;
        } catch (err) {
            throw new Error(err.response?.data?.message || "Failed to create coupon");
        }
    },

    // -------------------- UPDATE COUPON --------------------
    update: async (id, data) => {
        try {
            const res = await api.patch(`/coupon/${id}`, data);
            return res.data;
        } catch (err) {
            throw new Error(err.response?.data?.message || "Failed to update coupon");
        }
    },

    // -------------------- DELETE COUPON --------------------
    delete: async (id) => {
        try {
            const res = await api.delete(`/coupon/${id}`);
            return res.data;
        } catch (err) {
            throw new Error(err.response?.data?.message || "Failed to delete coupon");
        }
    },

    // -------------------- TOGGLE ACTIVE/INACTIVE --------------------
    toggleStatus: async (id) => {
        try {
            const res = await api.patch(`/coupon/toggle/${id}`);
            return res.data;
        } catch (err) {
            throw new Error(err.response?.data?.message || "Failed to update status");
        }
    },
    // Apply coupon in checkout (User)
  applyCoupon: async (code, subtotal) => {
    try {
      const res = await api.post("/coupon/apply", { code, subtotal });
      return res.data; // contains discount & final amount
    } catch (error) {
      const msg = error.response?.data?.message || "Invalid coupon";
      throw new Error(msg);
    }
}

};
