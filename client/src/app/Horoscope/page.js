"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getZodiacHoroscope,
  getLoveHoroscope,
  getCareerHoroscope,
  getHealthHoroscope,
  clearHoroscopeCache,
} from "../lib/astrology/horoscopeApis";

/* ---------------- CONSTANTS ---------------- */

const ZODIACS = [
  "aries","taurus","gemini","cancer",
  "leo","virgo","libra","scorpio",
  "sagittarius","capricorn","aquarius","pisces"
];

const ZODIAC_ICONS = {
  aries: "♈", taurus: "♉", gemini: "♊", cancer: "♋",
  leo: "♌", virgo: "♍", libra: "♎", scorpio: "♏",
  sagittarius: "♐", capricorn: "♑", aquarius: "♒", pisces: "♓",
};

const ZODIAC_NAMES_HI = {
  aries: "मेष", taurus: "वृषभ", gemini: "मिथुन", cancer: "कर्क",
  leo: "सिंह", virgo: "कन्या", libra: "तुला", scorpio: "वृश्चिक",
  sagittarius: "धनु", capricorn: "मकर", aquarius: "कुंभ", pisces: "मीन",
};

const PERIODS = ["daily","weekly","monthly","yearly"];
const SECTIONS = ["general","love","career","health"];

const getZodiacName = (sign, lang) =>
  lang === "hi"
    ? ZODIAC_NAMES_HI[sign]
    : sign.charAt(0).toUpperCase() + sign.slice(1);

/* ---------------- COMPONENT ---------------- */

export default function HoroscopePage() {
  const [period, setPeriod] = useState("daily");
  const [section, setSection] = useState("general");
  const [lang, setLang] = useState("en");
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(null);

  /* ---------------- FETCH ---------------- */

  useEffect(() => {
    fetchData();
  }, [period]);

  const fetchData = async () => {
    setLoading(true);
    const res = {};

    await Promise.all(
      ZODIACS.map(async (sign) => {
        const general = await getZodiacHoroscope({ sign, period });
        const love = await getLoveHoroscope(sign, period);
        const career = await getCareerHoroscope(sign, period);
        const health = await getHealthHoroscope(sign, period);

        res[sign] = { general, love, career, health };
      })
    );

    setData(res);
    setLoading(false);
  };

  const getText = (sign) => {
    if (loading) return "Loading...";
    const item = data[sign]?.[section];
    return lang === "hi" ? item?.hi : item?.en;
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="min-h-screen bg-[#F7F3E9] text-[#003D33] pt-24 pb-16">

      <h1 className="text-4xl font-bold text-center font-[Cagliostro] mb-3">
        Horoscope
      </h1>

      <div className="text-center text-sm mb-4">
        <button
          onClick={() => {
            clearHoroscopeCache();
            location.reload();
          }}
          className="underline text-[#C06014]"
        >
          Clear Horoscope Cache
        </button>
      </div>

      {/* LANGUAGE */}
      <div className="flex justify-center gap-6 mb-5 font-semibold">
        <button
          onClick={() => setLang("en")}
          className={lang === "en" ? "text-[#C06014] underline" : ""}
        >
          English
        </button>
        <button
          onClick={() => setLang("hi")}
          className={lang === "hi" ? "text-[#C06014] underline" : ""}
        >
          हिंदी
        </button>
      </div>

      {/* PERIOD */}
      <div className="flex justify-center gap-3 mb-4 flex-wrap">
        {PERIODS.map(p => (
          <button
            key={p}
            onClick={() => setPeriod(p)}
            className={`px-5 py-2 rounded border font-medium ${
              period === p
                ? "bg-[#C06014] text-white"
                : "border-[#B2C5B2]"
            }`}
          >
            {p.charAt(0).toUpperCase() + p.slice(1)}
          </button>
        ))}
      </div>

      {/* SECTION */}
      <div className="flex justify-center gap-3 mb-10 flex-wrap">
        {SECTIONS.map(s => (
          <button
            key={s}
            onClick={() => setSection(s)}
            className={`px-4 py-2 rounded border font-medium ${
              section === s
                ? "bg-[#00695C] text-white"
                : "border-[#B2C5B2]"
            }`}
          >
            {s === "general" && "General"}
            {s === "love" && "Love ❤️"}
            {s === "career" && "Career 💼"}
            {s === "health" && "Health 🧘"}
          </button>
        ))}
      </div>

      {/* CARDS */}
      <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto px-4">
        {ZODIACS.map(sign => (
          <motion.div
            key={sign}
            className="bg-white rounded-lg border border-[#B2C5B2] p-6"
          >
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl text-[#6A1B9A]">
                {ZODIAC_ICONS[sign]}
              </span>
              <h3 className="text-lg font-bold font-[Cagliostro]">
                {getZodiacName(sign, lang)}
              </h3>
            </div>

            <p className="text-[#00695C] text-sm leading-relaxed line-clamp-4">
              {getText(sign)}
            </p>

            <button
              onClick={() => setModal({ sign, text: getText(sign) })}
              className="mt-3 text-sm text-[#C06014] font-semibold"
            >
              Read More
            </button>
          </motion.div>
        ))}
      </div>

      {/* MODAL */}
      <AnimatePresence>
        {modal && (
          <motion.div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
            <motion.div className="bg-white max-w-xl w-full p-6 rounded">
              <h3 className="text-xl font-bold mb-4 font-[Cagliostro] flex gap-2">
                <span>{ZODIAC_ICONS[modal.sign]}</span>
                {getZodiacName(modal.sign, lang)}
              </h3>
              <p className="text-[#00695C] whitespace-pre-line">
                {modal.text}
              </p>
              <button
                onClick={() => setModal(null)}
                className="mt-4 text-[#C06014] font-semibold"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
