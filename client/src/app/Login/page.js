"use client";
import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Phone } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { authAPI } from "../lib/auth";
import { useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { loginSuccess } from "../store/features/authSlice";

// --- Sacred Earth Theme Colors ---
const theme = {
  bg: "bg-[#F7F3E9]",
  bgSecondary: "bg-[#ECE5D3]",
  text: "text-[#7b5430]",
  textSecondary: "text-[#796243]",
  accent: "bg-[#C06014]",
  accentHover: "hover:bg-[#D47C3A]",
  border: "border-[#B2C5B2]",
  shadow: "shadow-[0_25px_50px_-12px_rgba(192,96,20,0.2)]",
};

const Login = () => {
  const [hover, setHover] = useState(false);
  const [formData, setFormData] = useState({ phone: "" });
  const [countryCode, setCountryCode] = useState("+91");

  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState();
  const inputRefs = useRef([]);
  const router = useRouter()
 const dispatch = useDispatch();
 
  // Handle input
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // ---------------- SEND OTP ----------------
  const handleSendOtp = async () => {
    if (!formData.phone) {
      toast.error("Enter phone number");
      return;
    }

    const fullPhone = `${countryCode}${formData.phone}`;

    try {
      const res = await authAPI.userFind(fullPhone);
      if (res.success === false) {
        toast.error(res.message);
        return;
      }

      const response = await authAPI.requestotp(fullPhone);

      toast.success("OTP sent successfully!");

      setOtpSent(true);
      setTimer(120);

      const interval = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      console.error(err);
      toast.error("Failed to send OTP");
    }
  };

  // Handle OTP input
  const handleOtpChange = (value, index) => {
    if (!/^[0-9]?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // ---------------- LOGIN SUBMIT ----------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.phone.trim()) {
      toast.error("Phone number is required!");
      return;
    }
    if (formData.phone.length !== 10) {
      toast.error("Please enter a valid 10-digit phone number!");
      return;
    }
    if (!otpSent) {
      toast.error("Please send OTP first!");
      return;
    }

    try {
      const enteredOtp = otp.join("");
      if (enteredOtp.length !== 6) {
        toast.error("Enter complete 6-digit OTP!");
        return;
      }

      const fullPhone = `${countryCode}${formData.phone}`;

      const userData = {
        phone: fullPhone,
        otp: enteredOtp,
      };

      const response = await authAPI.login(userData);

      if (response) {
        toast.success(response.message);
        localStorage.setItem("token", response.token);
        dispatch(loginSuccess(response.data));
        router.push("/")

      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleResendOtp = () => {
    setOtp(["", "", "", "", "", ""]);
    handleSendOtp();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#e5dece] font-[Lora]">
      <div
        className={`flex flex-col md:flex-row w-[90%] max-w-[1000px] rounded-xl overflow-hidden shadow-xl ${theme.shadow}`}
      >
        {/* Left Panel */}
        <div className="hidden md:flex flex-1 flex-col items-center justify-center text-center p-10 bg-[#f6f3e4]">
          <div className="mb-4 uppercase text-lg font-[Cagliostro] text-[#796243]">
            <h2 className="text-[#7b5430] text-3xl font-semibold">Astrova</h2>
            <p className="text-sm text-[#7b5430]">Align Your Energy</p>
          </div>

          <div className="w-full flex justify-center mb-6">
            <Image
              src="/signup.png"
              alt="Mandala"
              width={350}
              height={200}
              className="opacity-90 rounded-md object-contain"
            />
          </div>

          <p className="italic text-[#796243] max-w-[300px] text-base font-bold">
            "The map is not the territory; the stars merely guide your
            awareness."
          </p>
        </div>

        {/* Right Panel */}
        <div className="relative flex-1 flex justify-center items-center bg-[#b49a77] p-3">
          <div className="z-10 w-[90%] max-w-[650px]">
            <form onSubmit={handleSubmit} className="w-full">
              <h1 className="text-4xl font-bold text-center mt-6 text-[#7b5430] font-[Cagliostro]">
                Align Your
              </h1>
              <h1 className="text-4xl font-bold text-center text-[#7b5430] font-[Cagliostro]">
                Cosmic Path
              </h1>

              <h5 className="text-[#7b5430] font-bold text-center pb-3">
                Welcome back to your cosmic journey
              </h5>

              <div className="space-y-6 pt-[10%]">
                <div className="w-[90%] mx-auto">
                  {/* Country Code + Phone */}
                  <div className="mt-6 flex w-full items-center justify-center">
                    <div className="flex w-full overflow-hidden rounded-3xl border border-[#bba989] bg-[#f4f1e2]">
                      {/* Country Code */}
                      <select
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        className="px-4 py-3 bg-[#f4f1e2] text-[#7b5430] font-semibold focus:outline-none border-r border-[#bba989]"
                      >
                        <option value="+91">🇮🇳 +91</option>
                        <option value="+1">🇺🇸 +1</option>
                        <option value="+44">🇬🇧 +44</option>
                        <option value="+61">🇦🇺 +61</option>
                        <option value="+971">🇦🇪 +971</option>
                        <option value="+81">🇯🇵 +81</option>
                      </select>

                      {/* Phone Input */}
                      <div className="relative flex-1">
                        <input
                          type="number"
                          name="phone"
                          placeholder="Phone no."
                          value={formData.phone}
                          onChange={handleChange}
                          className="w-full px-5 py-3 pr-10 bg-[#f4f1e2] text-[#7b5430] font-medium focus:outline-none"
                        />
                        <Phone
                          size={20}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-[#C06014] opacity-80"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Send OTP Button */}
                  {!otpSent && (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      className="mt-5 w-full py-2 rounded-3xl bg-[#7b5430] text-white font-bold hover:bg-[#F7F3E9] hover:text-[#7b5430] transition-all"
                    >
                      Send OTP
                    </button>
                  )}

                  {/* OTP Inputs */}
                  {otpSent && (
                    <div className="mt-6 flex flex-col items-center">
                      <div className="flex gap-3">
                        {otp.map((digit, index) => (
                          <input
                            key={index}
                            ref={(el) => (inputRefs.current[index] = el)}
                            type="text"
                            maxLength="1"
                            value={digit}
                            onChange={(e) =>
                              handleOtpChange(e.target.value, index)
                            }
                            onKeyDown={(e) => handleKeyDown(e, index)}
                            className="w-10 h-10 text-center text-lg font-bold rounded-lg bg-[#f4f1e2] text-[#7b5430] focus:ring-2 focus:ring-[#B2C5B2]"
                          />
                        ))}
                      </div>

                      {timer > 0 ? (
                        <p className="mt-3 text-white text-sm font-semibold">
                          OTP valid for {timer}s
                        </p>
                      ) : (
                        <button
                          type="button"
                          onClick={handleResendOtp}
                          className="mt-3 text-white underline font-semibold"
                        >
                          Resend OTP
                        </button>
                      )}
                    </div>
                  )}

                  {/* LOGIN BUTTON */}
                  <button
                    type="submit"
                    onMouseEnter={() => setHover(true)}
                    onMouseLeave={() => setHover(false)}
                    className={`w-full py-3 text-lg font-bold rounded-3xl transition-all mt-[15%] ${
                      hover
                        ? "bg-[#F7F3E9] text-[#7b5430]"
                        : "bg-[#7e5833] text-white"
                    }`}
                  >
                    LOGIN
                  </button>
                </div>
              </div>

              <div className="text-center font-bold mt-9 text-[#614b2f] text-sm">
                <p>
                  Don’t have an account?
                  <Link
                    href="/Signup"
                    className="font-bold text-[#7b5430] ml-1 underline"
                  >
                    Sign up
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
