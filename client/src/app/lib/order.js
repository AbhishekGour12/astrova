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
    const res = await api.get("/order/my-orders");
    return res.data;
  },

  getOrderDetail: async (id) => {
    const res = await api.get(`/order/${id}`);
    return res.data;
  },

  trackOrder: async (shipmentId) => {
    const res = await api.get(`/shiprocket/track/${shipmentId}`);
    return res.data;
  },
};
