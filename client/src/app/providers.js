'use client';

import { Provider, useDispatch, useSelector } from 'react-redux';
import toast, { Toaster } from 'react-hot-toast';
import { store } from './store/store';
import { productsType } from './store/features/productTypeSlice';
import { useEffect } from 'react';
import { adminAPI } from './lib/admin';
import { authAPI } from './lib/auth';
import { loginSuccess } from './store/features/authSlice';
import { useState } from "react";
import AstroProfileModal from "./components/AstroprofileModal";


// ✅ Safe and silent user auth initialization
 function Product({setShowProfileForm}){
 
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user)

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
  dispatch(loginSuccess(res.data));

  // 🔥 CHECK PROFILE COMPLETION
  if (!res.data.isProfileComplete) {
    setShowProfileForm(true);
  }


        } else {
          // If backend didn't send valid user, clear token
          localStorage.removeItem('token');
          console.warn('⚠️ Invalid user response, token cleared');
         
        }
      } catch (err) {
        // Detect if token expired or unauthorized
        const status = err?.response?.status;
        const backendMsg = err?.response?.data?.message;
        const msg = backendMsg || err?.message || 'Unknown error';

        // 🔹 Handle expired/invalid token
        if (status === 401 || msg.toLowerCase().includes('expired')) {
          localStorage.removeItem('token');
         // console.warn('🔒 Token expired — logging out user');
          //toast.error('Session expired. Please log in again.');
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
 useEffect(() => {
  if (user && !user.isProfileComplete) {
    setShowProfileForm(true);
  }
}, [user]);

  return null

}


export function Providers({ children }) {
  const [showProfileForm, setShowProfileForm] = useState(false);

  return (
    <Provider store={store}>
      <Product setShowProfileForm={setShowProfileForm} />
      {children}

      {/* 🔥 One-time Astro Profile Form */}
      {showProfileForm && (
        <AstroProfileModal onClose={() => setShowProfileForm(false)} />
      )}

      <Toaster position="bottom-left" />
    </Provider>
  );
}
