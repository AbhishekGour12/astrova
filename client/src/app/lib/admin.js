import api from "./api";
export const adminAPI = {
    // --- 1. Dashboard & Reports ---
    getDashboardStats: async () => {
        try {
            const response = await api.get('/admin/stats');
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to fetch dashboard stats.';
            throw new Error(errorMessage);
        }
    },

    // --- 2. User Management ---
    getAllUsers: async () => {
        try {
            const response = await api.get('/admin/users');
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to fetch users.';
            throw new Error(errorMessage);
        }
    },
    deleteUser: async (id) => {
        try {
            const response = await api.delete(`/admin/users/${id}`);
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to delete user.';
            throw new Error(errorMessage);
        }
    },

    // --- 3. Astrologer Management ---
    getAllAstrologers: async () => {
        try {
            const response = await api.get('/admin/astrologers');
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to fetch astrologers.';
            throw new Error(errorMessage);
        }
    },
    approveAstrologer: async (id) => {
        try {
            const response = await api.patch(`/admin/astrologers/approve/${id}`);
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to approve astrologer.';
            throw new Error(errorMessage);
        }
    },
    deleteAstrologer: async (id) => {
        try {
            const response = await api.delete(`/admin/astrologers/${id}`);
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to delete astrologer.';
            throw new Error(errorMessage);
        }
    },
 createProduct: async (data) => {
    try {
      const res = await api.post("/admin/product", data);
      return res.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to create product.");
    }
  },

  getProducts: async (filters = {}) => {
    try {
      
     
    const params = new URLSearchParams(filters).toString();
    const res = await api.get(`/admin/product?${params}`);
    return res.data;

    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to load products.");
    }
  },
    // --- 4. Product Management ---
   
     updateProduct: async (id, data) => {
    try {
      const res = await api.put(`admin/product/${id}`, data);
      return res.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to update product.");
    }
  },

  getProductTypes: async () =>{
    try{
    const res = await api.get('/admin/types');
    return res.data;
    }catch(error){
      throw new Error(error.response?.data?.message || "Failed to load product types.");
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

    // --- 5. Order Management ---
    getAllOrders: async () => {
        try {
            const response = await api.get('/admin/orders');
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to fetch orders.';
            throw new Error(errorMessage);
        }
    },
    updateOrderStatus: async (id, status) => {
        try {
            const response = await api.patch(`/admin/orders/${id}`, { status });
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to update order status.';
            throw new Error(errorMessage);
        }
    },

    // --- 6. Payment & Chat Management ---
    getAllPayments: async () => {
        try {
            const response = await api.get('/admin/payments');
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to fetch payment records.';
            throw new Error(errorMessage);
        }
    },
    getAllChats: async () => {
        try {
            const response = await api.get('/admin/chats');
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to fetch chat logs.';
            throw new Error(errorMessage);
        }
    },
    deleteChat: async (id) => {
        try {
            const response = await api.delete(`/admin/chats/${id}`);
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to delete chat thread.';
            throw new Error(errorMessage);
        }
    },

    // --- 7. Admin Role Management ---
    addSubAdmin: async (adminData) => {
        try {
            const response = await api.post('/admin/add-admin', adminData);
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to add sub-admin.';
            throw new Error(errorMessage);
        }
    },
    deleteSubAdmin: async (id) => {
        try {
            const response = await api.delete(`/admin/admins/${id}`);
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to delete admin.';
            throw new Error(errorMessage);
        }
    }
}
