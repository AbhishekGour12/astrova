"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaPlus, FaMinus, FaTrash } from "react-icons/fa";

import { useCart } from "../context/CartContext";
import { useSelector } from "react-redux";

import toast from "react-hot-toast";
import { couponAPI } from "../lib/coupons";
import { productAPI } from "../lib/product";
import { paymentAPI } from "../lib/payment";
import {orderAPI} from "../lib/order";

const CartSlideOut = () => {
  const {
    isCartOpen,
    setIsCartOpen,
    cartItems,
    updateQuantity,
    removeFromCart,
    fetchCart,
  } = useCart();

  const user = useSelector((s) => s.auth.user);

  const [checkoutStep, setCheckoutStep] = useState("cart");
  const [shippingCharge, setShippingCharge] = useState(0);
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  const [address, setAddress] = useState({
    fullName: "",
    email: "",
    phone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pincode: "",
  });

  const onClose = () => setIsCartOpen(false);

  useEffect(() => {
    if (user) fetchCart();
  }, [user]);

  // ----------------------
  // PRICE CALCULATION
  // ----------------------
  const subtotal = cartItems.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const gst = subtotal * 0.18;
  const finalAmount = subtotal + gst + shippingCharge - discount;

  // ----------------------
  // APPLY COUPON
  // ----------------------
  const applyCoupon = async () => {
    if (!couponCode.trim()) return toast.error("Enter coupon");

    setIsApplyingCoupon(true);

    try {
      const data = await couponAPI.applyCoupon(couponCode, subtotal);
      setDiscount(data.discount);
      toast.success("Coupon applied!");
    } catch (err) {
      toast.error(err.message);
    }

    setIsApplyingCoupon(false);
  };

  // ----------------------
  // SHIPPING
  // ----------------------
  const calculateShipping = async () => {
    if (!address.pincode || address.pincode.length !== 6)
      return toast.error("Enter valid pincode");

    try {
      const body = {
        pickup_postcode: 452010,
        delivery_postcode: address.pincode,
        weight: 0.5,
        cod: 0,
      };

      const result = await productAPI.getShippingCharges(body);

      setShippingCharge(result.shippingCharge);
      toast.success("Shipping calculated");
      setCheckoutStep("coupon");
    } catch (err) {
      toast.error(err.message);
    }
  };

  // ----------------------
  // RAZORPAY PAYMENT
  // ----------------------
  const handleRazorpay = async () => {
    try {
      // 1️⃣ Create Razorpay Order
      const rpOrder = await paymentAPI.createOrder({ amount: finalAmount });

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY,
        amount: rpOrder.amount,
        currency: "INR",
        order_id: rpOrder.id,
        name: "Astrova Store",
        description: "Product Payment",
        handler: async (response) => {
          // 2️⃣ VERIFY BACKEND
          const verifyRes = await paymentAPI.verifyPayment(response);

          if (verifyRes.success) {
            await placeOrder("razorpay", response);
          } else {
            toast.error("Payment verification failed");
          }
        },
        theme: { color: "#C06014" },
      };

      const razor = new window.Razorpay(options);
      razor.open();
    } catch (err) {
      toast.error(err.message);
    }
  };

  // ----------------------
  // CREATE ORDER → BACKEND
  // ----------------------
  const placeOrder = async (paymentMethod, paymentDetails = null) => {
    try {
      const formData = {
        shippingAddress: address,
        paymentMethod,
        discount,
        paymentDetails
      }
      const res = await orderAPI.createOrder(formData)

    
      if (!res) throw new Error(data.message);

      toast.success("Order placed!");
      setIsCartOpen(false);
    } catch (err) {
      toast.error(err.message);
    }
  };

  // ----------------------
  // UI
  // ----------------------
  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* BACKDROP */}
          <motion.div
            className="fixed inset-0 bg-black/40 z-[9998]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* SLIDER */}
          <motion.div
            className="fixed right-0 top-0 h-full max-w-md w-full bg-white z-[9999] shadow-xl flex flex-col"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
          >
            {/* HEADER */}
            <div className="flex justify-between p-6 border-b">
              <h2 className="font-bold text-xl">Checkout</h2>
              <FaTimes onClick={onClose} className="cursor-pointer text-xl" />
            </div>

            {/* CONTENT */}
            <div className="p-6 overflow-y-auto flex-1">

              {/* ---------------- CART STEP ---------------- */}
              {checkoutStep === "cart" && (
                <>
                  {cartItems.length === 0 ? (
                    <p className="text-center text-gray-500">Cart is empty</p>
                  ) : (
                    cartItems.map((item) => (
                      <div key={item.product._id} className="flex gap-3 bg-gray-100 p-3 rounded-lg mb-3">
                        <img
                          src={`${process.env.NEXT_PUBLIC_API}${item.product.imageUrls[0]}`}
                          className="w-20 h-20 rounded-lg"
                        />
                        <div className="flex-1">
                          <p className="font-semibold">{item.product.name}</p>
                          <p>₹{item.product.price}</p>

                          <div className="flex items-center gap-2 mt-2">
                            <button
                              onClick={() =>
                                updateQuantity(item.product._id, item.quantity - 1)
                              }
                              className="px-2 py-1 bg-gray-300 rounded"
                            >
                              <FaMinus />
                            </button>

                            <span>{item.quantity}</span>

                            <button
                              onClick={() =>
                                updateQuantity(item.product._id, item.quantity + 1)
                              }
                              className="px-2 py-1 bg-gray-300 rounded"
                            >
                              <FaPlus />
                            </button>

                            <FaTrash
                              className="text-red-500 cursor-pointer"
                              onClick={() => removeFromCart(item.product._id)}
                            />
                          </div>
                        </div>
                      </div>
                    ))
                  )}

                  {cartItems.length > 0 && (
                    <button
                      onClick={() => setCheckoutStep("address")}
                      className="w-full bg-[#003D33] text-white py-3 rounded-xl mt-4"
                    >
                      Proceed to Address
                    </button>
                  )}
                </>
              )}

              {/* ---------------- ADDRESS STEP ---------------- */}
              {checkoutStep === "address" && (
                <>
                  <h3 className="font-bold mb-3">Shipping Address</h3>

                  <div className="space-y-3">
                    {Object.keys(address).map((key) => (
                      <input
                        key={key}
                        value={address[key]}
                        placeholder={key}
                        className="w-full border px-3 py-2 rounded-lg"
                        onChange={(e) =>
                          setAddress({ ...address, [key]: e.target.value })
                        }
                      />
                    ))}
                  </div>

                  <button
                    onClick={calculateShipping}
                    className="w-full mt-6 bg-[#003D33] text-white py-3 rounded-xl"
                  >
                    Calculate Shipping
                  </button>
                </>
              )}

              {/* ---------------- COUPON STEP ---------------- */}
              {checkoutStep === "coupon" && (
                <>
                  <h3 className="font-bold mb-3">Apply Coupon</h3>

                  <div className="flex gap-2">
                    <input
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="flex-1 border px-3 py-2 rounded-lg"
                      placeholder="Enter coupon"
                    />
                    <button
                      className="px-4 py-2 bg-[#C06014] text-white rounded-lg"
                      onClick={applyCoupon}
                      disabled={isApplyingCoupon}
                    >
                      Apply
                    </button>
                  </div>

                  <button
                    onClick={() => setCheckoutStep("payment")}
                    className="w-full mt-6 bg-[#003D33] text-white py-3 rounded-xl"
                  >
                    Continue to Payment
                  </button>
                </>
              )}

              {/* ---------------- PAYMENT STEP ---------------- */}
              {checkoutStep === "payment" && (
                <>
                  <h3 className="font-bold mb-3">Payment Method</h3>

                  <div className="space-y-3">
                    <button
                      onClick={() => placeOrder("cod")}
                      className="w-full bg-gray-100 py-3 rounded-lg"
                    >
                      Cash on Delivery
                    </button>

                    <button
                      onClick={handleRazorpay}
                      className="w-full bg-[#C06014] text-white py-3 rounded-lg"
                    >
                      Pay Now (Razorpay)
                    </button>
                  </div>

                  <div className="bg-gray-100 p-4 mt-5 rounded-lg">
                    <p>Subtotal: ₹{subtotal}</p>
                    <p>GST: ₹{gst.toFixed(2)}</p>
                    <p>Shipping: ₹{shippingCharge}</p>
                    <p>Discount: -₹{discount}</p>
                    <h3 className="font-bold mt-2">Total: ₹{finalAmount}</h3>
                  </div>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartSlideOut;
