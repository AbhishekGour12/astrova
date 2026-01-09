import { NextResponse } from "next/server";

export async function POST(req) {
  const body = await req.json();

  const auth =
    "Basic " +
    Buffer.from(
      process.env.NEXT_PUBLIC_ASTROLOGY_USER +
      ":" +
      process.env.NEXT_PUBLIC_ASTROLOGY_KEY
    ).toString("base64");

  const res = await fetch(
    "https://json.astrologyapi.com/v1/current_vdasha",
    {
      method: "POST",
      headers: {
        Authorization: auth,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    }
  );

  const data = await res.json();
  return NextResponse.json(data);
}
