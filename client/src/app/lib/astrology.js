import axios from "axios";

const API_URL = "https://json.astrologyapi.com/v1/kundli_matching";

export const kundliMatch = async (payload) => {
  const auth = {
    username: process.env.NEXT_PUBLIC_ASTROLOGY_USER,
    password: process.env.NEXT_PUBLIC_ASTROLOGY_KEY,
  };
 console.log(auth)
  

  const res = await axios.post(API_URL, payload, { auth });
  return res.data;
};
const CACHE_HOURS = 24;

function getCache(key) {
  const raw = localStorage.getItem(key);
  if (!raw) return null;

  const parsed = JSON.parse(raw);
  if (Date.now() - parsed.time > CACHE_HOURS * 3600000) {
    localStorage.removeItem(key);
    return null;
  }
  return parsed.data;
}

function setCache(key, data) {
  localStorage.setItem(
    key,
    JSON.stringify({ data, time: Date.now() })
  );
}

/* ---------------- DAILY NAKSHATRA ---------------- */

export async function getDailyNakshatra(user) {
  const key = `daily-nakshatra-${user._id}`;
  const cached = getCache(key);
  if (cached) return cached;

  const b = user.astroProfile.birthDetails;
  const p = user.astroProfile.birthPlace;

  const res = await fetch("src/app/api/astrology/daily", {
    method: "POST",
    body: JSON.stringify({
      day: b.day,
      month: b.month,
      year: b.year,
      hour: b.hour,
      min: b.minute,
      lat: p.latitude,
      lon: p.longitude,
      tzone: p.timezone,
    }),
  });

  const data = await res.json();
  console.log(data)
  setCache(key, data);
  return data;
}

/* ---------------- NUMEROLOGY ---------------- */

export async function getNumerology(user) {
  const key = `numerology-${user._id}`;
  const cached = getCache(key);
  if (cached) return cached;

  const b = user.astroProfile.birthDetails;

  const res = await fetch("/api/astrology/numerology", {
    method: "POST",
    body: JSON.stringify({
      day: b.day,
      month: b.month,
      year: b.year,
      name: user.astroProfile.fullName,
    }),
  });

  const data = await res.json();
  setCache(key, data);
  return data;
}
