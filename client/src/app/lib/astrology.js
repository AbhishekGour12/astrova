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
