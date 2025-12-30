"use client";
import { useEffect, useState } from "react";
import api from "../../lib/api";
import toast from "react-hot-toast";
import Link from "next/link";

export default function AstrologerRegister() {
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [image, setImage] = useState(null);
  const [certFile, setCertFile] = useState(null);

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

    bankName: "",
    bankAccountNumber: "",
    ifsc: "",
  });

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

  const validate = () => {
    if (!form.fullName.trim()) return "Full name required";
    if (!form.email.trim()) return "Email required";
    if (!form.phone.trim()) return "Phone required";
    if (!form.bio.trim()) return "Bio required";
    if (!form.expertise.trim()) return "Expertise required";
    if (!form.languages.trim()) return "Languages required";

    if (
      (form.availability === "CHAT" || form.availability === "BOTH") &&
      !form.chatPerMinute
    )
      return "Chat per-minute rate required";

    if (
      (form.availability === "CALL" || form.availability === "BOTH") &&
      !form.callPerMinute
    )
      return "Call per-minute rate required";

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

    try {
      setLoading(true);
      await api.post("/astrologer/register", fd);
      toast.success("✅ Registration submitted for admin approval");
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F3E9] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl p-6 border">

        <h2 className="text-2xl font-bold text-center text-[#003D33]">
          Astrologer Registration
        </h2>

        {/* PROFILE IMAGE */}
        <div className="mt-4">
          <label className="text-sm font-medium">Profile Image</label>
          <input type="file" accept="image/*" onChange={handleImage} />
          {imagePreview && (
            <img src={imagePreview} className="mt-2 w-24 h-24 rounded-lg object-cover" />
          )}
        </div>

        {/* BASIC INFO */}
        <div className="grid md:grid-cols-2 gap-3 mt-4">
          {["fullName", "email", "phone", "age"].map((f) => (
            <input
              key={f}
              name={f}
              placeholder={f.replace(/([A-Z])/g, " $1")}
              value={form[f]}
              onChange={handleChange}
              className="border rounded px-3 py-2"
            />
          ))}
        </div>

        <select name="gender" value={form.gender} onChange={handleChange}
          className="border rounded px-3 py-2 w-full mt-3">
          <option value="">Select Gender</option>
          <option>Male</option>
          <option>Female</option>
          <option>Other</option>
        </select>

        <textarea name="bio" placeholder="Short bio"
          value={form.bio} onChange={handleChange}
          className="border rounded px-3 py-2 w-full mt-3" rows={3} />

        <input name="expertise" placeholder="Expertise (Vedic, Tarot)"
          value={form.expertise} onChange={handleChange}
          className="border rounded px-3 py-2 w-full mt-3" />

        <input name="languages" placeholder="Languages (English, Hindi)"
          value={form.languages} onChange={handleChange}
          className="border rounded px-3 py-2 w-full mt-3" />

        {/* OPTIONAL PROFESSIONAL INFO */}
        <input name="experienceYears" placeholder="Years of Experience (Optional)"
          onChange={handleChange} className="border rounded px-3 py-2 w-full mt-3" />

        <input name="education" placeholder="Education / Certification Authority (Optional)"
          onChange={handleChange} className="border rounded px-3 py-2 w-full mt-3" />

        <input name="achievements" placeholder="Achievements (comma separated)"
          onChange={handleChange} className="border rounded px-3 py-2 w-full mt-3" />

        {/* CERTIFICATION */}
        <input name="certificationTitle" placeholder="Certification Title (Optional)"
          onChange={handleChange} className="border rounded px-3 py-2 w-full mt-3" />

        <input type="file" accept="image/*,.pdf"
          onChange={handleCertFile} className="mt-2" />

        {/* AVAILABILITY */}
        <select name="availability" value={form.availability}
          onChange={handleChange}
          className="border rounded px-3 py-2 w-full mt-3">
          <option value="CHAT">Chat Only</option>
          <option value="CALL">Call Only</option>
          <option value="BOTH">Chat + Call</option>
        </select>

        {(form.availability !== "CALL") && (
          <input name="chatPerMinute" placeholder="Chat ₹ per minute"
            onChange={handleChange} className="border rounded px-3 py-2 w-full mt-3" />
        )}

        {(form.availability !== "CHAT") && (
          <input name="callPerMinute" placeholder="Call ₹ per minute"
            onChange={handleChange} className="border rounded px-3 py-2 w-full mt-3" />
        )}

        {/* BANK */}
        <input name="bankName" placeholder="Bank Name" onChange={handleChange}
          className="border rounded px-3 py-2 w-full mt-3" />
        <input name="bankAccountNumber" placeholder="Account Number" onChange={handleChange}
          className="border rounded px-3 py-2 w-full mt-3" />
        <input name="ifsc" placeholder="IFSC Code" onChange={handleChange}
          className="border rounded px-3 py-2 w-full mt-3" />

        <button onClick={submit} disabled={loading}
          className="mt-6 w-full bg-[#003D33] text-white py-2 rounded-lg">
          {loading ? "Submitting..." : "Submit for Approval"}
        </button>

        <p className="text-center text-sm mt-3 text-[#00695C]">
          Password will be generated after admin approval
        </p>

        <p className="text-center mt-2 text-sm">
          Already registered?{" "}
          <Link href="/Astrologer/login" className="text-[#C06014] font-medium">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}
