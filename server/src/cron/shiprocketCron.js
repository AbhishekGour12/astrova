import cron from "node-cron";
import axios from "axios";
import Order from "../models/Order.js";
import Product from "../models/Products.js";
import { getValidToken } from "../utils/shipRocketToken.js"; // your existing file



// 🚀 Shiprocket Tracking API
const getTrackingStatus = async (awb) => {
  try {
    const token = await getValidToken();

    const res = await axios.get(
      `https://apiv2.shiprocket.in/v1/external/courier/track/awb/${awb}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return res.data;
  } catch (err) {
    console.log("❌ Tracking API Error:", err.response?.data || err.message);
    return null;
  }
};

// 🚀 Restock products when order fails
const restockProducts = async (order) => {
  try {
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, {
        $inc: { stock: item.quantity },
      });
    }
  } catch (err) {
    console.log("❌ Restock Error:", err.message);
  }
};


export const shiprocketCron = () =>{


// 🚀 MAIN CRON JOB
cron.schedule("*/30 * * * *", async () => {
  console.log("⏳ Running Shiprocket tracking cron...");

  try {
    // Find orders that have Shiprocket AWB and not delivered yet
    const orders = await Order.find({
      shiprocketAWB: { $exists: true, $ne: null },
      deliveryStatus: { $nin: ["Delivered", "Cancelled", "Returned"] }
    });

    if (orders.length === 0) {
      console.log("ℹ No active orders to track.");
      return;
    }

    for (const order of orders) {
      console.log(`📦 Checking status for AWB: ${order.shiprocketAWB}`);

      const tracking = await getTrackingStatus(order.shiprocketAWB);

      if (!tracking?.tracking_data) continue;

      const status = tracking.tracking_data?.current_status || "Unknown";
      const shipmentStatus = tracking.tracking_data?.shipment_status;
      const events = tracking.tracking_data?.shipment_track_activities || [];

      // Update order tracking history
      order.trackingHistory = events;
      order.shiprocketStatus = shipmentStatus || status;
      order.deliveryStatus = status;

      // 🔥 Check for FAILED / RETURNED statuses
      const failedStatuses = [
        "RTO In Transit",
        "RTO Delivered",
        "Cancelled",
        "Undelivered",
        "Return",
        "Lost",
        "Pickup Exception"
      ];

      if (failedStatuses.includes(status)) {
        console.log(`⚠ Order Failed: ${order._id} → Restocking...`);

        await restockProducts(order);

        order.deliveryStatus = "Failed";
        order.shiprocketStatus = status;
      }

      // Delivered
      if (status === "Delivered") {
        order.deliveryStatus = "Delivered";
      }

      await order.save();
    }

    console.log("✅ Cron job completed.");

  } catch (err) {
    console.log("❌ Cron Failure:", err.message);
  }
});

}
