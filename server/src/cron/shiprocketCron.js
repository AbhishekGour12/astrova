import cron from "node-cron";
import Order from "../models/Order.js";
import Product from "../models/Products.js";
import { getAWBFromOrder, trackShipment } from "../services/shipRocketServices.js";

// ==============================
// RESTOCK PRODUCTS (SAFE)
// ==============================
const restockProducts = async (order) => {
  for (const item of order.items) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: item.quantity }
    });
  }
};

// ==============================
// CANCEL CHECK
// ==============================
const CANCELED_STATUSES = [
  "Canceled",
  "Cancelled",
  "Shipment Cancelled",
  "Pickup Cancelled",
];

const canDeleteOrder = (order) => {
  if (order.shiprocketStatus === "Delivered") return false;

  // avoid deleting paid online orders
  if (order.paymentMethod === "online" && order.paymentStatus === "paid") {
    return false;
  }

  return true;
};

// ==============================
// MAIN CRON JOB
// ==============================
export const shiprocketCron = () => {
  cron.schedule("*/30 * * * *", async () => {
    console.log("⏳ Shiprocket Cron Started");

    try {
      const orders = await Order.find({
        shiprocketOrderId: { $exists: true, $ne: null },
        shiprocketStatus: { $nin: ["Delivered", "RTO Delivered"] }
      });

      if (!orders.length) {
        console.log("ℹ No active Shiprocket orders");
        return;
      }

      for (const order of orders) {
        console.log(`📦 Checking Order: ${order.shiprocketOrderId}`);

        const shipment = await getAWBFromOrder(order.shiprocketOrderId);
        if (!shipment?.awb) continue;

        if (!order.awbCode) order.awbCode = shipment.awb;

        const trackingRes = await trackShipment(shipment.awb);
        const tracking = trackingRes?.tracking_data;
        if (!tracking) continue;

        const newStatus = shipment.status;

        // ==============================
        // 🚫 CANCELED FROM SHIPROCKET
        // ==============================
        if (CANCELED_STATUSES.includes(newStatus)) {
          console.log(`❌ Shiprocket Canceled: ${order._id}`);

          if (canDeleteOrder(order)) {
            await restockProducts(order);
            await Order.findByIdAndDelete(order._id);

            console.log(`🗑 Order Deleted & Restocked: ${order._id}`);
          } else {
            console.log(`⚠ Order NOT deleted (paid/delivered): ${order._id}`);
          }

          continue;
        }

        // ==============================
        // PRE PICKUP
        // ==============================
        if (tracking.track_status === 0) {
          order.shiprocketStatus = newStatus;
          order.shiprocketStatusDate = new Date();
          await order.save();
          continue;
        }

        if (order.shiprocketStatus === newStatus) continue;

        order.shiprocketStatus = newStatus;
        order.shiprocketStatusDate = new Date();
        order.trackingHistory =
          tracking.shipment_track_activities || [];

        // ==============================
        // TERMINAL STATES
        // ==============================
        if (newStatus === "Delivered") {
          console.log(`✅ Delivered: ${order._id}`);
        }

        if (newStatus === "RTO Delivered") {
          console.log(`🔁 RTO Delivered → Restocking: ${order._id}`);
          await restockProducts(order);
        }

        await order.save();
      }

      console.log("✅ Shiprocket Cron Completed");

    } catch (err) {
      console.error("❌ Shiprocket Cron Error:", err.message);
    }
  });
};
