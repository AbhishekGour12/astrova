"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { authAPI } from "../lib/auth";

const AstroProfileModal = ({ onClose }) => {
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    gender: "",
    dateOfBirth: "",
    birthHour: "",
    birthMinute: "",
    birthMeridiem: "",
    birthCity: "",
    birthState: "",
    birthCountry: "India",
    maritalStatus: "",
    occupation: "",
    problemAreas: {
      love: false,
      career: false,
      health: false,
      marriage: false,
      finance: false,
    },
  });

  const handleChange = (key, value) => {
    setForm({ ...form, [key]: value });
  };

  const toggleProblem = (key) => {
    setForm({
      ...form,
      problemAreas: {
        ...form.problemAreas,
        [key]: !form.problemAreas[key],
      },
    });
  };

  const handleSubmit = async () => {
    if (!form.birthHour || !form.birthMinute || !form.birthMeridiem) {
      return toast.error("Please enter complete birth time");
    }

    setLoading(true);
    try {
      await authAPI.updateAstroProfile(form);
      toast.success("Profile completed!");
      onClose();
      window.location.reload();
    } catch (err) {
      toast.error(err.message || "Failed to save profile");
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[9999] flex items-center justify-center">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto"
      >
        <h2 className="text-xl font-bold mb-4">
          Complete Your Astro Profile 🌙
        </h2>

        <div className="space-y-3">

          {/* Full Name */}
          <div>
            <label className="block text-sm font-semibold mb-1">Full Name</label>
            <input className="w-full border p-2 rounded"
              onChange={(e) => handleChange("fullName", e.target.value)} />
          </div>

          {/* Gender */}
          <div>
            <label className="block text-sm font-semibold mb-1">Gender</label>
            <select className="w-full border p-2 rounded"
              onChange={(e) => handleChange("gender", e.target.value)}>
              <option value="">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* DOB */}
          <div>
            <label className="block text-sm font-semibold mb-1">Date of Birth</label>
            <input type="date" max={new Date().toISOString().split("T")[0]} className="w-full border p-2 rounded"
              onChange={(e) => handleChange("dateOfBirth", e.target.value)} />
          </div>

          {/* Birth Time */}
          <div>
            <label className="block text-sm font-semibold mb-1">Birth Time</label>
            <div className="flex gap-2">
              <input type="number" min="1" max="12"
                placeholder="Hour"
                className="w-1/3 border p-2 rounded"
                onChange={(e) => handleChange("birthHour", e.target.value)} />

              <input type="number" min="0" max="59"
                placeholder="Minute"
                className="w-1/3 border p-2 rounded"
                onChange={(e) => handleChange("birthMinute", e.target.value)} />

              <select className="w-1/3 border p-2 rounded"
                onChange={(e) => handleChange("birthMeridiem", e.target.value)}>
                <option value="">AM/PM</option>
                <option value="AM">AM</option>
                <option value="PM">PM</option>
              </select>
            </div>
          </div>

          {/* Birth Place */}
          <div>
            <label className="block text-sm font-semibold mb-1">Birth City</label>
            <input className="w-full border p-2 rounded"
              onChange={(e) => handleChange("birthCity", e.target.value)} />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1">State</label>
            <input className="w-full border p-2 rounded"
              onChange={(e) => handleChange("birthState", e.target.value)} />
          </div>

          {/* Marital */}
          <div>
            <label className="block text-sm font-semibold mb-1">Marital Status</label>
            <select className="w-full border p-2 rounded"
              onChange={(e) => handleChange("maritalStatus", e.target.value)}>
              <option value="">Select</option>
              <option value="single">Single</option>
              <option value="married">Married</option>
              <option value="divorced">Divorced</option>
              <option value="widowed">Widowed</option>
            </select>
          </div>

          {/* Occupation */}
          <div>
            <label className="block text-sm font-semibold mb-1">Occupation</label>
            <input className="w-full border p-2 rounded"
              onChange={(e) => handleChange("occupation", e.target.value)} />
          </div>

          {/* Problem Areas */}
          <div>
            <label className="block text-sm font-semibold mb-1">Concern Areas</label>
            <div className="grid grid-cols-2 gap-2">
              {Object.keys(form.problemAreas).map((k) => (
                <button key={k}
                  onClick={() => toggleProblem(k)}
                  className={`p-2 border rounded ${form.problemAreas[k] ? "bg-[#C06014] text-white" : ""}`}>
                  {k}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-[#003D33] text-white py-3 rounded-xl mt-5"
        >
          {loading ? "Saving..." : "Complete Profile"}
        </button>
      </motion.div>
    </div>
  );
};

export default AstroProfileModal;
