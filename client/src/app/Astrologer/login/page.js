"use client";
import { useState } from "react";
import { FiMail, FiLock, FiLogIn } from "react-icons/fi";
import toast from "react-hot-toast";
import api from "../../lib/api";
import { useRouter } from "next/navigation";
import Image from "next/image";
export default function AstrologerLogin() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const submitLogin = async (e) => {
    if (!form.email || !form.password) {
      toast.error("Please enter email and password");
      return;
    }

    try {
      setLoading(true);

      const res = await api.post("/astrologer/login", {
        email: form.email,
        password: form.password,
      });

      // save token
      localStorage.setItem("astrologer_token", res.data.token);
      localStorage.setItem("astrologer_id", res.data.astrologer.id)

      toast.success("Login successful");
      router.push("/Astrologer");
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
      
      {/* 3. Add Background Image Component */}
      {/* 3. Add Background Image Component */}
      <div className="absolute inset-0 z-0">
  <video
    autoPlay
    loop
    muted
    playsInline
    className="w-full h-full object-cover"
  >
    {/* CHANGE: Yaha apni video file ka path dalein (public folder me honi chahiye) */}
    <source src="/astrology-bg.mp4" type="video/mp4" />
  </video>

  {/* Overlay - Same as before to darken the video */}
  <div className="absolute inset-0 bg-black/50" />
</div>

      {/* 4. Add relative z-10 to your form container so it sits on top */}
      <div className="relative z-10 bg-white/90 w-full max-w-md rounded-2xl shadow-2xl border border-[#B2C5B2]/40 overflow-hidden backdrop-blur-sm bg-white/95">
        
        {/* Header */}
        <div className="bg-[#003D33] p-6 text-center">
          <h1 className="text-2xl font-semibold text-white font-serif">
            Astrologer Login
          </h1>
          <p className="text-white/80 text-sm mt-1">
            Access your astrologer dashboard
          </p>
        </div>

        {/* Form - (The rest of your form code remains unchanged) */}
        <div className="p-6 space-y-4">
          {/* Email */}
          <div>
            <label className="block text-sm text-[#003D33] mb-1">
              Email Address
            </label>
            <div className="relative">
              <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003D33]/30"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm text-[#003D33] mb-1">
              Password
            </label>
            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter password"
                className="w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#003D33]/30"
              />
            </div>
          </div>

          {/* Login Button */}
          <button
            onClick={submitLogin}
            disabled={loading}
            className="w-full bg-[#003D33] text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 hover:bg-[#004a3f] transition disabled:opacity-60"
          >
            {loading ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                Logging in...
              </>
            ) : (
              <>
                <FiLogIn />
                Login
              </>
            )}
          </button>

          {/* Info */}
          <div className="text-center text-xs text-gray-500 pt-2">
            Password is sent to your email after admin approval
          </div>
        </div>
      </div>
    </div>
  );
}
