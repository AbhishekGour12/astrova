import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();

    const auth =
      "Basic " +
      Buffer.from(
        process.env.NEXT_PUBLIC_ASTROLOGY_USER + ":" + process.env.NEXT_PUBLIC_ASTROLOGY_KEY
      ).toString("base64");

    const res = await fetch(
      "https://json.astrologyapi.com/v1/daily_nakshatra_prediction",
      {
        method: "POST",
        headers: {
          Authorization: auth,
          "Content-Type": "application/json",
          "Accept-Language": "en",
        },
        body: JSON.stringify(body),
      }
    );

    const data = await res.json();
    return NextResponse.json(data);
  } catch (err) {
    console.log(err.message)
    return NextResponse.json({ error: "Astrology API error" }, { status: 500 });
  }
}
