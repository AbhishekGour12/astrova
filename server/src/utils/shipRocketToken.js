import axios from "axios";


// Store token
let shiprocketToken = null;
let tokenExpiry = null;

// Generate token
const generateToken = async () => {
  try {
    const response = await axios.post(
      "https://apiv2.shiprocket.in/v1/external/auth/login",
      {
         email: "agour4000@gmail.com",
         password: "hBd&yu9ceczX64Rh",
      }
    );
    
    shiprocketToken = response.data.token;
    tokenExpiry = Date.now() + 24 * 60 * 60 * 1000;

    return shiprocketToken;
  } catch (err) {
    throw new Error("Shiprocket token generation failed");
  }
};

export const getValidToken = async () => {
  if (!shiprocketToken || Date.now() > tokenExpiry) {
    return await generateToken();
  }
  return shiprocketToken;
};
