"use client";
import { useEffect, useState } from "react";
import {
  FaStar,
  FaComments,
  FaPhone,
  FaWallet,
} from "react-icons/fa";
import { useRouter } from "next/navigation";
import api from "../lib/api";
import toast from "react-hot-toast";

export default function AstrologerList() {
  const [astrologers, setAstrologers] = useState([]);
  const [wallet, setWallet] = useState(0);
  const router = useRouter();

  
  useEffect(() => {
  fetchData();
  const interval = setInterval(fetchData, 15000); // every 15 sec
  return () => clearInterval(interval);
}, []);


  const fetchData = async () => {
    try {
      const astroRes = await api.get("/astrologer");
      setAstrologers(astroRes.data || []);

      const walletRes = await api.get("/auth/wallet");
      setWallet(walletRes.data?.balance || 0);
    } catch (err) {
      console.error(err.message);
    }
  };

  /* ================= WALLET RECHARGE ================= */
  const handleWalletRecharge = async () => {
    const amount = prompt("Enter recharge amount (₹)");
    if (!amount || Number(amount) <= 0) return;

    try {
      const orderRes = await api.post("/payment/create-order", {
        amount: Number(amount),
      });

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY,
        amount: orderRes.data.amount,
        currency: "INR",
        name: "MyAstrova Wallet",
        description: "Wallet Recharge",
        order_id: orderRes.data.id,

        handler: async (response) => {
          const verifyRes = await api.post("/payment/verify", {
            razorpay_order_id: orderRes.data.id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          });

          if (!verifyRes.data.success) {
            toast.error("Payment verification failed");
            return;
          }

          const walletRes = await api.post("/auth/addMoneyToWallet", {
            amount: Number(amount),
          });

          setWallet(walletRes.data.balance);
          toast.success("Wallet recharged successfully 💰");
        },

        theme: { color: "#C06014" },
        modal: {
          ondismiss: () => toast.error("Payment cancelled"),
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      toast.error("Something went wrong");
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F3E9] px-4 sm:px-6 lg:px-10 py-6 relative">

    


     {/* ================= HEADER + WALLET ================= */}
<div className="mb-8 mt-32">

  {/* TOP ROW */}
  <div className="flex flex-col sm:flex-row
                  items-start sm:items-center
                  justify-between gap-4">

    {/* TITLE */}
    <div>
      <h1 className="text-2xl md:text-3xl
                     font-serif font-bold text-[#003D33]">
        Consult Our Astrologers
      </h1>
      <p className="text-sm text-[#00695C] mt-1">
        Find guidance through ancient wisdom
      </p>
    </div>

    {/* WALLET */}
    <button
      onClick={handleWalletRecharge}
      className="flex items-center gap-2
                 bg-[#003D33] text-white
                 px-4 py-2 rounded-full
                 hover:bg-[#00695C]
                 transition shadow-md"
    >
      <FaWallet />
      <span className="text-sm font-medium">
        ₹ {wallet}
      </span>
    </button>

  </div>
</div>


      {/* ================= ASTROLOGER GRID ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {astrologers.map((a) => (
          <div
            key={a._id}
            className="bg-white rounded-2xl p-5
                       border border-[#B2C5B2]/60
                       shadow-[0_10px_25px_rgba(192,96,20,0.15)]
                       hover:shadow-[0_14px_30px_rgba(192,96,20,0.25)]
                       transition-all duration-300"
          >
            {/* IMAGE */}
            <div className="relative flex justify-center">
  <img
    src={`${process.env.NEXT_PUBLIC_API}${a.profileImageUrl}`}
    alt={a.fullName}
    className="w-20 h-20 rounded-full object-cover
               border-2 border-[#C06014] shadow"
  />

  {a.isBusy && (
    <span className="absolute -bottom-1 px-2 py-[2px]
                     text-[10px] font-semibold
                     bg-red-600 text-white
                     rounded-full shadow">
      BUSY
    </span>
  )}
</div>


            {/* NAME */}
            <h3 className="text-center font-serif font-bold text-[#003D33] mt-3">
              {a.fullName}
            </h3>

            {/* BIO */}
            <p className="text-sm text-center text-[#00695C] mt-1">
              {a.bio?.slice(0, 70)}...
            </p>

            {/* RATING */}
            <div className="flex justify-center items-center gap-1 mt-2 text-[#C06014]">
              <FaStar />
              <span className="text-sm font-medium">
                {a.averageRating || "New"}
              </span>
            </div>

            {/* PRICING */}
            {["CHAT", "BOTH"].includes(a.availability) && (
              <p className="text-center mt-2 text-sm text-[#003D33]">
                💬 ₹{a.pricing?.chatPerMinute}/min
              </p>
            )}

            {["CALL", "BOTH"].includes(a.availability) && (
              <p className="text-center text-sm text-[#003D33]">
                📞 ₹{a.pricing?.callPerMinute}/min
              </p>
            )}

            {/* ACTIONS */}
            <div className="mt-4 space-y-2">
              {/* CHAT */}
             <button
  onClick={() => router.push(`/astrologers/${a._id}`)}
  disabled={
    !["CHAT", "BOTH"].includes(a.availability) || a.isBusy
  }
  className={`w-full flex items-center justify-center gap-2
    py-2.5 rounded-xl font-medium transition
    ${
      ["CHAT", "BOTH"].includes(a.availability) && !a.isBusy
        ? "bg-[#C06014] text-white hover:bg-[#D47C3A]"
        : "bg-[#ECE5D3] text-gray-400 cursor-not-allowed"
    }`}
>
  <FaComments className="text-lg" />
  <span>{a.isBusy ? "Busy" : "Chat Now"}</span>
</button>


              {/* CALL */}
              <button
                disabled={!["CALL", "BOTH"].includes(a.availability)}
                className={`w-full flex items-center justify-center gap-2
                  py-2.5 rounded-xl font-medium transition
                  ${
                    ["CALL", "BOTH"].includes(a.availability)
                      ? "bg-[#00695C] text-white hover:bg-[#005247]"
                      : "bg-[#ECE5D3] text-gray-400 cursor-not-allowed"
                  }`}
              >
                <FaPhone className="text-lg" />
                <span>Call</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
