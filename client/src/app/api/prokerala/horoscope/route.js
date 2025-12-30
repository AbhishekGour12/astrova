import axios from "axios";
import { NextResponse } from "next/server";

/* ---------- ZODIAC MID-DATES ---------- */
const ZODIAC_PROFILES = {
  aries: { day: 5, month: 4 },
  taurus: { day: 5, month: 5 },
  gemini: { day: 5, month: 6 },
  cancer: { day: 5, month: 7 },
  leo: { day: 5, month: 8 },
  virgo: { day: 5, month: 9 },
  libra: { day: 5, month: 10 },
  scorpio: { day: 5, month: 11 },
  sagittarius: { day: 5, month: 12 },
  capricorn: { day: 5, month: 1 },
  aquarius: { day: 5, month: 2 },
  pisces: { day: 5, month: 3 },
};

function buildProfile(sign) {
  return {
    year: 2000,
    hour: 12,
    min: 0,
    lat: 25.7464,
    lon: 82.6837,
    tzone: 5.5,
    ...ZODIAC_PROFILES[sign],
  };
}

/* ---------- TOKEN CACHE ---------- */
let tokenCache = { token: null, expiry: 0 };

async function getAccessToken() {
  if (tokenCache.token && Date.now() < tokenCache.expiry) {
    return tokenCache.token;
  }

  const res = await axios.post(
    "https://api.prokerala.com/token",
    new URLSearchParams({
      grant_type: "client_credentials",
      client_id: process.env.PROKERALA_CLIENT_ID,
      client_secret: process.env.PROKERALA_CLIENT_SECRET,
    }),
    { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
  );

  tokenCache.token = res.data.access_token;
  tokenCache.expiry = Date.now() + res.data.expires_in * 1000;

  return tokenCache.token;
}

/* ---------- API ---------- */
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);

    const sign = searchParams.get("sign");
    const period = searchParams.get("period") || "daily";
    const section = searchParams.get("section") || "general";

    if (!sign) {
      return NextResponse.json({ error: "sign required" }, { status: 400 });
    }

    const token = await getAccessToken();

    let endpoint = "";
    let field = "";

    if (section === "general") {
      endpoint = `/general_rashi_report/sun`;
      field = "rashi_report";
    } else if (section === "love") {
      endpoint = `/general_house_report/venus`;
      field = "house_report";
    } else if (section === "career") {
      endpoint = `/general_house_report/saturn`;
      field = "house_report";
    } else if (section === "health") {
      endpoint = `/general_house_report/mars`;
      field = "house_report";
    }

    const res = await axios.post(
      `https://api.prokerala.com/v2/astrology${endpoint}`,
      buildProfile(sign),
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    return NextResponse.json({
      text: res.data?.data?.[field] || "",
    });
  } catch (err) {
    console.error("PROKERALA ERROR:", err.response?.data || err.message);
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}
