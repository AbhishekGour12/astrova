import api from "./api";

export const productAPI = {
  

  getProducts: async (filters = {}) => {
    try {
      
     
    const params = new URLSearchParams(filters).toString();
    const res = await api.get(`auth/product?${params}`);
    return res.data;

    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to load products.");
    }
  },
   getProductTypes: async () =>{
    try{
    const res = await api.get('auth/product/type');
    return res.data;
    }catch(error){
      throw new Error(error.response?.data?.message || "Failed to load product types.");
    }
  },
  getProductById: async (id) => {
    try {
      const res = await api.get(`/auth/product/${id}`);
      return res.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || "Failed to load product.");
    }
  },

  // Cart method
  getCart: async () => {
  const response = await api.get('/cart', {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  return response.data;
},

 addToCart: async (productId, quantity) => {
  const response = await api.post('/cart', {productId, quantity}, {
   
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
   
  });
  return response.data;
},

updateCartItem: async (itemId, quantity) => {
  const response = await api.put(`/cart/${itemId}`, {quantity}, {
   
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
   
  });
  return response.data;
},

 removeFromCart: async (itemId) => {
  const response = await api.delete(`/cart/${itemId}`, {
   
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  return response.data;
},

// User Interest methods
 addUserInterest: async (productId) => {
  const response = await api.post('/user-interests', {productId: productId},{
  
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    
  });
  return response.data;
},

 removeUserInterest: async (productId) => {
  const response = await api.delete(`/user-interests/${productId}`, {
    
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  return response.data;
},

checkUserInterest: async (productId) => {
  const response = await api.get(`/user-interests/${productId}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  return response.data;
},

// Rating methods
submitRating: async(productId, rating, review = '') => {
  const response = await api.post(`/ratings/product/${productId}`, {
    
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify({ rating, review })
  });
  return response.json();
},

 getProductRatings: async (productId) => {
  const response = await api.get(`/ratings/product/${productId}`);
  return response.json();
},


getShippingCharges: async (data) =>{
  const response = await api.post("/shipping/charge", data);
  return response.data;
}




  

   
  
};
