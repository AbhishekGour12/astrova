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
  // GUEST CART → Load product details
  // ================================
  const [mappedCart, setMappedCart] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [showPriceDetails, setShowPriceDetails] = useState(false);
  // OFFER
const [offerDiscount, setOfferDiscount] = useState(0);

// PAYMENT TYPE
const [paymentMethod, setPaymentMethod] = useState(null); // "cod" | "online"

const platformFee = 11;


  useEffect(() => {
    const loadProducts = async () => {
      setLoadingProducts(true);

      try {
        const final = [];

        for (const item of cartItems) {
          if (item.product) {
            final.push(item); // logged-in cart
          } else {
            const p = await productAPI.getProductById(item.productId);
            final.push({ product: p, quantity: item.quantity });
          }
        }

        setMappedCart(final);
      } catch (err) {
        toast.error("Failed to load cart items");
      }

      setLoadingProducts(false);
    };

    loadProducts();
  }, [cartItems]);

  // ================================


  // ================================
  // CHECKOUT STATE
  // ================================
  const [checkoutStep, setCheckoutStep] = useState("cart");
  const [loading, setLoading] = useState(false);

  const [shippingCharge, setShippingCharge] = useState(0);

  // COUPON LOGIC
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [deliveryETA, setDeliveryETA] = useState(null);

  // ADDRESS
  const [isCOD, setIsCOD] = useState(false);
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
    fetchCart();
  }, [user]);

  // Load coupons
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
  // CALCULATIONS
  // ================================
  const subtotal = useMemo(
    () =>
      mappedCart.reduce(
        (sum, item) => sum + Number(item?.product?.price || 0) * item.quantity,
        0
      ),
    [mappedCart]
  );

  const totalWeight = useMemo(
    () =>
      mappedCart.reduce(
        (sum, item) =>
          sum + Number(item?.product?.weight || 0.2) * item.quantity,
        0
      ),
    [mappedCart]
  );

  const gst = subtotal * 0.18;
 

// Round off ONLY for COD
const rawTotal =
  subtotal +
  gst +
  shippingCharge +
  platformFee -
  discount -
  offerDiscount;

// ROUND UP ONLY FOR COD
const finalAmount =
 isCOD ? Math.ceil(rawTotal) : Number(rawTotal.toFixed(2));

const roundOff =
  paymentMethod === "cod"
    ? Math.ceil(rawTotal) - rawTotal
    : 0;



  // ================================
  // APPLY COUPON (only from payment step)
  // ================================
  const applyCoupon = async () => {
   
    
    if (!couponCode.trim()) return toast.error("Enter valid coupon.");

    setLoading(true);

    try {
      const res = await couponAPI.applyCoupon(couponCode, subtotal);
      setDiscount(res.discount);
      toast.success("Coupon applied!");
    } catch (err) {
      toast.error(err.message);
    }

    setLoading(false);
  };

  // OFFER LOGIC (Example)
// ================================
// Example: 5% offer on prepaid orders above ₹1000
useEffect(() => {
  if (paymentMethod === "online" && subtotal >= 1000) {
    setOfferDiscount(Math.round(subtotal * 0.05));
  } else {
    setOfferDiscount(0);
  }
}, [paymentMethod, subtotal]);

  // ================================
  // SHIPPING – now checks login BEFORE API call
  // ================================
  const calculateShipping = async () => {
    

    if (!address.pincode || address.pincode.length !== 6)
      return toast.error("Enter a valid pincode");

    setLoading(true);

    try {
      
    const charge = await productAPI.getShippingCharges({
  pickup_postcode: 452010,
  delivery_postcode: address.pincode,
  weight: totalWeight,
  cod: isCOD ? 1 : 0,
});

setShippingCharge(charge.shippingCharge);
console.log(charge)
// ✅ ETA handling
if (charge.estimated_delivery_days) {
  setDeliveryETA(`${charge.estimated_delivery_days} days`);
} else if (charge.etd) {
  setDeliveryETA(
    new Date(charge.etd).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
    })
  );
} else {
  setDeliveryETA(null);
}

toast.success("Delivery charges updated!");
setCheckoutStep("coupon");

    } catch (err) {
      toast.error(err.message);
    }

    setLoading(false);
  };

  // ================================
  // PAYMENT (RAZORPAY)
  // ================================
  const handleRazorpay = async () => {
    if (!user)
      return toast.error("You must login before making payment.");

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

          if (verify.success) {
            await placeOrder("online", response);
          } else toast.error("Payment verification failed!");
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

  // ================================
  // CREATE ORDER
  // ================================
  const placeOrder = async (paymentMethod, paymentDetails = null) => {
    if (!user) return toast.error("Please login to place order.");

    setLoading(true);

    try {
      await orderAPI.createOrder({
  shippingAddress: address,
  paymentMethod,
  paymentDetails,
  discount,
  offerDiscount,
  roundOff,
  isCODEnabled: isCOD,
  totalWeight,
  finalAmount,
});

      toast.success("Order placed successfully!");
     await clearCart()
      setIsCartOpen(false);
    } catch (err) {
      toast.error(err.message);
    }

    setLoading(false);
  };

  // ================================
  // BACK BUTTON
  // ================================
  const goBack = () => {
    if (checkoutStep === "address") setCheckoutStep("cart");
    else if (checkoutStep === "coupon") setCheckoutStep("address");
    else if (checkoutStep === "payment") setCheckoutStep("coupon");
  };
useEffect(() => {
  setDeliveryETA(null);
}, [address.pincode, mappedCart.length]);

  // ================================
  // UI
  // ================================
  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* OVERLAY */}
          <motion.div
            className="fixed inset-x-0 bottom-0 top-[90px] bg-black/40 z-[9998]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* CART PANEL */}
          <motion.div
           className="fixed right-0 top-[90px] h-[calc(100vh-90px)]
             max-w-md w-full bg-white shadow-xl z-[9999]"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
          >
            {/* HEADER */}
            <div className="flex justify-between p-6 border-b">
              <div className="flex items-center gap-3">
                {checkoutStep !== "cart" && (
                  <FaArrowLeft
                    className="text-xl cursor-pointer"
                    onClick={goBack}
                  />
                )}
                <h2 className="font-bold text-xl">Checkout</h2>
              </div>

              <FaTimes className="cursor-pointer text-xl" onClick={onClose} />
            </div>

            {/* BODY */}
            <div className="p-6 overflow-y-auto flex-1">

              {/* CART VIEW */}
              {checkoutStep === "cart" && (
                <>
                  {loadingProducts ? (
                    <p className="text-center text-gray-500">Loading cart...</p>
                  ) : mappedCart.length === 0 ? (
                    <p className="text-center text-gray-500">Cart is empty</p>
                  ) : (
                    mappedCart.map((item) => (
                      <div
                        key={item.product._id}
                        className="flex gap-3 bg-gray-100 p-3 rounded-lg mb-3"
                      >
                        <img
                          src={`${process.env.NEXT_PUBLIC_IMAGE_URL}${item.product.imageUrls[0]}`}
                          className="w-20 h-20 rounded-lg"
                        />

                        <div className="flex-1">
                          <p className="font-semibold">{item.product.name}</p>
                          <p>₹{item.product.price}</p>

                          <div className="flex items-center gap-2 mt-2">
                            <button
                              onClick={() =>
                                updateQuantity(
                                  item.product._id,
                                  item.quantity - 1
                                )
                              }
                              className="px-2 py-1 bg-gray-200 rounded"
                            >
                              <FaMinus />
                            </button>

                            <span>{item.quantity}</span>

                            <button
                              onClick={() =>
                                updateQuantity(
                                  item.product._id,
                                  item.quantity + 1
                                )
                              }
                              className="px-2 py-1 bg-gray-200 rounded"
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

                  {mappedCart.length > 0 && (
                    <button
                      onClick={() => {
  setCheckoutStep("address");
}}

                      className="w-full bg-[#003D33] text-white py-3 rounded-xl mt-4"
                    >
                      Proceed to Address
                    </button>
                  )}
                </>
              )}

              {/* ADDRESS STEP */}
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

                  <div className="mt-4 flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={isCOD}
                      onChange={() => setIsCOD(!isCOD)}
                      className="w-5 h-5"
                    />
                    <label className="font-semibold">Cash on Delivery</label>
                  </div>

                  <button
                    onClick={calculateShipping}
                    className="w-full mt-6 bg-[#003D33] text-white py-3 rounded-xl"
                    disabled={loading}
                  >
                    {loading ? "Calculating..." : "Calculate Shipping"}
                  </button>
                </>
              )}

              
              {/* COUPON STEP */}
{checkoutStep === "coupon" && (
  <>
    <h3 className="font-bold mb-3">Apply Coupon</h3>

    {/* Input + Apply Button */}
    <div className="flex gap-2">
      <input
        value={couponCode}
        onChange={(e) => setCouponCode(e.target.value)}
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

    {/* Available Coupons */}
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


         {/* PAYMENT STEP */}
{checkoutStep === "payment" && (
  <>
    {!user && (
      <p className="text-red-500 font-semibold mb-3">
        Please login to complete order.
      </p>
    )}

    <h3 className="font-bold mb-3">Payment Method</h3>

    <div className="space-y-3">
      {/* COD */}
      <button
  onClick={() => {
    if (!user) return toast.error("Please login");
    setPaymentMethod("cod");
    placeOrder("cod");
  }}
  className="w-full bg-gray-100 py-3 rounded-lg"
>
  Cash on Delivery
</button>

      {/* Razorpay */}
      <button
  onClick={() => {
    if (!user) return toast.error("Please login");
    setPaymentMethod("online");
    handleRazorpay();
  }}
  className="w-full bg-[#C06014] text-white py-3 rounded-lg"
>
  Pay Securely Online
</button>

    </div>

    
   {/* TOTAL PRICE BAR (Swiggy/Zomato Style) */}
<div
  className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg p-4 z-[99999]"
>
  <div
    className="flex justify-between items-center cursor-pointer"
    onClick={() => setShowPriceDetails(!showPriceDetails)}
  >
    <span className="text-lg font-semibold text-[#003D33]">
      Total: ₹{finalAmount}
    </span>

    <span className="text-sm text-[#C06014] font-semibold">
      {showPriceDetails ? "Hide Details ▲" : "View Price Details ▼"}
    </span>
  </div>

  {/* Slide Down Summary */}
  <AnimatePresence>
    {showPriceDetails && (
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{ height: "auto", opacity: 1 }}
        exit={{ height: 0, opacity: 0 }}
        className="mt-3 overflow-hidden"
      >
        <div className="bg-gray-100 p-4 rounded-lg space-y-2 text-sm">

          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>₹{subtotal}</span>
          </div>

          <div className="flex justify-between">
            <span>GST (18%)</span>
            <span>₹{gst.toFixed(2)}</span>
          </div>

          <div className="flex justify-between">
            <span>Shipping</span>
            <span>₹{shippingCharge}</span>
          </div>

          <div className="flex justify-between text-green-700 font-semibold">
            <span>Discount</span>
            <span>-₹{discount}</span>
          </div>
          {offerDiscount > 0 && (
  <div className="flex justify-between text-green-700 font-semibold">
    <span>Offer Applied</span>
    <span>-₹{offerDiscount}</span>
  </div>
)}


          <div className="flex justify-between text-[#C06014] font-semibold">
            <span>Platform Fee</span>
            <span>₹{platformFee}</span>
          </div>

          <hr />

          <div className="flex justify-between font-bold text-lg text-[#003D33]">
  <span>Grand Total</span>
  <span>₹{finalAmount}</span>
</div>
{deliveryETA && (
  <div className="flex justify-between text-sm text-[#00695C]">
    <span>Estimated Delivery</span>
    <span>{deliveryETA}</span>
  </div>
)}


        </div>
      </motion.div>
    )}
  </AnimatePresence>
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
