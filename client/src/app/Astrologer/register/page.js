"use client";
import { useEffect, useState } from "react";
import api from "../../lib/api";
import toast from "react-hot-toast";
import Link from "next/link";
import { FaUpload, FaCamera, FaFileAlt } from "react-icons/fa";

export default function AstrologerRegister() {
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [image, setImage] = useState(null);
  const [certFile, setCertFile] = useState(null);
  const [verificationDocs, setVerificationDocs] = useState([]);

 const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    age: "",
    gender: "",
    bio: "",
    expertise: "",
    languages: "",
    experienceYears: "",
    education: "",
    achievements: "",
    certificationTitle: "",
    availability: "CHAT",
    chatPerMinute: "",
    callPerMinute: "",
    // Removed meetRate field
    bankName: "",
    bankAccountNumber: "",
    ifsc: "",
  });

  const [otp, setOtp] = useState("");
const [otpSent, setOtpSent] = useState(false);
const [phoneVerified, setPhoneVerified] = useState(false);


  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleCertFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCertFile(file);
  };

  const handleVerificationDocs = (e) => {
    const files = Array.from(e.target.files);
    setVerificationDocs(files);
  };

  const validate = () => {
    if (!form.fullName.trim()) return "Full name required";
    if (!form.email.trim()) return "Email required";
    if (!form.phone.trim()) return "Phone required";
    if (!form.bio.trim()) return "Bio required";
    if (!form.expertise.trim()) return "Expertise required";
    if (!form.languages.trim()) return "Languages required";
    if (!phoneVerified) return "Please verify your phone number first";

    // Chat rate validation for CHAT, BOTH, ALL
    if ((form.availability === "CHAT" || form.availability === "BOTH" || form.availability === "ALL") && !form.chatPerMinute)
      return "Chat per-minute rate required";
    
    // Call rate validation for CALL, BOTH, ALL
    if ((form.availability === "CALL" || form.availability === "BOTH" || form.availability === "ALL") && !form.callPerMinute)
      return "Call per-minute rate required";
    
    // No rate validation for MEET option
    
    return null;
  };

  const submit = async () => {
    const error = validate();
    if (error) return toast.error(error);

    const fd = new FormData();

    Object.entries({
      fullName: form.fullName,
      email: form.email,
      phone: form.phone,
      age: Number(form.age || 0),
      gender: form.gender,
      bio: form.bio,
      experienceYears: Number(form.experienceYears || 0),
      education: form.education,
      availability: form.availability,
      chatPerMinute: Number(form.chatPerMinute || 0),
      callPerMinute: Number(form.callPerMinute || 0),
      // Removed meetRate from submission
      bankName: form.bankName,
      bankAccountNumber: form.bankAccountNumber,
      ifsc: form.ifsc,
      certificationTitle: form.certificationTitle,
    }).forEach(([k, v]) => fd.append(k, v));

    fd.append(
      "expertise",
      JSON.stringify(form.expertise.split(",").map((e) => e.trim()))
    );

    fd.append(
      "languages",
      JSON.stringify(form.languages.split(",").map((l) => l.trim()))
    );

    if (form.achievements.trim()) {
      fd.append(
        "achievements",
        JSON.stringify(form.achievements.split(",").map((a) => a.trim()))
      );
    }

    if (image) fd.append("profileImage", image);
    if (certFile) fd.append("certificationFile", certFile);
    
    verificationDocs.forEach((doc, index) => {
      fd.append(`verificationDocuments`, doc);
    });

    try {
      setLoading(true);
      await api.post("/astrologer/register", fd);
      toast.success("✅ Registration submitted for admin approval");
      // Reset form after success
      setForm({
        fullName: "",
        email: "",
        phone: "",
        age: "",
        gender: "",
        bio: "",
        expertise: "",
        languages: "",
        experienceYears: "",
        education: "",
        achievements: "",
        certificationTitle: "",
        availability: "CHAT",
        chatPerMinute: "",
        callPerMinute: "",
        bankName: "",
        bankAccountNumber: "",
        ifsc: "",
      });
      setImagePreview(null);
      setImage(null);
      setCertFile(null);
      setVerificationDocs([]);
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };
const sendOTP = async () => {
  if (!form.phone) return toast.error("Enter phone number first");

  try {
    await api.post("/astrologer/send-otp", { phone: form.phone });
    setOtpSent(true);
    toast.success("OTP sent to phone");
  } catch (err) {
    toast.error("Failed to send OTP");
  }
};
const verifyOTP = async () => {
  if (!otp) return toast.error("Enter OTP");

  try {
    await api.post("/astrologer/verify-otp", {
      phone: form.phone,
      otp,
    });

    setPhoneVerified(true);
    toast.success("Phone verified successfully");
  } catch (err) {
    toast.error(err.response?.data?.message || "Invalid OTP");
  }
};

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F7F3E9] to-[#F0EBDF] py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-[#E8DFD8]">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-[#003D33] to-[#00695C] p-6 text-center">
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              Astrologer Registration
            </h1>
            <p className="text-white/80 mt-2">
              Join our network of expert astrologers and start helping people
            </p>
          </div>

          <div className="p-6 md:p-8">
            {/* Section 1: Personal Information */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-[#003D33] mb-4 pb-2 border-b border-[#E8DFD8]">
                Personal Information
              </h2>
              
              {/* Profile Image Upload */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Profile Image <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center space-x-6">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full border-4 border-white shadow-md overflow-hidden bg-gray-100">
                      {imagePreview ? (
                        <img 
                          src={imagePreview} 
                          alt="Profile Preview" 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <FaCamera size={32} />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex-1">
                    <label className="flex items-center justify-center px-4 py-2 bg-[#003D33] text-white rounded-lg cursor-pointer hover:bg-[#002822] transition duration-300">
                      <FaUpload className="mr-2" />
                      Upload Profile Photo
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleImage}
                        className="hidden"
                      />
                    </label>
                    <p className="text-xs text-gray-500 mt-2">
                      Recommended: Square image, 500x500px, Max 2MB
                    </p>
                  </div>
                </div>
              </div>

              {/* Personal Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="fullName"
                    placeholder="Enter your full name"
                    value={form.fullName}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#003D33] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#003D33] focus:border-transparent"
                  />
                </div>

               <div>
  <label className="block text-sm font-semibold text-gray-700 mb-1">
    Phone Number <span className="text-red-500">*</span>
  </label>

  <div className="flex gap-2">
    <input
      name="phone"
      value={form.phone}
      placeholder="phone no. format +91265656..."
      onChange={handleChange}
      disabled={phoneVerified}
      className="flex-1 border rounded-lg px-4 py-3"
    />

    {!phoneVerified && (
      <button
        type="button"
        onClick={sendOTP}
        className="px-4 bg-[#003D33] text-white rounded-lg"
      >
        Verify
      </button>
    )}
  </div>

  {otpSent && !phoneVerified && (
    <div className="mt-3 flex gap-2">
      <input
        placeholder="Enter OTP"
        value={otp}
        onChange={(e) => setOtp(e.target.value)}
        className="flex-1 border rounded-lg px-4 py-2"
      />
      <button
        type="button"
        onClick={verifyOTP}
        className="px-4 bg-green-600 text-white rounded-lg"
      >
        Confirm
      </button>
    </div>
  )}

  {phoneVerified && (
    <p className="text-green-600 text-sm mt-1">✔ Phone verified</p>
  )}
</div>


                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Age
                  </label>
                  <input
                    name="age"
                    type="number"
                    placeholder="Enter your age"
                    value={form.age}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#003D33] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Gender
                  </label>
                  <select
                    name="gender"
                    value={form.gender}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#003D33] focus:border-transparent"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Bio / Introduction <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="bio"
                  placeholder="Tell us about yourself, your journey in astrology, and your approach..."
                  value={form.bio}
                  onChange={handleChange}
                  rows={4}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#003D33] focus:border-transparent"
                />
              </div>
            </div>

            {/* Section 2: Professional Information */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-[#003D33] mb-4 pb-2 border-b border-[#E8DFD8]">
                Professional Information
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Expertise (comma separated) <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="expertise"
                    placeholder="e.g., Vedic Astrology, Tarot Reading, Numerology, Palmistry"
                    value={form.expertise}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#003D33] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Languages Known (comma separated) <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="languages"
                    placeholder="e.g., English, Hindi, Tamil, Telugu"
                    value={form.languages}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#003D33] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Years of Experience
                  </label>
                  <input
                    name="experienceYears"
                    type="number"
                    placeholder="Enter years of experience"
                    value={form.experienceYears}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#003D33] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Education / Certification
                  </label>
                  <input
                    name="education"
                    placeholder="e.g., MBA in Astrology, Certified Vedic Astrologer"
                    value={form.education}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#003D33] focus:border-transparent"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Achievements & Recognition
                </label>
                <textarea
                  name="achievements"
                  placeholder="List your achievements, awards, publications (comma separated)"
                  value={form.achievements}
                  onChange={handleChange}
                  rows={3}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#003D33] focus:border-transparent"
                />
              </div>
            </div>

            {/* Section 3: Documents & Certification */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-[#003D33] mb-4 pb-2 border-b border-[#E8DFD8]">
                Documents & Certification
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Certification */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Certification Details
                  </label>
                  <input
                    name="certificationTitle"
                    placeholder="Certification Title"
                    value={form.certificationTitle}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 mb-3 focus:outline-none focus:ring-2 focus:ring-[#003D33] focus:border-transparent"
                  />
                  
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Upload Certification (PDF/Image)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-[#003D33] transition duration-300">
                    <FaFileAlt className="mx-auto text-gray-400 mb-2" size={32} />
                    <label className="cursor-pointer">
                      <span className="text-[#003D33] font-medium">Click to upload</span> or drag and drop
                      <input 
                        type="file" 
                        accept="image/*,.pdf"
                        onChange={handleCertFile}
                        className="hidden"
                      />
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      Max file size: 5MB
                    </p>
                    {certFile && (
                      <p className="text-sm text-green-600 mt-2">
                        ✓ {certFile.name}
                      </p>
                    )}
                  </div>
                </div>

                {/* Verification Documents */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Identity Verification Documents <span className="text-red-500">*</span>
                  </label>
                  <p className="text-sm text-gray-600 mb-3">
                    Upload Aadhar Card, PAN Card, or other government ID proofs
                  </p>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-[#003D33] transition duration-300">
                    <FaUpload className="mx-auto text-gray-400 mb-2" size={32} />
                    <label className="cursor-pointer">
                      <span className="text-[#003D33] font-medium">Upload Documents</span>
                      <input 
                        type="file" 
                        multiple
                        accept="image/*,.pdf"
                        onChange={handleVerificationDocs}
                        className="hidden"
                      />
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      Multiple files allowed. Max 10MB each
                    </p>
                    {verificationDocs.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm font-medium">Uploaded files:</p>
                        <ul className="text-xs text-gray-600 mt-1 space-y-1">
                          {verificationDocs.map((doc, idx) => (
                            <li key={idx}>✓ {doc.name}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Section 4: Service & Availability */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-[#003D33] mb-4 pb-2 border-b border-[#E8DFD8]">
                Service & Availability
              </h2>
              
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Service Availability <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <select
                    name="availability"
                    value={form.availability}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#003D33] focus:border-transparent"
                  >
                    <option value="CHAT">Chat Only</option>
                    <option value="CALL">Call Only</option>
                    <option value="BOTH">Chat + Call</option>
                    <option value="MEET">Meet Only (In-person meetings)</option>
                    <option value="ALL">All Services (Chat + Call + Meet)</option>
                  </select>
                  
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                    <h4 className="font-medium text-blue-800 mb-1">Availability Info</h4>
                    <p className="text-sm text-blue-700">
                      {form.availability === "MEET" 
                        ? "For Meet option, clients can contact you for in-person meetings. No online rates required."
                        : form.availability === "ALL"
                        ? "You'll be available for all services: Chat, Call, and Meet"
                        : form.availability === "BOTH"
                        ? "You'll be available for Chat and Call services"
                        : form.availability === "CHAT"
                        ? "You'll be available for Chat service only"
                        : "You'll be available for Call service only"
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Rate Inputs - Only show for Chat and Call */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Chat Rate - Show for CHAT, BOTH, ALL */}
                {(form.availability === "CHAT" || form.availability === "BOTH" || form.availability === "ALL") && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Chat Rate (₹ per minute) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-gray-500">₹</span>
                      <input
                        name="chatPerMinute"
                        type="number"
                        placeholder="e.g., 10"
                        value={form.chatPerMinute}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg pl-8 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#003D33] focus:border-transparent"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Rate for chat consultations per minute</p>
                  </div>
                )}

                {/* Call Rate - Show for CALL, BOTH, ALL */}
                {(form.availability === "CALL" || form.availability === "BOTH" || form.availability === "ALL") && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">
                      Call Rate (₹ per minute) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-3 text-gray-500">₹</span>
                      <input
                        name="callPerMinute"
                        type="number"
                        placeholder="e.g., 20"
                        value={form.callPerMinute}
                        onChange={handleChange}
                        className="w-full border border-gray-300 rounded-lg pl-8 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#003D33] focus:border-transparent"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Rate for call consultations per minute</p>
                  </div>
                )}

                {/* Meet Info - Show for MEET and ALL */}
                {(form.availability === "MEET" || form.availability === "ALL") && (
                  <div className="col-span-1 md:col-span-2">
                    <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                      <h4 className="font-medium text-amber-800 mb-2">📅 Meet Availability</h4>
                      <p className="text-sm text-amber-700">
                        For in-person meetings, you'll discuss rates directly with clients. 
                        You can specify your meeting preferences (location, timing, etc.) in your profile after approval.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Section 5: Bank Details */}
            <div className="mb-8">
              <h2 className="text-xl font-bold text-[#003D33] mb-4 pb-2 border-b border-[#E8DFD8]">
                Bank Details for Payments
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Bank Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="bankName"
                    placeholder="Enter bank name"
                    value={form.bankName}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#003D33] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Account Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="bankAccountNumber"
                    placeholder="Enter account number"
                    value={form.bankAccountNumber}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#003D33] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    IFSC Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="ifsc"
                    placeholder="Enter IFSC code"
                    value={form.ifsc}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#003D33] focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={submit}
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#003D33] to-[#00695C] text-white font-semibold py-4 rounded-lg hover:from-[#002822] hover:to-[#005048] transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                  </svg>
                  Submitting for Approval...
                </span>
              ) : (
                "Submit Registration for Approval"
              )}
            </button>

            {/* Info & Login Links */}
            <div className="mt-6 text-center space-y-2">
              <p className="text-sm text-gray-600">
                Your application will be reviewed within 3-5 business days. You'll receive login credentials via email upon approval.
              </p>
              
              <div className="flex items-center justify-center space-x-4 text-sm">
                <p className="text-gray-600">
                  Already registered?
                </p>
                <Link 
                  href="/Astrologer/login" 
                  className="text-[#C06014] font-semibold hover:text-[#A35010] hover:underline transition duration-300"
                >
                  Astrologer Login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}