const CACHE_HOURS = 24;

/* ---------------- CACHE ---------------- */

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

/* ---------------- API WRAPPER ---------------- */

async function fetchHoroscope({ sign, period, section }) {
  const key = `horoscope-${sign}-${period}-${section}`;
  const cached = getCache(key);
  if (cached) return cached;

  const res = await fetch(
    `/api/prokerala/horoscope?sign=${sign}&period=${period}&section=${section}`
  );

  const json = await res.json();
  const text = json.text || "";

  setCache(key, text);
  return text;
}

/* ---------------- EXPORTED FUNCTIONS ---------------- */

export async function getZodiacHoroscope({ sign, period }) {
  const text = await fetchHoroscope({
    sign,
    period,
    section: "general",
  });

  return { en: text, hi: text }; // (Hindi later if needed)
}

export async function getLoveHoroscope(sign, period) {
  const text = await fetchHoroscope({
    sign,
    period,
    section: "love",
  });

  return { en: text, hi: text };
}

export async function getCareerHoroscope(sign, period) {
  const text = await fetchHoroscope({
    sign,
    period,
    section: "career",
  });

  return { en: text, hi: text };
}

export async function getHealthHoroscope(sign, period) {
  const text = await fetchHoroscope({
    sign,
    period,
    section: "health",
  });

  return { en: text, hi: text };
}

export function clearHoroscopeCache() {
  Object.keys(localStorage).forEach((k) => {
    if (k.startsWith("horoscope-")) {
      localStorage.removeItem(k);
    }
  });
}
