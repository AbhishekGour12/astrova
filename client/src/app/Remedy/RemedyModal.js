"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import api from "../lib/api";
import { FiX, FiUser, FiMail, FiPhone, FiAlertCircle, FiCalendar } from "react-icons/fi";

export default function RemedyModal({ remedy, onClose }) {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    problem: "",
    message: "",
    birthDate: ""
  });
  

useEffect(() => {
  document.body.style.overflow = "hidden";
  return () => {
    document.body.style.overflow = "auto";
  };
}, []);

  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const loadRazorpay = () =>
    new Promise(resolve => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const validateForm = () => {
    if (!form.name.trim()) {
      toast.error("Please enter your name");
      return false;
    }
    if (!form.email.trim() || !/^\S+@\S+\.\S+$/.test(form.email)) {
      toast.error("Please enter a valid email address");
      return false;
    }
    if (!form.phone.trim() || !/^\d{10}$/.test(form.phone)) {
      toast.error("Please enter a valid 10-digit phone number");
      return false;
    }
    return true;
  };

  const startPayment = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      const isLoaded = await loadRazorpay();
      if (!isLoaded) {
        toast.error("Payment gateway failed to load");
        return;
      }

      const orderRes = await api.post("/payment/create-order", {
        amount: remedy.price,
      });

      const { id: razorpayOrderId, amount } = orderRes.data;

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY,
        amount,
        currency: "INR",
        name: "MyAstrova Remedies",
        description: remedy.title,
        order_id: razorpayOrderId,

        handler: async (response) => {
          try {
            const verifyRes = await api.post("/payment/verify", {
              razorpay_order_id: razorpayOrderId,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (!verifyRes.data.success) {
              toast.error("Payment verification failed");
              return;
            }

            await api.post("/remedy/book", {
              remedyId: remedy._id,
              orderId: razorpayOrderId,
              paymentId: response.razorpay_payment_id,
              amount: remedy.price,
              name: form.name,
              email: form.email,
              phone: form.phone,
              category: form.problem,
              description: form.message,
              birthDate: form.birthDate
            });
            

            toast.success("✅ Remedy booked successfully! Our astrologer will contact you shortly.");
            onClose();
          } catch (err) {
            console.error(err);
            toast.error("❌ Payment verification failed");
          }
        },

        prefill: {
          name: form.name,
          email: form.email,
          contact: form.phone,
        },

        theme: {
          color: "#C06014",
        },

        modal: {
          ondismiss: () => {
            toast.error("Payment cancelled");
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      if (err?.response?.data?.message === "No token provided") {
        toast.error("Please login to continue");
      } else {
        toast.error("Something went wrong. Please try again");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (step === 1 && validateForm()) {
      setStep(2);
    }
  };

  const handleBack = () => {
    setStep(1);
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-[9999] backdrop-blur-sm">

      <div className="bg-white rounded-2xl w-full max-w-2xl
                max-sm:max-w-[95%]
                max-h-[90vh] overflow-y-auto shadow-2xl">

        {/* Header */}
        <div className="bg-gradient-to-r from-[#003D33] to-[#00695C] p-6">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-serif font-bold text-white
               max-sm:text-xl">
  Book {remedy.title}
</h2>

<p className="text-white/80 font-serif text-sm max-sm:text-xs">
  Complete the form below to proceed
</p>

            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/10 p-2 rounded-full transition-colors"
            >
              <FiX size={24} />
            </button>
          </div>
          
          {/* Steps Indicator */}
          <div className="flex items-center mt-6">
            <div className={`flex items-center ${step >= 1 ? 'text-white' : 'text-white/50'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? 'bg-[#C06014]' : 'bg-white/20'}`}>
                1
              </div>
             <span className="ml-2 font-serif text-sm max-sm:hidden">
  Details
</span>

            </div>
            <div className="flex-1 h-px bg-white/30 mx-4"></div>
            <div className={`flex items-center ${step === 2 ? 'text-white' : 'text-white/50'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 2 ? 'bg-[#C06014]' : 'bg-white/20'}`}>
                2
              </div>
              <span className="ml-2 font-serif text-sm max-sm:hidden">
  Payment
</span>

            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          {/* Remedy Summary */}
          <div className="bg-[#F7F3E9] rounded-xl p-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-lg overflow-hidden bg-gradient-to-br from-[#ECE5D3] to-[#F7F3E9]">
                {remedy.image && (
                  <img
                    src={`${process.env.NEXT_PUBLIC_API}${remedy.image}`}
                    alt={remedy.title}
                    className="w-full h-full object-cover"
                  />
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-serif font-bold text-[#003D33]">{remedy.title}</h3>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-2xl font-bold text-[#C06014]">₹{remedy.price}</span>
                  {remedy.duration && (
                    <span className="text-sm text-[#00695C] font-serif flex items-center gap-1">
                      <FiCalendar size={14} /> {remedy.duration}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {step === 1 ? (
            <div className="space-y-4">
             <div className="grid md:grid-cols-2 gap-4 max-sm:grid-cols-1">

                <div>
                  <label className="block text-sm font-serif text-[#003D33] mb-2 max-sm:text-xs">

                    <FiUser className="inline mr-2" size={14} />
                    Full Name *
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    className="w-full px-4 py-3 rounded-lg border border-[#B2C5B2] focus:outline-none focus:ring-2 focus:ring-[#C06014]/30 font-serif"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-sm font-serif text-[#003D33] mb-2 max-sm:text-xs">

                    <FiMail className="inline mr-2" size={14} />
                    Email Address *
                  </label>
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full px-4 py-3 rounded-lg border border-[#B2C5B2] focus:outline-none focus:ring-2 focus:ring-[#C06014]/30 font-serif"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-serif text-[#003D33] mb-2 max-sm:text-xs">

                  <FiPhone className="inline mr-2" size={14} />
                  Phone Number *
                </label>
                <input
                  type="tel"
                  placeholder="Enter your 10-digit phone number"
                  className="w-full px-4 py-3 rounded-lg border border-[#B2C5B2] focus:outline-none focus:ring-2 focus:ring-[#C06014]/30 font-serif"
                  value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-serif text-[#003D33] mb-2 max-sm:text-xs">

                  <FiAlertCircle className="inline mr-2" size={14} />
                  Main Concern / Problem *
                </label>
                <select
                  className="w-full px-4 py-3 rounded-lg border border-[#B2C5B2] focus:outline-none focus:ring-2 focus:ring-[#C06014]/30 font-serif bg-white"
                  value={form.problem}
                  onChange={e => setForm({ ...form, problem: e.target.value })}
                >
                  <option value="">Select your main concern</option>
                  <option value="Career">Career & Finance</option>
                  <option value="Health">Health & Wellness</option>
                  <option value="Relationships">Love & Relationships</option>
                  <option value="Spiritual">Spiritual Growth</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-serif text-[#003D33] mb-2 max-sm:text-xs">

                  Additional Details (Optional)
                </label>
                <textarea
                  placeholder="Share any additional information about your situation..."
                  className="w-full px-4 py-3 rounded-lg border border-[#B2C5B2] focus:outline-none focus:ring-2 focus:ring-[#C06014]/30 font-serif min-h-[100px]"
                  value={form.message}
                  onChange={e => setForm({ ...form, message: e.target.value })}
                />
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-5xl mb-4">🔮</div>
              <h3 className="text-xl font-serif font-bold text-[#003D33] mb-2">
                Ready to Complete Your Booking
              </h3>
              <p className="text-[#00695C] font-serif mb-6">
                You will be redirected to a secure payment page
              </p>
              
              <div className="bg-[#F7F3E9] rounded-xl p-4 mb-6">
                <div className="text-left">
                  <p className="font-serif text-[#003D33] mb-2">
                    <strong>Name:</strong> {form.name}
                  </p>
                  <p className="font-serif text-[#003D33] mb-2">
                    <strong>Email:</strong> {form.email}
                  </p>
                  <p className="font-serif text-[#003D33]">
                    <strong>Amount to pay:</strong> ₹{remedy.price}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Footer Buttons */}
          <div className="flex justify-between items-center mt-8 pt-6 border-t
                border-[#B2C5B2]/30
                max-sm:flex-col max-sm:gap-4">

            {step === 1 ? (
              <>
                <button
                  onClick={onClose}
                  className="px-6 py-3 rounded-lg text-[#003D33] hover:bg-[#F7F3E9] font-serif transition-colors max-sm:w-full:"
                >
                  Cancel
                </button>
                <button
                  onClick={handleNext}
                  className="bg-gradient-to-r from-[#003D33] to-[#00695C] text-white px-8 py-3 rounded-lg font-serif font-medium hover:shadow-lg transition-all"
                >
                  Continue to Payment
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleBack}
                  className="px-6 py-3 rounded-lg text-[#003D33] hover:bg-[#F7F3E9] font-serif transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={startPayment}
                  disabled={loading}
                  className="bg-gradient-to-r from-[#C06014] to-[#D47C3A] text-white px-8 py-3 rounded-lg font-serif font-medium hover:shadow-lg hover:shadow-[#C06014]/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Processing...
                    </span>
                  ) : (
                    `Pay ₹${remedy.price}`
                  )}
                </button>
              </>
            )}
          </div>

          {/* Security Note */}
          <div className="mt-4 text-center">
            <p className="text-xs text-[#00695C] font-serif">
              🔒 Secure payment powered by Razorpay • Your data is protected
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}