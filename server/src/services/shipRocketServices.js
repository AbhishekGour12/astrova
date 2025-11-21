import axios from "axios";
import { getValidToken } from "../utils/shipRocketToken.js";

/**
 * Create Shiprocket Order
 */
export const createShiprocketOrder = async (order, extra = {}) => {
  const token = await getValidToken();

  const payload = {
    order_id: order._id,
    order_date: new Date().toISOString().slice(0, 10),

    pickup_location: "Home",

    billing_customer_name: order.shippingAddress.fullName,
    billing_last_name: "",
    billing_address: order.shippingAddress.addressLine1,
    billing_city: order.shippingAddress.city,
    billing_pincode: order.shippingAddress.pincode,
    billing_state: order.shippingAddress.state,
    billing_country: "India",
    billing_email: order.shippingAddress.email,
    billing_phone: order.shippingAddress.phone,

    shipping_is_billing: true,

    order_items: order.items.map((item) => ({
      name: item.name,
      sku: item.product,
      units: Number(item.quantity),
      selling_price: Number(item.priceAtPurchase),
      discount: 0,
    })),

    payment_method: order.paymentMethod === "cod" ? "COD" : "Prepaid",
    sub_total: Number(order.subtotal),

    length: 10,
    breadth: 10,
    height: 10,
    weight: Number(extra.weight || order.weight || 0.5)
  };

  console.log("🚀 SHIPROCKET PAYLOAD SENT:", payload);

  try {
    const res = await axios.post(
      "https://apiv2.shiprocket.in/v1/external/orders/create/adhoc",
      payload,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    console.log(res)

    return res.data;

  } catch (err) {
    console.log("🚨 SHIPROCKET RESPONSE ERROR RAW:", err.response?.data);
    console.log("🚨 SHIPROCKET STATUS:", err.response?.status);
    console.log("🚨 SHIPROCKET FULL ERROR:", err);
    throw new Error(err.response?.data?.message || "Shiprocket error");
  }
};






/**
 * Assign AWB to Shipment
 */
export const assignAWB = async (shipmentId) => {
  const token = await getValidToken();

  const res = await axios.post(
    "https://apiv2.shiprocket.in/v1/external/courier/assign/awb",
    { shipment_id: shipmentId },
    { headers: { Authorization: `Bearer ${token}` } }
  );

  return res.data;
};

/**
 * Track Shipment
 */
export const trackShipment = async (awb) => {
  const token = await getValidToken();

  const res = await axios.get(
    `https://apiv2.shiprocket.in/v1/external/courier/track/awb/${awb}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  return res.data;
};

