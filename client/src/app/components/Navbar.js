"use client";

import React, { useState } from "react";
import { FaShoppingCart, FaUser, FaTimes } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { loginSuccess } from "../store/features/authSlice";
import toast from "react-hot-toast";
import { useCart } from "../context/CartContext";

const Navbar = () => {
  const { setIsCartOpen, cartItems } = useCart();
  const itemsArray = Array.isArray(cartItems)
    ? cartItems
    : (cartItems?.items || []);

  const cartCount = itemsArray.reduce((sum, it) => sum + (it.quantity || 0), 0);

  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const router = useRouter();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);


  const logout = () => {
    localStorage.removeItem("token");
    dispatch(loginSuccess(""));
    toast.success("Logged out!");
    router.push("/");
    setIsMobileMenuOpen(false);
  };

  return (
   <div className="w-full flex justify-center  " id="navbar">

      <div className="flex max-w-7xl m-auto justify-between items-center absolute px-4 sm:px-6 lg:px-12 py-4 lg:py-6  w-full z-50 text-[#725E43] font-semibold bg-transparent">
        
        {/* LOGO */}
      {/* LOGO FIXED RESPONSIVE */}
<div 
  onClick={() => router.push("/")} 
  className="cursor-pointer flex items-center"
>
  <div className="relative 
    w-19 h-19
  
    max-md:w-16 max-md:h-16
    max-lg:w-[70px] max-lg:h-[70px] 
    max-2xl:w-[90px] max-2xl:h-[90px]
    
  ">
    <Image
      src="/logo.png"
      alt="MyAstrova Logo"
      fill
      className="object-cover"
      priority
    />
  </div>
</div>


        {/* DESKTOP MENU */}
        <ul
          className="hidden lg:flex space-x-6 xl:space-x-10 text-[16px] lg:text-[18px] lg:mr-[50px] font-normal"
          style={{ fontFamily: "Noto Sans" }}
        >
          <li className="hover:text-[#B49A77] transition"><Link href="/">Home</Link></li>
          <li className="hover:text-[#B49A77] transition"><Link href="/ProductsPage">Products</Link></li>
          <li className="hover:text-[#B49A77] transition"><Link href="/Chats">Chats</Link></li>
          <li className="hover:text-[#B49A77] transition"><Link href="/Admin">Admin</Link></li>
          <li className="hover:text-[#B49A77] transition"><Link href="/">Who are we</Link></li>
        </ul>

        {/* MOBILE MENU BUTTON */}
        <div className="lg:hidden">
          <button className="text-[#725E43]" onClick={toggleMobileMenu}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>
            </svg>
          </button>
        </div>

        {/* RIGHT SIDE BUTTONS */}
        <div className="flex items-center space-x-4 lg:space-x-6">

          {/* CART BUTTON */}
          {user ? (
          <button onClick={() => setIsCartOpen(true)} className="relative p-2">
      <FaShoppingCart className="text-xl" />
      {cartCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-[#C06014] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
          {cartCount}
        </span>
      )}
    </button>
          ) : (
            <FaShoppingCart
              className="text-lg lg:text-xl text-gray-400 opacity-40 cursor-not-allowed"
              title="Please login to view your cart"
            />
          )}


          {/* USER LOGIN/PROFILE */}
{user ? (
  <div className="flex items-center space-x-3">

    {/* USER ICON + FIRST LETTER FOR SM & MD */}
    <div className="flex items-center justify-center bg-[#F6F3E4] w-9 h-9 rounded-full shadow lg:hidden">
      <span className="text-[#725E43] font-bold">
        {user.username?.charAt(0).toUpperCase()}
      </span>
    </div>

    {/* USERNAME BADGE FOR LG + SCREENS */}
    <div className="hidden lg:flex items-center space-x-2 bg-[#F6F3E4] px-3 py-1.5 rounded-lg shadow">
      <FaUser className="text-sm text-[#725E43]" />
      <span className="text-[#725E43] font-medium">
        {user.username}
      </span>
    </div>

    {/* LOGOUT BUTTON ONLY DESKTOP */}
    <button
      onClick={logout}
      className="hidden lg:block px-3 py-1.5 bg-red-500 text-white rounded-lg shadow hover:bg-red-600 transition-all"
    >
      Logout
    </button>

  </div>
) : (
  <Link href="/Login">
    <button className="px-3 py-1.5 lg:px-5 lg:py-2 bg-[#F6F3E4] text-[#725E43] rounded-lg shadow hover:bg-[#E8E3CF] transition flex items-center space-x-2">
      <FaUser />
      <span className="hidden sm:inline">Login</span>
    </button>
  </Link>
)}

        </div>

        {/* MOBILE SIDEBAR MENU */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              {/* BACKDROP */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.7 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black z-40"
                onClick={() => setIsMobileMenuOpen(false)}
              />

              {/* SIDEBAR */}
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                className="fixed top-0 right-0 h-full w-72 bg-white shadow-2xl z-50"
              >
                <div className="flex justify-between items-center p-4 border-b">
                  <div className="text-[18px] font-bold flex items-center">
                    <Image src="/logo.png" width={30} height={30} alt="logo" />
                    <span className="ml-2">MYASTROVA</span>
                  </div>
                  <button 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-[#725E43] p-2"
                  >
                    <FaTimes className="w-5 h-5" />
                  </button>
                </div>

                {/* MENU LIST */}
                <ul className="py-6 px-6 space-y-4 text-[16px] font-medium">
                  <li className="border-b pb-3"><Link href="/">Home</Link></li>
                  <li className="border-b pb-3"><Link href="/ProductsPage">Products</Link></li>
                  <li className="border-b pb-3"><Link href="/Chats">Chats</Link></li>
                  <li className="border-b pb-3"><Link href="/Admin">Admin</Link></li>
                  <li className="border-b pb-3"><Link href="/">Who are we</Link></li>
                </ul>

                {/* USER SECTION */}
                <div className="absolute bottom-4 left-4 right-4">
                  {user ? (
                    <>
                      <div className="mb-3 flex items-center space-x-2 px-3 py-2 bg-[#F6F3E4] rounded-lg shadow">
                        <FaUser className="text-[#725E43]" />
                        <span className="text-[#725E43]">{user.username}</span>
                      </div>

                      <button
                        onClick={logout}
                        className="w-full px-4 py-3 bg-red-500 text-white rounded-lg shadow hover:bg-red-600"
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <Link href="/Login">
                      <button className="w-full px-4 py-3 bg-[#725E43] text-white rounded-lg shadow hover:bg-[#5A3E25]">
                        Login / Sign Up
                      </button>
                    </Link>
                  )}
                </div>

              </motion.div>
            </>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};

export default Navbar;
