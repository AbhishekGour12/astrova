import axios from "axios";
import { getValidToken } from "../utils/shipRocketToken.js";

// Store token in memory + expiry

// Get Token (Cached for 24 hours)
  

// -------------------------------
// Shipping Charge API
// -------------------------------
export const shippingCharge = async (req, res) => {
  try {
    const { pincode, weight } = req.body;

    const token = await getValidToken();

    const response = await axios.get(
  "https://apiv2.shiprocket.in/v1/external/courier/serviceability/",
  {
    params: {
      pickup_postcode: 452010,
      delivery_postcode: 443404,
      cod: 0,
      weight: weight || 1,
    },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
);


    const available = response.data.data.available_courier_companies;

    if (!available || available.length === 0) {
      return res.status(400).json({ message: "No courier options available" });
    }

    const cheapest = available.sort((a, b) => a.rate - b.rate)[0];

    res.json({
      shippingCharge: cheapest.rate,
      courier: cheapest.courier_name,
    });

  } catch (err) {
    console.error("🔥 ERROR:", err.response?.data || err);
    res.status(500).json({ message: "Shiprocket API Failed", error: err.message });
  }
};
