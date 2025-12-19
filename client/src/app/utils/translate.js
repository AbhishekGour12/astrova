export const translateToHindi = async (text) => {
  if (!text) return "";

  try {
    const res = await fetch(
      "https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=hi&dt=t&q=" +
        encodeURIComponent(text)
    );

    const data = await res.json();
    return data[0].map(item => item[0]).join("");
  } catch (err) {
    console.error("Translation failed", err);
    return text; // fallback English
  }
};
