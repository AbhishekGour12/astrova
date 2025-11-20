import Order from "../models/Order.js";
import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

import {
  createShiprocketOrder,
  assignAWB
} from "../services/shipRocketServices.js";


export const createOrder = async (req, res) => {
  try {
    const {
      shippingAddress,
      paymentMethod,
      discount = 0,
      paymentDetails = null,
    } = req.body;

    // ------------------------------
    // VALIDATION
    // ------------------------------
    if (!shippingAddress)
      return res.status(400).json({ message: "Shipping address required" });

    if (!paymentMethod)
      return res.status(400).json({ message: "Payment method required" });

    // ------------------------------
    // FETCH CART
    // ------------------------------
    const cart = await Cart.findOne({ userId: req.user.id }).populate(
      "items.product"
    );

    if (!cart || cart.items.length === 0)
      return res.status(400).json({ message: "Your cart is empty" });

    // ------------------------------
    // TOTALS
    // ------------------------------
    const subtotal = cart.items.reduce(
      (sum, i) => sum + i.product.price * i.quantity,
      0
    );

    const gstAmount = Number((subtotal * 0.18).toFixed(2));
    const shippingCharge = subtotal > 500 ? 0 : 50;
    const totalAmount = subtotal + gstAmount + shippingCharge - discount;

    const paymentStatus =
      paymentMethod === "razorpay" ? "Paid" : "Pending";

    // ------------------------------
    // FORMAT ORDER ITEMS
    // ------------------------------
    const orderItems = cart.items.map((i) => ({
      product: i.product._id,
      name: i.product.name,
      image: i.product.imageUrls?.[0] || "",
      priceAtPurchase: i.product.price,
      quantity: i.quantity,
    }));

    // ------------------------------
    // SAVE ORDER IN DB (IMPORTANT)
    // ------------------------------
    const order = new Order({
      userId: req.user.id,
      items: orderItems,
      shippingAddress,
      subtotal,
      gstAmount,
      shippingCharge,
      discount,
      totalAmount,
      paymentMethod,
      paymentStatus,
      razorpay: paymentDetails || {},
      deliveryStatus: "Processing",
    });

    await order.save();

    // ------------------------------
    // CREATE ORDER IN SHIPROCKET
    // ------------------------------
    let shipOrder = null;
    let awbRes = null;

    try {
      shipOrder = await createShiprocketOrder(order);

      if (shipOrder && shipOrder.order_id) {
        order.shiprocketOrderId = shipOrder.order_id;
        order.shiprocketShipmentId = shipOrder.shipment_id;

        // Assign AWB
        awbRes = await assignAWB(shipOrder.shipment_id);
        if (awbRes?.awb_code) {
          order.shiprocketAWB = awbRes.awb_code;
        }

        order.deliveryStatus = "Packed";
      } else {
        console.log("❌ Shiprocket returned invalid order:", shipOrder);
      }
    } catch (err) {
      console.log("⚠️ Shiprocket Error (Order will still be saved):", err.message);
    }

    await order.save();

    // ------------------------------
    // REDUCE STOCK
    // ------------------------------
    for (const item of cart.items) {
      await Product.updateOne(
        { _id: item.product._id },
        { $inc: { stock: -item.quantity } }
      );
    }

    // ------------------------------
    // CLEAR CART
    // ------------------------------
    cart.items = [];
    cart.totalAmount = 0;
    await cart.save();

    // ------------------------------
    // SUCCESS
    // ------------------------------
    res.status(201).json({
      success: true,
      message:
        shipOrder
          ? "Order placed successfully & sent to Shiprocket"
          : "Order placed successfully (Shiprocket failed)",
      order,
      shiprocket: {
        order: shipOrder || null,
        awb: awbRes || null,
      },
    });
  } catch (error) {
    console.error("❌ CREATE ORDER ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Order creation failed",
      error: error.message,
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
