// 24 hours cache duration
const CACHE_HOURS = 24;

const getCacheKey = (key) => `astro_cache_${key}`;

export const getFromCache = (key) => {
  if (typeof window === "undefined") return null;

  try {
    const cached = localStorage.getItem(getCacheKey(key));
    if (!cached) return null;

    const { data, time } = JSON.parse(cached);
    const ageHours = (Date.now() - time) / (1000 * 60 * 60);

    if (ageHours > CACHE_HOURS) {
      localStorage.removeItem(getCacheKey(key));
      return null;
    }

    console.log("🟢 Cache hit:", key);
    return data;
  } catch (e) {
    return null;
  }
};

export const setToCache = (key, data) => {
  if (typeof window === "undefined") return;

  localStorage.setItem(
    getCacheKey(key),
    JSON.stringify({
      data,
      time: Date.now(),
    })
  );

  console.log("💾 Cache set:", key);
};
