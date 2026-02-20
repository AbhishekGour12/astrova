import axios from "axios";
import { getValidToken } from "../utils/shipRocketToken.js";
import User from "../models/User.js";
// Store token in memory + expiry

// Get Token (Cached for 24 hours)
  

// -------------------------------
// Shipping Charge API
// -------------------------------
export const shippingCharge = async (req, res) => {
 try {
    const { address, weight, delivery_postcode } = req.body;
    const phone = address.phone.startsWith("+") ? address.phone : `+91${address.phone}`;

    // 1. Find or Create User & Update Address
    let user = await User.findOne({ phone });
    
    const shippingData = {
      username: address.fullName,
      email: address.email,
      addressline1: address.addressLine1,
      addressline2: address.addressLine2,
      city: address.city,
      state: address.state,
      pincode: address.pincode
    };

    if (user) {
      user.shippingAddress = shippingData;
      await user.save();
    } else {
      // Create a new user if not exists
      user = new User({
        phone: phone,
        shippingAddress: shippingData,
        isProfileComplete: false
      });
      await user.save();
    }

    // 2. Get Shiprocket Charge
    const token = await getValidToken();
    {/** 
    const response = await axios.get(
      "https://apiv2.shiprocket.in/v1/external/courier/serviceability/",
      {
        params: {
          pickup_postcode: 452010,
          delivery_postcode: delivery_postcode,
          cod: 0, // Force 0 because COD is disabled
          weight: weight || 0.5,
        },
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const available = response.data.data.available_courier_companies;
    if (!available || available.length === 0) {
      return res.status(400).json({ message: "Delivery not available for this area" });
    }

    const cheapest = available.sort((a, b) => a.rate - b.rate)[0];
*/}
    res.json({
      success: true,
      user: user, // Frontend can update local state if needed
    });

  } catch (err) {
    res.status(500).json({ message: "Sync & Shipping Failed", error: err.message });
  }
};
