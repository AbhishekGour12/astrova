"use client";
import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Phone } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { auth } from "../firebase/firebase";
import {authAPI} from '../lib/auth';



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
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState();
  const [confirmationResult, setConfirmationResult] = useState()

  // Refs for OTP input boxes
  const inputRefs = useRef([]);

  // ✅ Handle Input Changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
// ✅ Setup Recaptcha (client side only)


  // ---

  const handleSendOtp = async () => {
    
    if (!formData.phone) {
      toast.error("Enter phone number");
      return;
    }
    
   
 




    try {
      const res = await authAPI.userFind(formData.phone);
    if(res.success === false){
      toast.error(res.message);
      return;
    }

     
      

      // 2. Call the Firebase API to send the OTP
      const response = await authAPI.requestotp(formData.phone);
      if(response){
        console.log(response.message)
      }
    
      
      toast.success("OTP sent successfully!");
      setOtpSent(true)
      setTimer(60);
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

  
  // ✅ Handle OTP Input Change (Auto-focus next)
  const handleOtpChange = (value, index) => {
    if (!/^[0-9]?$/.test(value)) return; // Allow only digits

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Move to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // ✅ Handle Backspace to Move Focus Back
  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // ✅ Handle Submit with Validation
  const handleSubmit = async(e) => {
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
  
      
    const enteredOtp = otp.join("");
    if (enteredOtp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP!");
      return;
    }
    const userData = {
      phone: formData.phone,
      otp: enteredOtp
    }
    const respone = await authAPI.login(userData);
    if(respone.success){
      toast.success(respone.message);
      localStorage.setItem("token", respone.token)

    }

    // Simulate successful login
    
  };

  // ✅ Resend OTP
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

          <div className="w-full flex justify-center items-center mb-6">
            <Image
              src="/signup.png"
              alt="Detailed Celestial Mandala"
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
          <div className="z-10 w-[90%] h-full max-w-[650px] flex items-center">
            <form onSubmit={handleSubmit} className="w-full h-[90%]">
              <h1 className="text-4xl font-bold text-center mt-6 text-[#7b5430] font-[Cagliostro]">
                Align Your
              </h1>
              <h1 className="text-4xl font-bold text-center text-[#7b5430] font-[Cagliostro]">
                Cosmic Path
              </h1>
              <h5 className="text-[#7b5430] font-bold flex justify-center pb-3">
                Welcome back to your cosmic journey
              </h5>

              <div className="space-y-6 pt-[10%] w-full flex justify-center">
                <div className="w-[90%]">
                  {/* Phone Input */}
                  <div className="relative mt-6">
                    <input
                      type="number"
                      name="phone"
                      placeholder="Phone no."
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-5 py-3 pr-10 rounded-3xl border-[#825a36] bg-[#f4f1e2] focus:outline-none focus:ring-2 focus:ring-[#B2C5B2] placeholder-[gray] placeholder-opacity-70"
                    />
                    <Phone
                      size={20}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#C06014] opacity-80"
                    />
                  </div>
                  {/* 1. reCAPTCHA Container - MUST have the ID 'recaptcha-container' */}
                 

                  {/* Send OTP / Resend OTP */}
                  {!otpSent && (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      className="mt-5 w-full py-2 rounded-3xl bg-[#7b5430] text-white font-bold hover:bg-[#F7F3E9] hover:text-[#7b5430] transition-all"
                    >
                      Send OTP
                    </button>
                  )}

                  {/* OTP Input Boxes */}
                  {otpSent && (
                    <div className="mt-6 flex flex-col items-center">
                      <div className="flex gap-3 justify-center">
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
                            className="w-10 h-10 text-center text-lg font-bold rounded-lg bg-[#f4f1e2] text-[#7b5430] focus:ring-2 focus:ring-[#B2C5B2] outline-none"
                          />
                        ))}
                      </div>

                      {/* Timer / Resend OTP */}
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

                  {/* Login Button */}
                  <button
                    type="submit"
                    onMouseEnter={() => setHover(true)}
                    onMouseLeave={() => setHover(false)}
                    className={`w-full py-3 text-lg font-bold rounded-3xl border-none cursor-pointer transition-all duration-300 mt-[15%] ${
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
                  Don’t have an account?{" "}
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
