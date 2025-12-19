import { astroClient } from "./client";

/* -------- SAFE MID-DATE ZODIAC PROFILES -------- */

const ZODIAC_PROFILES = {
  aries:       { day: 5, month: 4 },
  taurus:      { day: 5, month: 5 },
  gemini:      { day: 5, month: 6 },
  cancer:      { day: 5, month: 7 },
  leo:         { day: 5, month: 8 },
  virgo:       { day: 5, month: 9 },
  libra:       { day: 5, month: 10 },
  scorpio:     { day: 5, month: 11 },
  sagittarius: { day: 5, month: 12 },
  capricorn:   { day: 5, month: 1 },
  aquarius:    { day: 5, month: 2 },
  pisces:      { day: 5, month: 3 },
};

const BASE_PROFILE = {
  year: 2000,
  hour: 12,
  min: 0,
  lat: 25.7464,
  lon: 82.6837,
  tzone: 5.5,
};

/* -------- CACHE -------- */

const CACHE_HOURS = 24;

const getCache = (key) => {
  const raw = localStorage.getItem(key);
  if (!raw) return null;
  const parsed = JSON.parse(raw);
  return Date.now() - parsed.time > CACHE_HOURS*3600000 ? null : parsed.data;
};

const setCache = (key, data) => {
  localStorage.setItem(key, JSON.stringify({ data, time: Date.now() }));
};

const buildPayload = (sign) => ({
  ...BASE_PROFILE,
  ...ZODIAC_PROFILES[sign],
});

/* -------- GENERAL -------- */

export const getZodiacHoroscope = async ({ sign, planet }) => {
  const key = `general-${planet}-${sign}`;
  const cached = getCache(key);
  if (cached) return cached;

  const res = await astroClient.post(
    `/general_rashi_report/${planet}`,
    buildPayload(sign)
  );

  setCache(key, res.data);
 
  return res.data;
};

/* -------- LOVE / CAREER / HEALTH -------- */

export const getLoveHoroscope = async (sign) => {
  const key = `love-${sign}`;
  const cached = getCache(key);
  if (cached) return cached;

  const res = await astroClient.post(
    "/general_house_report/venus",
    buildPayload(sign)
  );
  setCache(key, res.data);
  return res.data;
};

export const getCareerHoroscope = async (sign) => {
  const key = `career-${sign}`;
  const cached = getCache(key);
  if (cached) return cached;

  const res = await astroClient.post(
    "/general_house_report/saturn",
    buildPayload(sign)
  );
  setCache(key, res.data);
  return res.data;
};

export const getHealthHoroscope = async (sign) => {
  const key = `health-${sign}`;
  const cached = getCache(key);
  if (cached) return cached;

  const res = await astroClient.post(
    "/general_house_report/mars",
    buildPayload(sign)
  );
  setCache(key, res.data);
  return res.data;
};
export const clearHoroscopeCache = () => {
  Object.keys(localStorage).forEach((key) => {
    if (
      key.startsWith("general-") ||
      key.startsWith("love-") ||
      key.startsWith("career-") ||
      key.startsWith("health-")
    ) {
      localStorage.removeItem(key);
    }
  });

  console.log("🧹 Horoscope cache cleared");
};
