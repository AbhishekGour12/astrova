import axios from "axios";



export const astroClient = axios.create({
  baseURL: "https://json.astrologyapi.com/v1",
  auth: {
    username: process.env.NEXT_PUBLIC_ASTROLOGY_USER,
    password: process.env.NEXT_PUBLIC_ASTROLOGY_KEY,
  },
  headers: {
    "Content-Type": "application/json",
    "Accept-Language": "en",
  },
});

export const setLanguage = (lang) => {
  astroClient.defaults.headers["Accept-Language"] =
    lang === "hi" ? "hi" : "en";
};
