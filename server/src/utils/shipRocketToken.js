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
    
    // Add this console.log to debug
    console.log("Token generated successfully:", shiprocketToken ? "Yes" : "No");
   
    return shiprocketToken; // Make sure to return the token
  } catch (err) {
    console.error("Shiprocket token generation error:", err.response?.data || err.message);
    throw new Error("Shiprocket token generation failed");
  }
};

export const getValidToken = async () => {
  try {
    // Check if token exists and is not expired
    if (!shiprocketToken || Date.now() > tokenExpiry) {
      console.log("Generating new token...");
      const newToken = await generateToken();
      console.log("New token generated:", newToken ? "Yes" : "No");
      return newToken;
    }
    console.log("Using existing token");
    return shiprocketToken;
  } catch (err) {
    console.error("Error in getValidToken:", err.message);
    throw err;
  }
};
// Add this test function temporarily
