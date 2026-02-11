"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Mail, Key, User, Phone } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import { authAPI } from "../lib/auth";
import { useRouter } from "next/navigation";
import { ButtonLoader, CardLoader, SignupLoader } from "../components/Loading";

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

const Signup = () => {
  const router = useRouter();
  const [hover, setHover] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
  });

  const [countryCode, setCountryCode] = useState("+91");
  const [loading, setLoading] = useState(false)
  const [loading1, setLoading1] = useState(false);
  
  // ✅ Handle Input Changes
  useEffect(() =>{
    setLoading(true);
    setTimeout(() =>{
      setLoading(false)

    },2000)

  },[])
if (loading) return <SignupLoader/> 
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // ✅ Handle Submit with Validation
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Full Name is required!");
      return;
    }

    if (!formData.phone.trim()) {
      toast.error("Phone number is required!");
      return;
    }

    if (formData.phone.length !== 10) {
      toast.error("Please enter a valid 10-digit phone number!");
      return;
    }
    // Name validation
  const nameRegex = /^[A-Za-z\s]+$/;
  if (!formData.name.trim()) {
    toast.error("Full Name is required!");
    return;
  }

  if (!nameRegex.test(formData.name)) {
    toast.error("Name should contain only letters and spaces!");
    return;
  }

  // Phone validation
  const phoneRegex = /^[6-9]\d{9}$/;

  if (!formData.phone.trim()) {
    toast.error("Phone number is required!");
    return;
  }

  if (!phoneRegex.test(formData.phone)) {
    toast.error("Enter a valid Indian phone number starting with 6,7,8,9");
    return;
  }
    setLoading1(true)
    const fullPhone = `${countryCode}${formData.phone}`;

    try {
     
      const result = await authAPI.resigter({
        name: formData.name,
        phone: fullPhone,
      });
      if (result) {

        toast.success(result.message);
        setLoading1(false)
        setTimeout(() => {
          router.push("/Login");
        }, 2000);
      }
    } catch (err) {
      toast.error(err.message);
       setLoading1(false)
    }
  };
const handleNameChange = (e) => {
  const value = e.target.value;
  if (/^[A-Za-z\s]*$/.test(value)) {
    setFormData({ ...formData, name: value });
  }
};

  return (
    <> 
   
    <div
      className={`min-h-screen flex items-center justify-center bg-[#e5dece] font-[Lora]`}
    >
      <div
        className={`flex flex-col md:flex-row w-[90%] max-w-[1000px] rounded-xl overflow-hidden shadow-xl ${theme.shadow} max-md:w-[100%]`}
      >
        {/* Left Panel */}
        <div
          className={`hidden md:flex flex-1 flex-col items-center justify-center text-center p-10 bg-[#f6f3e4]`}
        >
          <div className="mb-4 uppercase text-lg font-[Cagliostro] text-[#796243]">
            <h2 className="text-[#7b5430] text-3xl font-semibold">MyAstrova</h2>
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
        <div className="relative flex-1 flex justify-center items-center  bg-[#b49a77] p-3">
          <div className="z-10 w-[90%] h-full max-w-[650px] flex items-center max-md:w-[100%]">
            <form onSubmit={handleSubmit} className="w-full h-[90%]">
              <h1 className="text-4xl font-bold text-center mt-6 text-[#7b5430] font-[Cagliostro]">
                Align Your
              </h1>
              <h1 className="text-4xl font-bold text-center text-[#7b5430] font-[Cagliostro]">
                Cosmic Path
              </h1>
              <h5 className="text-[#7b5430] font-bold flex justify-center pb-3">
                welcome back to your cosmic journey
              </h5>

              <div className="space-y-6 pt-[10%] w-full flex justify-center">
                <div className="w-[90%] max-md:w-[100%]">
                  {/* Name Input */}
                  <div className="relative">
                    <input
                      type="text"
                      name="name"
                      placeholder="Full Name"
                      value={formData.name}
                      onChange={handleNameChange}
                      className="mt-2 w-full px-6 py-3 pr-10 rounded-3xl bg-[#f4f1e2] focus:outline-none focus:ring-2 focus:ring-[#B2C5B2] placeholder-[gray] placeholder-opacity-70"
                      minLength={3}
                    />
                    <User
                      size={20}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#C06014] opacity-80"
                    />
                  </div>

                  {/* Phone Input with Country Code */}
                <div className="mt-6 flex w-full items-center justify-center">
  <div className="flex w-full  max-w-md overflow-hidden rounded-3xl border border-[#bba989] bg-[#f4f1e2]">
    {/* Country Code Select */}
    <select
      value={countryCode}
      onChange={(e) => setCountryCode(e.target.value)}
      className="px-4 max-md:w-[25%]  max-md:px-3 max-md:py-2 max-md:text-sm py-3 bg-[#f4f1e2] text-[#7b5430] font-semibold focus:outline-none border-r border-[#bba989]"
    >
      <option value="+91">🇮🇳 +91</option>
      
    </select>

    {/* Phone Input */}
    <div className="relative flex-1">
      <input
        type="tel"
        name="phone"
        placeholder="Phone no."
        value={formData.phone}
        onChange={handleChange}
        className="w-full px-5 py-3 pr-10 bg-[#f4f1e2] text-[#7b5430] font-medium focus:outline-none placeholder-gray-500 placeholder-opacity-70"
      />
      <Phone
        size={20}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-[#C06014] opacity-80"
      />
    </div>
  </div>
</div>

                  {/* Submit Button */}
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
                  {loading1?<ButtonLoader text="creating account..."/>:'SIGNUP'}
                  </button>
                </div>
              </div>

              <div className="text-center font-bold mt-9 text-[#614b2f] text-sm">
                <p>
                  Already have an account?{" "}
                  <Link
                    href="/Login"
                    className="font-bold text-[#7b5430] ml-1 underline"
                  >
                    Login
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default Signup;
