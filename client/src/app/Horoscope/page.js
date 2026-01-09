"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useSelector } from "react-redux";
import {
  getCurrentDasha,
  getDailyNakshatra,
  getNumerology,
  getSadeSati,
} from "../lib/astrology/horoscopeApis";
import DashaTimeline from "../components/DashaTimeline";
export default function HoroscopePage() {
  const user = useSelector((state) => state.auth.user);
  const [nakshatra, setNakshatra] = useState(null);
  const [numero, setNumero] = useState(null);
  const [loading, setLoading] = useState(true);
const [daily, setDaily] = useState(null);
const [dasha, setDasha] = useState(null);
const [sadeSati, setSadeSati] = useState(null);
  useEffect(() => {
    if (!user?.astroProfile) return;

    async function load() {
      setLoading(true);
      const naks = await getDailyNakshatra(user);
      const num = await getNumerology(user);
     const d = await getCurrentDasha(user);
     const s = await getSadeSati(user)

   console.log(d, s)

     
      setDaily(naks)
      setNumero(num);
      setDasha(d);
      setSadeSati(s)
      setLoading(false);
    }

    load();
  }, [user]);

  if (!user) return null;
  if (loading) return <p className="text-center mt-20">Loading...</p>;

  return (
    <div className="min-h-screen bg-[#F7F3E9] pt-24 px-4">
      <h1 className="text-3xl font-bold text-center mb-8">
        Your Personalized Horoscope ✨
      </h1>

      {/* NAKSHATRA */}
    {daily && (
  <div className="bg-white p-6 rounded mb-6">
    {/* HEADER */}
    <div className="mb-4">
      <h2 className="text-xl font-bold">
        🌙 Daily Nakshatra Horoscope
      </h2>
      <p className="text-sm text-gray-500">
        {daily.prediction_date}
      </p>
      <p className="text-sm mt-1">
        Moon Sign: <b>{daily.birth_moon_sign}</b> | 
        Nakshatra: <b>{daily.birth_moon_nakshatra}</b>
      </p>
    </div>

    {/* PREDICTIONS */}
    <div className="space-y-3 text-sm text-[#00695C]">
      <p><b>🧠 Emotions:</b> {daily.prediction.emotions}</p>
      <p><b>💼 Career:</b> {daily.prediction.profession}</p>
      <p><b>❤️ Personal Life:</b> {daily.prediction.personal_life}</p>
      <p><b>🍀 Luck:</b> {daily.prediction.luck}</p>
      <p><b>🧘 Health:</b> {daily.prediction.health}</p>
      <p><b>✈️ Travel:</b> {daily.prediction.travel}</p>
    </div>
  </div>
)}



      {/* NUMEROLOGY */}
      <motion.div className="bg-white p-6 rounded">
        <h2 className="font-bold text-xl mb-2">
          Numerology Insight
        </h2>
        {numero && (
  <div className="bg-white p-6 rounded mb-6">
    {/* HEADER */}
    <div className="mb-3">
      <h2 className="text-xl font-bold flex items-center gap-2">
        🔢 Numerology Insight
      </h2>
      <p className="text-sm text-gray-500">
        {numero.title}
      </p>
    </div>

    {/* DESCRIPTION */}
    <p className="text-sm leading-relaxed text-[#00695C] whitespace-pre-line">
      {numero.description}
    </p>
  </div>
)}

      </motion.div>

      {sadeSati && (
  <div className="bg-white p-6 rounded mb-6">
    <h2 className="text-xl font-bold">🪐 Sade Sati Status</h2>
    <p>Status: <b>{sadeSati.sadhesati_status}</b></p>
    <p>Phase: {sadeSati.phase}</p>
    <p>{sadeSati.description}</p>
  </div>
)}

{dasha && <DashaTimeline data={dasha} />}
<div className="bg-white p-6 rounded mb-6 border border-[#E6E2D8]">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          🪐 Sade Sati Status
        </h2>

        <span
          className={`text-xs px-3 py-1 rounded-full font-semibold ${
            sadeSati.sadhesati_status
              ? "bg-red-100 text-red-700"
              : "bg-green-100 text-green-700"
          }`}
        >
          {sadeSati.sadhesati_status ? "Active" : "Not Active"}
        </span>
      </div>

      {/* STATUS MESSAGE */}
      <p className="text-sm mb-3 text-[#00695C]">
        {sadeSati.is_undergoing_sadhesati}
      </p>

      {/* PHASE */}
      <div className="mb-4">
        <p className="text-sm">
          <b>Current Phase:</b>{" "}
          <span className="text-[#C06014] font-semibold">
            {sadeSati.sadhesati_phase}
          </span>
        </p>
      </div>

      {/* SIGNS */}
      <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
        <p>
          🌙 <b>Moon Sign:</b> {sadeSati.moon_sign}
        </p>
        <p>
          🪐 <b>Saturn Sign:</b> {sadeSati.saturn_sign}
        </p>
      </div>

      {/* TIMELINE */}
      <div className="bg-[#F7F3E9] p-3 rounded mb-4 text-sm">
        <p>
          📅 <b>Start:</b> {sadeSati.start_date}
        </p>
        <p>
          📅 <b>End:</b> {sadeSati.end_date}
        </p>
      </div>

      {/* EXTRA INFO */}
      <div className="text-xs text-gray-600 space-y-1">
        <p>
          🔄 <b>Saturn Retrograde:</b>{" "}
          {sadeSati.is_saturn_retrograde ? "Yes" : "No"}
        </p>
        <p>
          📆 <b>Consideration Date:</b> {sadeSati.consideration_date}
        </p>
      </div>

      {/* WHAT IS SADE SATI */}
      <div className="mt-4 text-sm text-[#00695C] leading-relaxed">
        <p className="font-semibold mb-1">What is Sade Sati?</p>
        <p>{sadeSati.what_is_sadhesati}</p>
      </div>
    </div>

    </div>
  );
}
