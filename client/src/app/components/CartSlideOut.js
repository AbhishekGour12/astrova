"use client";

import React, { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaPlus, FaMinus, FaTrash, FaArrowLeft } from "react-icons/fa";

import { useCart } from "../context/CartContext";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";

import { couponAPI } from "../lib/coupons";
import { productAPI } from "../lib/product";
import { paymentAPI } from "../lib/payment";
import { orderAPI } from "../lib/order";

const CartSlideOut = () => {
  const {
    isCartOpen,
    setIsCartOpen,
    cartItems,
    updateQuantity,
    removeFromCart,
    fetchCart,
    clearCart
  } = useCart();

  const user = useSelector((s) => s.auth.user);

  // ================================
  // 1. DATA LOADING
  // ================================
  const [mappedCart, setMappedCart] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [showPriceDetails, setShowPriceDetails] = useState(false);

  // PAYMENT TYPE
  const [paymentMethod, setPaymentMethod] = useState(null); 

  const platformFee = 11;
  const codFee = 52;

  // Load Products Logic (With Data Preservation)
  useEffect(() => {
    const loadProducts = async () => {
      if (mappedCart.length === 0) setLoadingProducts(true);

      try {
        const final = [];
        for (const item of cartItems) {
          const existingItem = mappedCart.find(
            (m) => m.product && (m.product._id === (item.product?._id || item.productId))
          );

          let productData = item.product;
          if (existingItem && existingItem.product) {
             const incomingHasData = productData && productData.offerPercent !== undefined;
             if (!incomingHasData) productData = existingItem.product;
          }

          if (productData && productData._id) {
            final.push({ ...item, product: productData });
          } else {
            const p = await productAPI.getProductById(item.productId);
            final.push({ product: p, quantity: item.quantity });
          }
        }
        setMappedCart(final);
      } catch (err) {
        console.error(err);
      }
      setLoadingProducts(false);
    };

    if (cartItems.length > 0) loadProducts();
    else {
      setMappedCart([]);
      setLoadingProducts(false);
    }
  }, [cartItems]); 

  // ================================
  // 2. CHECKOUT STATE
  // ================================
  const [checkoutStep, setCheckoutStep] = useState("cart");
  const [loading, setLoading] = useState(false);
  
  // DYNAMIC VALUES
  const [shippingCharge, setShippingCharge] = useState(0);
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [deliveryETA, setDeliveryETA] = useState(null);

  const [errors, setErrors] = useState({});
  const [isCOD, setIsCOD] = useState(false);
  const [address, setAddress] = useState({
    fullName: "", email: "", phone: "", addressLine1: "", addressLine2: "", city: "", state: "", pincode: "",
  });

  const onClose = () => setIsCartOpen(false);

  useEffect(() => { fetchCart(); }, [user]);

  // Load Available Coupons
  const [availableCoupons, setAvailableCoupons] = useState([]);
  useEffect(() => {
    const load = async () => {
      try {
        const data = await couponAPI.getAll();
        setAvailableCoupons(data.coupons);
      } catch {}
    };
    load();
  }, []);

  // ================================
  // RESET LOGIC (Cart Change -> Reset Shipping/Coupon)
  // ================================
  useEffect(() => {
    if (shippingCharge > 0 || couponDiscount > 0) {
        setShippingCharge(0);
        setCouponDiscount(0);
        setCouponCode("");
        setDeliveryETA(null);
        if (checkoutStep === 'payment' || checkoutStep === 'coupon') {
            setCheckoutStep('address'); 
            toast("Cart updated. Please recalculate shipping.");
        }
    }
  }, [mappedCart, cartItems]); 

  // ================================
  // 3. CALCULATION LOGIC
  // ================================

  const calculateUnitFinalPrice = (product) => {
    if (!product) return 0;
    const price = Number(product.price) || 0;
    const offerPercent = Number(product.offerPercent) || 0; 
    const gstPercent = Number(product.gstPercent) || 0;

    const discountAmount = price * (offerPercent / 100);
    const priceAfterOffer = price - discountAmount;
    const gstAmount = priceAfterOffer * (gstPercent / 100);
    
    return priceAfterOffer + gstAmount;
  };

  const subtotal = useMemo(() => {
    return mappedCart.reduce((acc, item) => {
      const unitPrice = calculateUnitFinalPrice(item.product);
      return acc + (unitPrice * item.quantity);
    }, 0);
  }, [mappedCart]);

  const totalWeight = useMemo(() => 
    mappedCart.reduce((sum, item) => sum + Number(item?.product?.weight || 0.2) * item.quantity, 0), 
  [mappedCart]);

  const rawTotal =
    subtotal +
    shippingCharge +
    platformFee +
    (isCOD ? codFee : 0) -
    couponDiscount;

  const finalAmount = isCOD ? Math.ceil(rawTotal) : Number(rawTotal.toFixed(2));
  
  const roundOff = (paymentMethod === "cod" || isCOD) ? Math.ceil(rawTotal) - rawTotal : 0;

  // ================================
  // 4. ACTIONS
  // ================================

  const applyCoupon = async () => {
    if (!couponCode.trim()) return toast.error("Enter valid coupon.");
    setLoading(true);
    try {
      const res = await couponAPI.applyCoupon(couponCode, subtotal);
      setCouponDiscount(res.discount);
      toast.success("Coupon applied!");
    } catch (err) {
      toast.error(err.message);
    }
    setLoading(false);
  };

  const validateAddress = () => {
    const newErrors = {};
    if (!address.fullName.trim()) newErrors.fullName = "Required";
    if (!address.email.trim()) newErrors.email = "Required";
    if (!address.phone.trim() || !/^[6-9]\d{9}$/.test(address.phone)) newErrors.phone = "Invalid Phone";
    if (!address.addressLine1.trim()) newErrors.addressLine1 = "Required";
    if (!address.pincode.trim() || !/^\d{6}$/.test(address.pincode)) newErrors.pincode = "Invalid Pincode";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateShipping = async () => {
    if (!validateAddress()) return toast.error("Check address fields");
    setLoading(true);
    try {
      const charge = await productAPI.getShippingCharges({
        pickup_postcode: 452010,
        delivery_postcode: address.pincode,
        weight: totalWeight,
        cod: isCOD ? 1 : 0,
      });
      setShippingCharge(charge.shippingCharge);
      
      if (charge.estimated_delivery_days) setDeliveryETA(`${charge.estimated_delivery_days} days`);
      else if (charge.etd) setDeliveryETA(new Date(charge.etd).toLocaleDateString("en-IN", { day: "numeric", month: "short" }));
      
      toast.success("Shipping updated!");
      setCheckoutStep("coupon");
    } catch (err) {
      toast.error(err.message || "Shipping error");
    }
    setLoading(false);
  };

  const handleRazorpay = async () => {
    if (!user) return toast.error("Login required");
    setLoading(true);
    try {
      const rpOrder = await paymentAPI.createOrder({ amount: finalAmount });
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY,
        amount: rpOrder.amount * 100,
        currency: "INR",
        order_id: rpOrder.id,
        handler: async (response) => {
          const verify = await paymentAPI.verifyPayment(response);
          if (verify.success) await placeOrder("online", response);
          else toast.error("Verification Failed");
        },
        theme: { color: "#C06014" },
      };
      const rz = new window.Razorpay(options);
      rz.open();
    } catch (err) {
      toast.error(err.message);
    }
    setLoading(false);
  };

  const placeOrder = async (payMethod, paymentDetails = null) => {
    if (!user) return toast.error("Please login");
    setLoading(true);
    try {
      await orderAPI.createOrder({
        shippingAddress: address,
        paymentMethod: payMethod,
        paymentDetails,
        discount: couponDiscount,
        offerDiscount: 0,
        roundOff,
        isCODEnabled: isCOD,
        totalWeight,
        finalAmount,
      });
      toast.success("Order Placed!");
      await clearCart();
      setIsCartOpen(false);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Order Failed");
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    if (checkoutStep === "address") setCheckoutStep("cart");
    else if (checkoutStep === "coupon") setCheckoutStep("address");
    else if (checkoutStep === "payment") setCheckoutStep("coupon");
  };

  // ================================
  // 5. UI RENDER
  // ================================
  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          <motion.div
            className="fixed inset-x-0 bottom-0 top-[90px] bg-black/40 z-[9998]"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            className="fixed right-0 top-[90px] h-[calc(100vh-90px)] max-w-md w-full bg-white shadow-xl z-[9999]"
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
          >
            {/* Header */}
            <div className="flex justify-between p-6 border-b">
              <div className="flex items-center gap-3">
                {checkoutStep !== "cart" && <FaArrowLeft className="cursor-pointer" onClick={goBack} />}
                <h2 className="font-bold text-xl">Checkout</h2>
              </div>
              <FaTimes className="cursor-pointer text-xl" onClick={onClose} />
            </div>

            {/* Body */}
            <div className="p-6 overflow-y-auto flex-1 h-[calc(100%-140px)]">
              {checkoutStep === "cart" && (
                <>
                  {mappedCart.length === 0 ? <p className="text-center text-gray-500">Cart Empty</p> : (
                    mappedCart.map((item) => {
                        const unitPrice = calculateUnitFinalPrice(item.product);
                        return (
                          <div key={item.product._id} className="flex gap-3 bg-gray-100 p-3 rounded-lg mb-3">
                            <img src={`${process.env.NEXT_PUBLIC_IMAGE_URL}${item.product.imageUrls[0]}`} className="w-20 h-20 rounded-lg object-cover"/>
                            <div className="flex-1">
                              <p className="font-semibold">{item.product.name}</p>
                              <div className="flex flex-col text-sm">
                                <span className="font-bold">₹{unitPrice.toFixed(2)}</span>
                                <span className="text-xs text-green-600">
                                  ({item.product.offerPercent || 0}% Off + {item.product.gstPercent || 0}% GST)
                                </span>
                              </div>
                              <div className="flex items-center gap-2 mt-2">
                                <button onClick={() => updateQuantity(item.product._id, item.quantity - 1)} className="px-2 bg-gray-200 rounded"><FaMinus/></button>
                                <span>{item.quantity}</span>
                                <button onClick={() => updateQuantity(item.product._id, item.quantity + 1)} className="px-2 bg-gray-200 rounded"><FaPlus/></button>
                                <FaTrash className="text-red-500 ml-auto cursor-pointer" onClick={() => removeFromCart(item.product._id)}/>
                              </div>
                            </div>
                          </div>
                        )
                    })
                  )}
                  {mappedCart.length > 0 && (
                    <button onClick={() => setCheckoutStep("address")} className="w-full bg-[#003D33] text-white py-3 rounded-xl mt-4">Proceed to Address</button>
                  )}
                </>
              )}

              {checkoutStep === "address" && (
                <>
                    <h3 className="font-bold mb-3">Shipping Address</h3>
                    <div className="space-y-3">
                        {Object.keys(address).map(k => (
                            <div key={k}>
                                <input 
                                    value={address[k]} placeholder={k.charAt(0).toUpperCase() + k.slice(1)} 
                                    onChange={e => {setAddress({...address, [k]: e.target.value}); setErrors({...errors, [k]: ''})}}
                                    className={`w-full border p-2 rounded ${errors[k] ? 'border-red-500' : ''}`}
                                />
                                {errors[k] && <p className="text-red-500 text-xs">{errors[k]}</p>}
                            </div>
                        ))}
                    </div>
                    <div className="flex items-center gap-2 mt-4">
                        <input type="checkbox" checked={isCOD} onChange={() => setIsCOD(!isCOD)} className="w-5 h-5"/>
                        <label>Cash on Delivery</label>
                    </div>
                    <button onClick={calculateShipping} disabled={loading} className="w-full bg-[#003D33] text-white py-3 rounded-xl mt-6">
                        {loading ? "Calculating..." : "Calculate Shipping"}
                    </button>
                </>
              )}

              {/* COUPON STEP (Restored Old UI) */}
              {checkoutStep === "coupon" && (
                <>
                    <h3 className="font-bold mb-3">Apply Coupon</h3>
                    
                    {/* Input + Apply Button */}
                    <div className="flex gap-2">
                        <input 
                            value={couponCode} 
                            onChange={e => setCouponCode(e.target.value)} 
                            className="flex-1 border px-3 py-2 rounded-lg"
                            placeholder="Enter coupon"
                        />
                        <button 
                            onClick={applyCoupon} 
                            disabled={loading}
                            className="px-4 py-2 bg-[#C06014] text-white rounded-lg"
                        >
                            {loading ? "..." : "Apply"}
                        </button>
                    </div>

                    {/* Available Coupons List (Old Style) */}
                    <p className="font-semibold mt-4 mb-2 text-[#003D33]">
                        Available Coupons
                    </p>

                    <div className="space-y-2">
                        {availableCoupons.length ? (
                            availableCoupons.map((cp) => (
                                <button
                                    key={cp._id}
                                    onClick={() => setCouponCode(cp.code)}
                                    className="w-full border p-3 rounded-lg text-left hover:bg-[#ECE5D3]"
                                >
                                    <p className="font-semibold">{cp.code}</p>
                                    <p className="text-sm text-gray-600">
                                        {cp.discountType === "percentage"
                                            ? `${cp.discountValue}% Off`
                                            : `Flat ₹${cp.discountValue} Off`}
                                    </p>
                                </button>
                            ))
                        ) : (
                            <p className="text-gray-500">No coupons available.</p>
                        )}
                    </div>

                    <button 
                        onClick={() => setCheckoutStep("payment")} 
                        className="w-full mt-6 bg-[#003D33] text-white py-3 rounded-xl"
                    >
                        Continue to Payment
                    </button>
                </>
              )}

              {checkoutStep === "payment" && (
                <>
                    {!user && <p className="text-red-500 mb-2 font-semibold">Please Login to Continue</p>}
                    <button onClick={() => { setPaymentMethod(isCOD ? "cod" : "online"); isCOD ? placeOrder("cod") : handleRazorpay(); }} className="w-full bg-[#C06014] text-white py-4 rounded-xl">
                        {isCOD ? `Place COD Order (₹${finalAmount})` : `Pay Online (₹${finalAmount})`}
                    </button>
                </>
              )}
            </div>

            {/* Price Summary */}
            <div className="absolute bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 z-[99999]">
              <div onClick={() => setShowPriceDetails(!showPriceDetails)} className="flex justify-between cursor-pointer">
                <span className="font-bold text-[#003D33]">Total: ₹{finalAmount}</span>
                <span className="text-[#C06014] text-sm">{showPriceDetails ? "Hide Details ▲" : "View Details ▼"}</span>
              </div>
              
              <AnimatePresence>
                {showPriceDetails && (
                    <motion.div initial={{height:0}} animate={{height:'auto'}} exit={{height:0}} className="overflow-hidden bg-gray-50 mt-2 rounded text-sm p-3 space-y-2">
                        <div className="flex justify-between"><span>Subtotal (GST+Offer Incl.)</span><span>₹{subtotal.toFixed(2)}</span></div>
                        
                        <div className="flex justify-between">
                            <span>Shipping</span>
                            <span>{shippingCharge > 0 ? `₹${shippingCharge}` : <span className="text-xs text-orange-500">Calculated at Address</span>}</span>
                        </div>

                        <div className="flex justify-between"><span>Platform Fee</span><span>₹{platformFee}</span></div>
                        
                        {isCOD && <div className="flex justify-between text-orange-700"><span>COD Handling</span><span>+₹{codFee}</span></div>}
                        
                        {couponDiscount > 0 && <div className="flex justify-between text-green-700"><span>Coupon Discount</span><span>-₹{couponDiscount}</span></div>}
                        
                        <hr/>
                        <div className="flex justify-between font-bold text-lg text-[#003D33]"><span>Grand Total</span><span>₹{finalAmount}</span></div>
                    </motion.div>
                )}
              </AnimatePresence>
            </div>

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartSlideOut;