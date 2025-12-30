// utils/translate.js

const hashText = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0; // 32bit
  }
  return hash.toString();
};
export const translateToHindi = async (text) => {
  if (!text) return "";

  // ✅ Unicode-safe cache key
  const cacheKey = "hi-" + hashText(text);

  const cached = localStorage.getItem(cacheKey);
  if (cached) return cached;

  try {
    const res = await fetch(
      "https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=hi&dt=t&q=" +
        encodeURIComponent(text)
    );

    const data = await res.json();
    const translated = data[0].map(item => item[0]).join("");

    localStorage.setItem(cacheKey, translated);
    return translated;
  } catch (err) {
    console.error("Translation failed", err);
    return text;
  }
};
