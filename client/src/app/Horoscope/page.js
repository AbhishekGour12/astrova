"use client";
import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  getZodiacHoroscope,
  getLoveHoroscope,
  getCareerHoroscope,
  getHealthHoroscope,
  clearHoroscopeCache,
} from "../lib/astrology/horoscopeApis";
import { translateToHindi } from "../utils/translate";

/* ================= CONSTANTS ================= */

const PERIOD_TABS = [
  { key: "daily", label: "Daily", planet: "sun" },
  { key: "weekly", label: "Weekly", planet: "sun" },
  { key: "monthly", label: "Monthly", planet: "moon" },
  { key: "yearly", label: "Yearly", planet: "jupiter" },
];

const SECTION_TABS = [
  { key: "general", label: "General" },
  { key: "love", label: "Love ❤️" },
  { key: "career", label: "Career 💼" },
  { key: "health", label: "Health 🧘" },
];

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
  aries: "मेष",
  taurus: "वृषभ",
  gemini: "मिथुन",
  cancer: "कर्क",
  leo: "सिंह",
  virgo: "कन्या",
  libra: "तुला",
  scorpio: "वृश्चिक",
  sagittarius: "धनु",
  capricorn: "मकर",
  aquarius: "कुंभ",
  pisces: "मीन",
};

const getZodiacName = (sign, lang) =>
  lang === "hi"
    ? ZODIAC_NAMES_HI[sign]
    : sign.charAt(0).toUpperCase() + sign.slice(1);

/* ========= RASHI DETECTION (EN + HI) ========= */

const RASHI_KEYWORDS = {
  aries: ["arian", "arians", "मेष"],
  taurus: ["taurean", "taureans", "वृषभ"],
  gemini: ["geminian", "geminians", "मिथुन"],
  cancer: ["cancerian", "cancerians", "कर्क"],
  leo: ["leo", "leos", "सिंह"],
  virgo: ["virgo", "virgos", "कन्या"],
  libra: ["libran", "librans", "तुला"],
  scorpio: ["scorpio", "scorpios", "वृश्चिक"],
  sagittarius: ["sagittarian", "sagittarians", "धनु"],
  capricorn: ["capricorn", "capricorns", "मकर"],
  aquarius: ["aquarian", "aquarians", "कुंभ"],
  pisces: ["piscean", "pisceans", "मीन"],
};

const detectRashiFromText = (text = "", lang = "en") => {
  if (!text) return null;

  const lower = text.toLowerCase();

  for (const sign in RASHI_KEYWORDS) {
    for (const word of RASHI_KEYWORDS[sign]) {
      if (lang === "hi") {
        if (text.includes(word)) return sign;
      } else {
        if (lower.includes(word)) return sign;
      }
    }
  }
  return null;
};

/* ================= COMPONENT ================= */

export default function HoroscopePage() {
  const [period, setPeriod] = useState("daily");
  const [section, setSection] = useState("general");
  const [lang, setLang] = useState("en");
  const [data, setData] = useState({});
  const [translatedData, setTranslatedData] = useState({});
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(null);

  /* ========== FETCH (UNCHANGED) ========== */

  useEffect(() => {
    loadHoroscopes();
  }, [period]);

  const loadHoroscopes = async () => {
    setLoading(true);
    const tab = PERIOD_TABS.find(t => t.key === period);
    const results = {};

    await Promise.all(
      ZODIACS.map(async (sign) => {
        const general = await getZodiacHoroscope({ sign, planet: tab.planet });
        const love = await getLoveHoroscope(sign);
        const career = await getCareerHoroscope(sign);
        const health = await getHealthHoroscope(sign);

        results[sign] = {
          general: general?.rashi_report || "",
          love: love?.house_report || "",
          career: career?.house_report || "",
          health: health?.house_report || "",
        };
      })
    );

    setData(results);
    setTranslatedData({});
    setLoading(false);
  };

  /* ========== TRANSLATION ========== */

  useEffect(() => {
    if (lang === "hi" && Object.keys(data).length) {
      translateAll();
    }
  }, [lang, section]);

  const translateAll = async () => {
    const temp = {};
    for (const sign of ZODIACS) {
      temp[sign] = data[sign]?.[section]
        ? await translateToHindi(data[sign][section])
        : "";
    }
    setTranslatedData(temp);
  };

  const getText = (sign) => {
    if (loading) return "Loading...";
    if (lang === "hi") return translatedData[sign] || "अनुवाद हो रहा है...";
    return data[sign]?.[section] || "";
  };

  /* ========== FINAL ORDER FIX ========= */

  const orderedCards = useMemo(() => {
    const map = {};

    ZODIACS.forEach(sign => {
      const text = getText(sign);
      const detected = detectRashiFromText(text, lang);
      if (detected) map[detected] = text;
    });

    return ZODIACS.map(sign => ({
      sign,
      text: map[sign] || getText(sign),
    }));
  }, [data, translatedData, section, lang, loading]);

  /* ================= UI ================= */

  return (
   <div className="min-h-screen pt-24 px-4 pb-12
  bg-[#F7F3E9]
  text-[#003D33]
  font-[Lora]"
>
  <h1 className="text-4xl font-bold text-center mb-4 font-[Cagliostro]">
    {lang === "hi" ? "राशिफल" : "Horoscope"}
  </h1>

  <div className="text-center mb-4">
    <button
      onClick={() => {
        clearHoroscopeCache();
        window.location.reload();
      }}
      className="text-xs underline text-[#C06014] hover:text-[#D47C3A]"
    >
      Clear Horoscope Cache
    </button>
  </div>

  {/* Language */}
  <div className="flex justify-center gap-6 mb-4">
    <button
      onClick={() => setLang("en")}
      className={lang === "en"
        ? "font-bold underline text-[#C06014]"
        : "text-[#00695C]"}
    >
      English
    </button>

    <button
      onClick={() => setLang("hi")}
      className={lang === "hi"
        ? "font-bold underline text-[#C06014]"
        : "text-[#00695C]"}
    >
      हिंदी
    </button>
  </div>

  {/* Period */}
  <div className="flex justify-center gap-3 mb-4 flex-wrap">
    {PERIOD_TABS.map(t => (
      <button
        key={t.key}
        onClick={() => setPeriod(t.key)}
        className={`px-4 py-2 rounded border
          ${period === t.key
            ? "bg-[#C06014] text-white"
            : "border-[#B2C5B2] text-[#003D33] hover:bg-[#ECE5D3]"}
        `}
      >
        {t.label}
      </button>
    ))}
  </div>

  {/* Section */}
  <div className="flex justify-center gap-3 mb-8 flex-wrap">
    {SECTION_TABS.map(s => (
      <button
        key={s.key}
        onClick={() => setSection(s.key)}
        className={`px-3 py-1 rounded border
          ${section === s.key
            ? "bg-[#00695C] text-white"
            : "border-[#B2C5B2] text-[#003D33] hover:bg-[#ECE5D3]"}
        `}
      >
        {s.label}
      </button>
    ))}
  </div>

  {/* Cards */}
  <div className="grid md:grid-cols-2 gap-6 max-w-6xl mx-auto">
    {orderedCards.map(({ sign, text }) => (
      <motion.div
        key={sign}
        className="
          bg-white
          p-5
          rounded
          border border-[#B2C5B2]
          shadow-[0_6px_18px_rgba(192,96,20,0.2)]
        "
      >
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl text-[#C06014]">
            {ZODIAC_ICONS[sign]}
          </span>
          <h3 className="font-bold font-[Cagliostro]">
            {getZodiacName(sign, lang)}
          </h3>
        </div>

        <p className="text-sm text-[#00695C] line-clamp-4">
          {text}
        </p>

        <button
          onClick={() => setModal({ sign, text })}
          className="text-[#C06014] hover:text-[#D47C3A] text-sm mt-2"
        >
          {lang === "hi" ? "और पढ़ें" : "Read More"}
        </button>
      </motion.div>
    ))}
  </div>

  {/* Modal */}
  <AnimatePresence>
    {modal && (
      <motion.div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
        <motion.div
          className="
            bg-white
            p-6
            rounded
            max-w-xl
            w-full
            border border-[#B2C5B2]
            shadow-[0_10px_30px_rgba(192,96,20,0.25)]
          "
        >
          <h3 className="font-bold text-lg mb-3 flex gap-2 font-[Cagliostro]">
            <span className="text-[#C06014]">
              {ZODIAC_ICONS[modal.sign]}
            </span>
            {getZodiacName(modal.sign, lang)}
          </h3>

          <p className="text-[#00695C] whitespace-pre-line">
            {modal.text}
          </p>

          <button
            onClick={() => setModal(null)}
            className="mt-4 text-[#C06014] hover:text-[#D47C3A]"
          >
            {lang === "hi" ? "बंद करें" : "Close"}
          </button>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
</div>

  );
}
