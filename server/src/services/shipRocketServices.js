import axios from "axios";
import { getValidToken } from "../utils/shipRocketToken";

/**
 * Create Shiprocket Order
 */
export const createShiprocketOrder = async (order) => {
  const token = await getValidToken();

  const payload = {
    order_id: order._id,
    order_date: new Date().toISOString().slice(0, 10),
    pickup_location: "Primary",

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

    order_items: order.items.map((i) => ({
      name: i.name,
      sku: i.product.toString(),
      units: i.quantity,
      selling_price: i.priceAtPurchase,
    })),

    payment_method: order.paymentMethod === "cod" ? "COD" : "Prepaid",
    sub_total: order.subtotal,

    length: 10,
    breadth: 10,
    height: 10,
    weight: 0.5,
  };

  const res = await axios.post(
    "https://apiv2.shiprocket.in/v1/external/orders/create/adhoc",
    payload,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  return res.data;
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
