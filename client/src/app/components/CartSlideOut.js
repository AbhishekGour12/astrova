"use client";

import React, { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaPlus, FaMinus, FaTrash, FaArrowLeft, FaWallet, FaMoneyBillWave } from "react-icons/fa";

import { useCart } from "../context/CartContext";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";

import { couponAPI } from "../lib/coupons";
import { productAPI } from "../lib/product";
import { paymentAPI } from "../lib/payment";
import { orderAPI } from "../lib/order";
import { useRouter } from "next/navigation";

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
  const [showCODSummary, setShowCODSummary] = useState(false); 

  const platformFee = 11;
  const codFee = 52;

  // Load Products Logic
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
  const router = useRouter()
  // DYNAMIC VALUES
  
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
  // RESET LOGIC
  // ================================
  useEffect(() => {
    if (shippingCharge > 0 || couponDiscount > 0) {
        setShippingCharge(0);
        setCouponDiscount(0);
        setCouponCode("");
        setDeliveryETA(null);
        setIsCOD(false);
        setShowCODSummary(false);
        if (checkoutStep === 'payment' || checkoutStep === 'coupon') {
            setCheckoutStep('address'); 
            toast("Cart updated. Please recalculate shipping.");
        }
    }
  }, [mappedCart, cartItems]); 

  // ================================
  // 3. CALCULATION LOGIC (UPDATED FOR ROUND OFF)
  // ================================

  const calculateUnitFinalPrice = (product) => {
    if (!product) return 0;
    const price = Number(product.price) || 0;
    const offerPercent = Number(product.offerPercent) || 0; 
   

    const discountAmount = price * (offerPercent / 100);
    const priceAfterOffer = price - discountAmount;
   
    return priceAfterOffer;
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

const onlineDiscountPercent = 10; // 10% Extra Discount
const shippingCharge = 0; // FREE SHIPPING
  // Update calculation logic for Online Discount
  
  // 1. Calculate Exact Raw Total
  
// --- Simplified Calculations ---

// 1. Online Discount (Hamesha 10% on Subtotal for display)

// ================================
// CLEAN FINAL CALCULATION
// ================================




// ❗ Discount sirf preview ke liye
const onlineDiscountAmountPreview =
  subtotal * (onlineDiscountPercent / 100);

const onlinePreviewTotal =
  subtotal - couponDiscount - onlineDiscountAmountPreview;

// ❗ Real discount tab lagega jab user online select kare
const onlineDiscountAmount =
  paymentMethod === "online"
    ? subtotal * (onlineDiscountPercent / 100)
    : 0;

const onlineTotal =
  subtotal - couponDiscount - onlineDiscountAmount;

const codTotal =
  subtotal - couponDiscount + codFee;

const finalAmount =
  paymentMethod === "online"
    ? Number(onlineTotal.toFixed(2))
    : isCOD
      ? Math.ceil(codTotal)
      : Number((subtotal - couponDiscount).toFixed(2));

const roundOffAmount =
  isCOD ? finalAmount - codTotal : 0;

// 4️⃣ Final Amount (used for backend)
const exactTotal =
  subtotal
  - couponDiscount
  - onlineDiscountAmount
  + (isCOD ? codFee : 0);



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
    setIsCOD(false);
    setShowCODSummary(false);

    try {
      const charge = await productAPI.getShippingCharges({
        address: address, // Send full address object
        delivery_postcode: address.pincode,
        weight: totalWeight
      });
     // setShippingCharge(charge.shippingCharge);
      
     // if (charge.estimated_delivery_days) setDeliveryETA(`${charge.estimated_delivery_days} days`);
     // else if (charge.etd) setDeliveryETA(new Date(charge.etd).toLocaleDateString("en-IN", { day: "numeric", month: "short" }));
      
     toast.success("Address saved & Shipping updated!");
      localStorage.setItem("shippingAddress", JSON.stringify(address));

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
       


    const rpOrder = await paymentAPI.createOrder({
      amount: Math.round(onlineTotal * 100), // send paise to backend
    });
     console.log("Razorpay Order Created:", onlineTotal);
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY,
        amount: rpOrder.amount,
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
    if (!user) {
      toast.error("Please login");
      router.push("/Login");
      return;

    } 
    setLoading(true);
    try {
      await orderAPI.createOrder({
        shippingAddress: address,
        paymentMethod: payMethod,
        paymentDetails,
        discount: couponDiscount,
        offerDiscount: 0,
        roundOff: roundOffAmount, // Sending the calculated round off to backend
        isCODEnabled: isCOD,
        totalWeight,
        finalAmount,
      });
      toast.success("Order Placed!");
      await clearCart();
      setIsCartOpen(false);
      setTimeout(() =>{
        router.push("/Orders")

      },2000)
    } catch (err) {
      toast.error(err?.response?.data?.message || "Order Failed");
    } finally {
      setLoading(false);
    }
  };

  const goBack = () => {
    if (checkoutStep === "address") setCheckoutStep("cart");
    else if (checkoutStep === "coupon") setCheckoutStep("address");
    else if (checkoutStep === "payment") {
        if(showCODSummary) {
            setShowCODSummary(false);
            setIsCOD(false);
        } else {
            setCheckoutStep("coupon");
        }
    }
  };


  const indianStates = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry"
];
// Load address from localStorage on mount
useEffect(() => {
  if (typeof window !== "undefined") {
    const savedAddress = localStorage.getItem("shippingAddress");
    if (savedAddress) {
      try {
        const parsed = JSON.parse(savedAddress);
        setAddress(parsed);
      } catch (err) {
        console.error("Invalid address in localStorage");
      }
    }
  }
}, []);
useEffect(() => {
  if (!isCartOpen) return;

  if (typeof window !== "undefined") {
    const savedAddress = localStorage.getItem("shippingAddress");
    if (savedAddress) {
      try {
        const parsed = JSON.parse(savedAddress);
        setAddress(parsed);
      } catch (err) {
        console.error("Invalid localStorage address");
      }
    }
  }
}, [isCartOpen]);


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
                        {Object.keys(address).map((k) => (
  <div key={k}>
    
    {k === "state" ? (
      <select
        value={address.state}
        onChange={(e) => {
          setAddress({ ...address, state: e.target.value });
          setErrors({ ...errors, state: "" });
        }}
        className={`w-full border p-2 rounded ${
          errors.state ? "border-red-500" : ""
        }`}
      >
        <option value="">Select State</option>
        {indianStates.map((stateName) => (
          <option key={stateName} value={stateName}>
            {stateName}
          </option>
        ))}
      </select>
    ) : (
      <input
        value={address[k]}
        placeholder={k.charAt(0).toUpperCase() + k.slice(1)}
        onChange={(e) => {
          setAddress({ ...address, [k]: e.target.value });
          setErrors({ ...errors, [k]: "" });
        }}
        className={`w-full border p-2 rounded ${
          errors[k] ? "border-red-500" : ""
        }`}
      />
    )}

    {errors[k] && (
      <p className="text-red-500 text-xs">{errors[k]}</p>
    )}
  </div>
))}

                    </div>
                    <button onClick={calculateShipping} disabled={loading} className="w-full bg-[#003D33] text-white py-3 rounded-xl mt-6">
                        {loading ? "processing..." : "proceed to coupons"}
                    </button>
                </>
              )}

              {checkoutStep === "coupon" && (
                <>
                    <h3 className="font-bold mb-3">Apply Coupon</h3>
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

                    <p className="font-semibold mt-4 mb-2 text-[#003D33]">Available Coupons</p>
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
                                        {cp.discountType === "percentage" ? `${cp.discountValue}% Off` : `Flat ₹${cp.discountValue} Off`}
                                    </p>
                                </button>
                            ))
                        ) : (
                            <p className="text-gray-500">No coupons available.</p>
                        )}
                    </div>

                    <button 
                        onClick={() => {
                            if (!user) {
                                toast.error("Please login to continue");
                                router.push("/Login");
                            } else {
                                setCheckoutStep("payment");
                            }
                        }} 
                        className="w-full mt-6 bg-[#003D33] text-white py-3 rounded-xl"
                    >
                        Continue to Payment
                    </button>
                </>
              )}

            {checkoutStep === "payment" && (
  <div className="space-y-4 px-2">
    {!showCODSummary && (
      <div className="flex flex-col gap-3">
        <h3 className="font-bold text-base text-gray-800">Select Payment Method</h3>
        
        {/* ONLINE PAYMENT - 10% KATKE DIKHEGA */}
        <button 
         onClick={() => {
  setIsCOD(false);
  setPaymentMethod("online");
  handleRazorpay();
}}



          className="w-full bg-[#003D33] text-white p-4 rounded-2xl active:scale-[0.98] transition-all shadow-md"
        >
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2 text-left">
              <FaWallet className="text-sm text-yellow-400"/>
              <div>
                <span className="block font-semibold text-sm">Pay Online</span>
                <span className="text-[10px] text-yellow-300 font-bold uppercase">★ 10% Discount Applied</span>
              </div>
            </div>
            <div className="text-right">
              {/* Yahan Subtotal + Fees - 10% Discount dikh raha hai */}
              <span className="block font-bold text-lg leading-none">₹{onlinePreviewTotal.toFixed(2)}
</span>
              <span className="text-[10px] line-through opacity-50">
              ₹{(subtotal - couponDiscount).toFixed(2)}

              </span>
            </div>
          </div>
        </button>

        {/* COD - EXTRA CHARGE KE SAATH */}
        <button 
          onClick={() => {
            setIsCOD(true); 
            setPaymentMethod("cod");
            setShowCODSummary(true);
          }} 
          className="w-full bg-white border-2 border-[#C06014] text-[#C06014] p-4 rounded-2xl flex items-center justify-between active:scale-[0.98] transition-all shadow-sm"
        >
          <div className="flex items-center gap-2 text-left">
            <FaMoneyBillWave className="text-sm opacity-80"/>
            <span className="font-medium text-sm text-gray-700">COD</span>
          </div>
          
          <div className="text-right flex flex-col items-end">
             <span className="text-[15px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-full mb-1">
               + ₹{codFee} FEE
             </span>
             {/* Yahan bina discount aur +52 charge ke saath total hai */}
             <span className="font-bold text-lg text-gray-900 leading-none">
                ₹{Math.ceil(codTotal)}

             </span>
          </div>
        </button>
      
        <p className="text-[10px] text-center text-gray-400 mt-2 px-6">
          Pay online to avoid extra COD charges and get your cosmic tools at the best price.
        </p>
        </div>
      
    )}
                    {/* OPTION 2: COD CONFIRMATION SUMMARY */}
                    {showCODSummary && (
                        <div className="bg-orange-50 p-5 rounded-xl border border-orange-200 animate-in fade-in slide-in-from-bottom-4">
                            <h3 className="font-bold text-[#C06014] mb-4 text-lg border-b border-orange-200 pb-2">COD Order Summary</h3>
                            
                            <div className="space-y-2 text-sm text-gray-700 mb-4">
                                <div className="flex justify-between">
                                    <span>Subtotal</span>
                                    <span>₹{subtotal.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-green-600">
  <span>Shipping</span>
  <span>FREE</span>
</div>

                               
                                <div className="flex justify-between text-orange-700 font-medium">
                                    <span>COD Handling Charges</span>
                                    <span>+ ₹{codFee}</span>
                                </div>
                                {couponDiscount > 0 && (
                                    <div className="flex justify-between text-green-700">
                                        <span>Discount</span>
                                        <span>- ₹{couponDiscount}</span>
                                    </div>
                                )}
                                
                                

                                <div className="border-t border-orange-200 pt-2 mt-2 flex justify-between font-bold text-lg text-[#003D33]">
                                    <span>Total Payable</span>
                                    <span>₹{finalAmount}</span>
                                </div>
                            </div>
                            
                            <button 
                                onClick={() => placeOrder("cod")} 
                                disabled={loading}
                                className="w-full bg-[#C06014] text-white py-3 rounded-lg font-bold shadow-lg hover:shadow-xl transition-all"
                            >
                                {loading ? "Processing..." : `Place COD Order (₹${finalAmount})`}
                            </button>
                            
                            <button 
                                onClick={() => {
                                    setShowCODSummary(false);
                                    setIsCOD(false);
                                }}
                                className="w-full text-center text-sm text-gray-500 mt-3 underline"
                            >
                                Change Payment Method
                            </button>
                        </div>
                    )}
                
              </div>
      )}
            </div>

            {/* Price Summary Bar */}
            
<div className="absolute bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 z-[99999]">
  <div onClick={() => setShowPriceDetails(!showPriceDetails)} className="flex justify-between cursor-pointer">
    <span className="font-bold text-[#003D33]">Total: ₹{finalAmount}</span>
    <span className="text-[#C06014] text-sm">{showPriceDetails ? "Hide Details ▲" : "View Details ▼"}</span>
  </div>
  
  <AnimatePresence>
    {showPriceDetails && (
      <motion.div initial={{height:0}} animate={{height:'auto'}} exit={{height:0}} className="overflow-hidden bg-gray-50 mt-2 rounded text-sm p-3 space-y-2">
        <div className="flex justify-between"><span>Subtotal</span><span>₹{subtotal.toFixed(2)}</span></div>
        <div className="flex justify-between text-green-600">
  <span>Shipping</span>
  <span>FREE</span>
</div>

        {isCOD && <div className="flex justify-between text-orange-700"><span>COD Handling</span><span>+₹{codFee}</span></div>}
        
        {couponDiscount > 0 && <div className="flex justify-between text-green-700"><span>Coupon Discount</span><span>-₹{couponDiscount}</span></div>}
        
       {paymentMethod === "online" && (
  <div className="flex justify-between text-blue-700">
    <span>Online Discount (10%)</span>
    <span>-₹{onlineDiscountAmount.toFixed(2)}</span>
  </div>
)}


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