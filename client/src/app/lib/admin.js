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

    // --- 4. Product Management ---
    addProduct: async (productData) => {
        try {
            const response = await api.post('/admin/products', productData);
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to add product.';
            throw new Error(errorMessage);
        }
    },
    updateProduct: async (id, productData) => {
        try {
            const response = await api.put(`/admin/products/${id}`, productData);
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to update product.';
            throw new Error(errorMessage);
        }
    },
    deleteProduct: async (id) => {
        try {
            const response = await api.delete(`/admin/products/${id}`);
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to delete product.';
            throw new Error(errorMessage);
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
