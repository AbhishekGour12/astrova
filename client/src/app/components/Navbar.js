"use client";

import React, { useState, useEffect } from "react";
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
  const [isScrolled, setIsScrolled] = useState(false);
  const itemsArray = Array.isArray(cartItems)
    ? cartItems
    : cartItems?.items || [];

  const cartCount = itemsArray.reduce((sum, it) => sum + (it.quantity || 0), 0);

  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const router = useRouter();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  
  // This logic is correct: it locks the BODY scroll
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [isMobileMenuOpen]);

  const logout = () => {
    localStorage.removeItem("token");
    dispatch(loginSuccess(""));
    toast.success("Logged out!");
    router.push("/");
    setIsMobileMenuOpen(false);
  };
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  const chats = () => {
    router.push("/astrologers?service=CHAT");
    setIsMobileMenuOpen(false);
  };

  const calls = () => {
    router.push("/astrologers?service=CALL");
    setIsMobileMenuOpen(false);
  };

  const meet = () => {
    router.push("/astrologers?service=MEET");
    setIsMobileMenuOpen(false);
  };

  return (
    <div
      id="navbar"
      className={`fixed top-0 left-0 right-0 z-[9999]
transition-all duration-300
${
  isScrolled || isMobileMenuOpen
    ? "bg-[#4d331e]/90 backdrop-blur-lg shadow-lg"
    : "bg-transparent"
}`}
    >
      <div
        className="flex  mx-auto justify-between items-center
  px-4 sm:px-6 lg:px-12
  h-[72px] lg:h-[88px]
  text-[#E9C164] font-semibold  "
      >
        {/* LOGO */}
        {/* LOGO FIXED RESPONSIVE */}
        <div
          onClick={() => router.push("/")}
          className="cursor-pointer flex items-center"
        >
          <div className="relative w-[56px] h-[56px] lg:w-[100px] lg:h-[100px]">
            <Image
              src="/logo2.png"
              alt="MyAstrova Logo"
              fill
              className=" object-cover "
              priority
            />
          </div>
          <span
            className="ml-2 text-[20px] lg:text-[24px] font-bold max-sm:text-[15px] max-[380px]:text-[10px]"
            style={{ fontFamily: "Noto Sans" }}
          >
            MYASTROVA
          </span>
        </div>

        {/* DESKTOP MENU */}
        <ul
          className="
    flex
    items-center
    space-x-6 xl:space-x-10
    text-[16px] lg:text-[18px]
    font-normal
    whitespace-nowrap

    max-w-[640px]
    flex-shrink-0
    mr-32 xl:mr-40
    
    
    pr-4 
  "
          style={{ fontFamily: "Noto Sans" }}
          id="navbar-menu"
        >
          <li className="hover:text-[#B49A77] transition">
            <Link href="/">Home</Link>
          </li>
          <li className="hover:text-[#B49A77] transition">
            <Link href="/ProductsPage">Products</Link>
          </li>

          <li className="hover:text-[#B49A77] transition">
            <Link href="/Orders">MyOrders</Link>
          </li>
          <li className="hover:text-[#B49A77] transition">
            <div className="hover:cursor-pointer" onClick={chats}>
              Chats
            </div>
          </li>
          <li className="hover:text-[#B49A77] transition">
            <div className="hover:cursor-pointer" onClick={calls}>
              Calls
            </div>
          </li>
          <li className="hover:text-[#B49A77] transition">
            <Link href="/Remedy">Remedies</Link>
          </li>
          <li className="hover:text-[#B49A77] transition">
            <div className="hover:cursor-pointer" onClick={meet}>
              Meet
            </div>
          </li>
        </ul>

        {/* MOBILE MENU BUTTON */}
        <div className="hidden" id="menu-button">
          <button className="text-[#E9C164]" onClick={toggleMobileMenu}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
        </div>

        {/* RIGHT SIDE BUTTONS */}
        <div className="flex items-center space-x-4 lg:space-x-6">
          {/* CART BUTTON */}

          <button onClick={() => setIsCartOpen(true)} className="relative p-2">
            <FaShoppingCart className="text-xl" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#C06014] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>

          {/* USER LOGIN/PROFILE */}
          {user ? (
            <div className="flex items-center space-x-3">
              {/* USER ICON + FIRST LETTER FOR SM & MD */}
              <div className="flex items-center justify-center bg-[#F6F3E4] w-9 h-9 rounded-full shadow lg:hidden">
                <span className="text-[#E9C164] font-bold">
                  {user.username?.charAt(0).toUpperCase()}
                </span>
              </div>

              {/* USERNAME BADGE FOR LG + SCREENS */}
              <div className="hidden lg:flex items-center space-x-2 bg-[#F6F3E4] px-3 py-1.5 rounded-lg shadow">
                <FaUser className="text-sm text-[#E9C164]" />
                <span className="text-[#E9C164] font-medium">
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
              <button className="px-3 py-1.5 lg:px-5 lg:py-2 bg-[#F6F3E4] text-[#E9C164] rounded-lg shadow hover:bg-[#E8E3CF] transition flex items-center space-x-2">
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
                animate={{ opacity: 0.6 }}
                exit={{ opacity: 0 }}
                className="fixed top-[72px] left-0 right-0 bottom-0 bg-black z-40"
                onClick={() => setIsMobileMenuOpen(false)}
              />

              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                // --- CHANGES START HERE ---
                // 1. Added 'overflow-y-auto' to enable internal scrolling
                // 2. Added 'flex flex-col' to manage layout of footer
                className="fixed top-[72px] right-0 h-[calc(100vh-72px)] w-72 bg-white shadow-2xl z-50 overflow-y-auto flex flex-col"
              >
                <div className="flex justify-between items-center p-4 border-b shrink-0">
                  <div className="text-[18px] font-bold flex items-center">
                    <Image
                      src="/logo.png"
                      width={30}
                      height={30}
                      alt="logo"
                    />
                    <span className="ml-2">MYASTROVA</span>
                  </div>
                  <button
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-[#E9C164] p-2"
                  >
                    <FaTimes className="w-5 h-5" />
                  </button>
                </div>

                {/* MENU LIST */}
                <ul className="py-6 px-6 space-y-4 text-[16px] font-medium shrink-0">
                  <li className="border-b pb-3">
                    <Link href="/">Home</Link>
                  </li>
                  <li className="border-b pb-3">
                    <Link href="/ProductsPage">Products</Link>
                  </li>
                  <li className="border-b pb-3">
                    <Link href="/astrologers?service=CHAT">Chats</Link>
                  </li>
                  <li
                    className={`border-b pb-3 ${
                      user ? "hover:cursor-pointer" : "hover:cursor-not-allowed"
                    }`}
                  >
                    <Link
                      href="/Orders"
                      className={`${
                        user
                          ? "hover:cursor-pointer"
                          : "hover:cursor-not-allowed"
                      }`}
                    >
                      MyOrders
                    </Link>
                  </li>
                  <li className="border-b pb-3">
                    <Link href="/astrologers?service=CALL">Calls</Link>
                  </li>
                  <li className="border-b pb-3">
                    <Link href="/Remedy">Remedies</Link>
                  </li>
                  <li className="border-b pb-3">
                    <Link href="/astrologers?service=MEET">Meet</Link>
                  </li>
                  <li className="border-b pb-3">
                    <Link href="/About">About</Link>
                  </li>
                </ul>

                {/* USER SECTION */}
                {/* 3. Changed from 'absolute' to 'mt-auto' so it pushes to the bottom safely */}
                <div className="mt-auto p-4 shrink-0">
                  {user ? (
                    <>
                      <div className="mb-3 flex items-center space-x-2 px-3 py-2 bg-[#F6F3E4] rounded-lg shadow">
                        <FaUser className="text-[#E9C164]" />
                        <span className="text-[#E9C164]">
                          {user.username}
                        </span>
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
                      <button className="w-full px-4 py-3 bg-[#E9C164] text-white rounded-lg shadow hover:bg-[#5A3E25]">
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