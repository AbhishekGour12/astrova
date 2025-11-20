'use client';

import { Provider, useDispatch } from 'react-redux';
import toast, { Toaster } from 'react-hot-toast';
import { store } from './store/store';
import { productsType } from './store/features/productTypeSlice';
import { useEffect } from 'react';
import { adminAPI } from './lib/admin';
import { authAPI } from './lib/auth';
import { loginSuccess } from './store/features/authSlice';



// ✅ Safe and silent user auth initialization
 function Product(){
  const dispatch = useDispatch()

  useEffect(() =>{
    const fetchProductType = async () =>{
      try{
        const response = await adminAPI.getProductTypes();
         dispatch(productsType(response))
        console.log(response)
        const token = localStorage.getItem('token');
    if (!token) return;

    const fetchUser = async () => {
      try {
        const res = await authAPI.getProfile(token);
      

        if (res?.data) {
          console.log('✅ Logged-in user loaded:', res.data);
          dispatch(loginSuccess(res.data));
        } else {
          // If backend didn't send valid user, clear token
          localStorage.removeItem('token');
          console.warn('⚠️ Invalid user response, token cleared');
          router.push('/Login')
        }
      } catch (err) {
        // Detect if token expired or unauthorized
        const status = err?.response?.status;
        const backendMsg = err?.response?.data?.message;
        const msg = backendMsg || err?.message || 'Unknown error';

        // 🔹 Handle expired/invalid token
        if (status === 401 || msg.toLowerCase().includes('expired')) {
          localStorage.removeItem('token');
          console.warn('🔒 Token expired — logging out user');
          toast.error('Session expired. Please log in again.');
        } else {
          console.error('❌ Error fetching user profile:', msg);
        }
      }
    };

       fetchUser()
       
        
      }catch(err){
        console.log(err.message)
      }
    }
   fetchProductType()
    
  },[dispatch])
  return null

}

export function Providers({ children }) {
  return (
    <Provider store={store}>
    
      <Product/>
      
      {children}
      <Toaster position="top-right" />
    </Provider>
  );
}
