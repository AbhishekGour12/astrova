import api from "./api";

export const orderAPI = {
    createOrder: async(formData) =>{
        const response = await api.post("/order", formData, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
    return response.data;
    },
   getUserOrders: async () => {
    const res = await api.get("/order");
    return res.data;
  },

  getOrderDetail: async (id) => {
    const res = await api.get(`/order/${id}`);
    return res.data;
  },

  trackOrder: async (shipmentId) => {
    console.log((shipmentId))
    const res = await api.get(`/shipping/track/${shipmentId}`);
    return res.data;
  },
};
