import mongoose from "mongoose";
import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Product from "../models/Products.js";

import {
  createShiprocketOrder,
  assignAWB,
  getAWBFromOrder,
  trackShipment,
} from "../services/shipRocketServices.js";
import { payoutToFundAccount } from "../services/razorpayXPayoutServices.js";

export const createOrder = async (req, res) => {
  
  
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const {
      shippingAddress,
      paymentMethod,
      discount = 0,
      paymentDetails = null,
      isCODEnabled = false,
      totalWeight = 0.5
    } = req.body;
    
    if (!shippingAddress) throw new Error("Shipping address required");
    if (!paymentMethod) throw new Error("Payment method required");

    // Fetch cart
    const cart = await Cart.findOne({ userId: req.user.id }).populate("items.product");
    for (const item of cart.items) {
  if (item.quantity > item.product.stock) {
    throw new Error(
      `${item.product.name} is out of stock`
    );
  }
}

    if (!cart || cart.items.length === 0) throw new Error("Your cart is empty");

    // Totals
    const subtotal = cart.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const gstAmount = Number((subtotal * 0.18).toFixed(2));
    const shippingCharge = subtotal > 500 ? 0 : 50;
    const totalAmount = Number((subtotal + gstAmount + shippingCharge - discount).toFixed(2));
    const paymentStatus = paymentMethod === "online" ? "Paid" : "Pending";

    // Weight
    let calculatedWeight = cart.items.reduce(
      (sum, item) => sum + (item.product.weight ?? 0.2) * item.quantity,
      0
    );

    if (totalWeight > 0) calculatedWeight = totalWeight;

    // Format items
    const orderItems = cart.items.map((item) => ({
      product: item.product._id,
      name: item.product.name,
      image: item.product.imageUrls?.[0] || "",
      priceAtPurchase: item.product.price,
      quantity: item.quantity,
      weight: item.product.weight || 0.2
    }));

    // Prepare order object for Shiprocket
    let plainOrder = {
      _id: new mongoose.Types.ObjectId().toString(),
      items: orderItems.map((i) => ({ ...i, product: i.product.toString() })),
      shippingAddress,
      subtotal,
      paymentMethod,
      discount,
      totalAmount,
      weight: calculatedWeight
    };

    // -----------------------------------
    // CREATE ORDER IN SHIPROCKET FIRST
    // -----------------------------------
    try{
      
    const shipOrder = await createShiprocketOrder(plainOrder, {
      weight: calculatedWeight,
      isCOD: isCODEnabled
    });
  
    if(!shipOrder.order_id){
      res.status(400).send(shipOrder.errors)
    }
    if (!shipOrder || !shipOrder.order_id) throw new Error("Shiprocket order failed");

    const awbRes = await assignAWB(shipOrder.shipment_id);

    // -----------------------------------
    // NOW SAVE ORDER IN DB
    // -----------------------------------
    const newOrder = new Order({
      _id: plainOrder._id,
      userId: req.user.id,
      items: orderItems,
      shippingAddress,
      subtotal,
      gstAmount,
      shippingCharge,
      discount,
      totalAmount,
      weight: calculatedWeight,
      paymentMethod,
      paymentStatus,
      razorpay: paymentDetails || {},
      deliveryStatus: "Packed",

      shiprocketStatus: "Order Created",
      shiprocketOrderId: shipOrder.order_id,
      shiprocketShipmentId: shipOrder.shipment_id,
      shiprocketAWB: awbRes?.awb_code || null
    });

    await newOrder.save({ session });
// -----------------------------------
// SAVE PAYMENT INFO (CASH / COD / OFFLINE)
// -----------------------------------
/** 
if (paymentMethod === "online") {
  // Example: seller fixed payout
  const payoutAmount = Math.round(totalAmount * 0.7); // 70%

  await payoutToFundAccount({
    fundAccountId: "fa_RweeY0Tr8ugGMp", // 🔒 stored fund account id
    amount: payoutAmount,
    referenceId: newOrder._id.toString(),
    narration: "Seller payout for order",
  });

  newOrder.payoutstatus = "SUCCESS";
  
}
  */



    // Reduce stock
  for (const item of cart.items) {
  const updated = await Product.updateOne(
    {
      _id: item.product._id,
      stock: { $gte: item.quantity }
    },
    { $inc: { stock: -item.quantity } },
    { session }
  );

  if (updated.modifiedCount === 0) {
    throw new Error(
      `Stock mismatch for ${item.product.name}`
    );
  }
}



    // Clear cart
    cart.items = [];
    cart.totalAmount = 0;
    await cart.save({ session });

    await session.commitTransaction();
    session.endSession();

    return res.status(201).json({
      success: true,
      message: "Order placed & synced with Shiprocket",
      order: newOrder,
      shiprocket: shipOrder
    });
  }catch(err){
    console.log("order", err.message)
  }

  } catch (error) {
    console.log("❌ ORDER CREATE ERROR:", error.message);

    await session.abortTransaction();
    session.endSession();
    
    return res.status(500).json({
      success: false,
      message: error.message || "Order creation failed"
    });
  }
};
 /* ---------------------------------------------------------
 * GET ALL ORDERS FOR USER
 * ---------------------------------------------------------
 */
export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.id })
      .populate("items.product")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: orders.length,
      orders,
    });
    
    
  } catch (error) {
    res.status(500).json({
      message: "Error fetching orders",
      error: error.message,
    });
  }
};

/**
 * ---------------------------------------------------------
 * GET ORDER DETAILS BY ID
 * ---------------------------------------------------------
 */
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("items.product")
      .populate("userId", "name email phone");

    if (!order)
      return res.status(404).json({ message: "Order not found" });

    // Permission check
    if (
      order.userId._id.toString() !== req.user.id &&
      !req.user.isAdmin
    ) {
      return res.status(403).json({
        message: "You are not authorized to view this order",
      });
    }

    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching order",
      error: error.message,
    });
  }
};

const mapShiprocketStatus = (code) => {
  const map = {
    17: "Pickup Scheduled",
    18: "Picked Up",
    19: "Out for Pickup",
    20: "In Transit",
    21: "Out for Delivery",
    22: "Delivered",
    23: "RTO Initiated",
    24: "RTO Delivered"
  };

  return map[code] || "Processing";
};




export const trackUserOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { shipmentId: shiprocketOrderId } = req.params;

    // 1️⃣ Find order
    const order = await Order.findOne({
      shiprocketOrderId,
      userId
    });

    if (!order)
      return res.status(404).json({ message: "Order not found" });

    // 2️⃣ Get AWB (DB → Shiprocket)
    

   
      const shipments = await getAWBFromOrder(shiprocketOrderId);
    

      const awb = shipments.awb;

      order.awbCode = awb; // ✅ correct field
    

    // 3️⃣ Track shipment
    const trackingRes = await trackShipment(awb);
    
    const tracking = trackingRes?.tracking_data;
   
  
   
    if (!tracking)
      return res.status(500).json({ message: "Tracking data unavailable" });

    // 4️⃣ Update order status
    //const readableStatus = mapShiprocketStatus(tracking.shipment_status);

    order.shiprocketStatus = shipments.status; // ✅ string
    order.shiprocketStatusDate = new Date();
    order.trackingHistory = tracking.shipment_track_activities || [];

    await order.save();
    const data = {
       success: true,
      orderId: order._id,
      shiprocketOrderId,
      awb,
      courier: shipments.courier,
      current_status: shipments.status,
      shipment_status_code: tracking.shipment_status,
      tracking_data: tracking,
      track_url: tracking.track_url,
      etd: tracking.track_status == 0?trackingRes.etd:shipments.etd

    }
   

    // 5️⃣ Send clean response
    res.json(data)

  } catch (err) {
    console.error("❌ Track Order Error:", err.message);
    res.status(500).json({ message: err.message || "Tracking failed" });
  }
};
