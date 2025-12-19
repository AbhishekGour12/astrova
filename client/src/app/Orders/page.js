"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FaTruck, FaChevronDown, FaChevronUp, FaBox, FaMapMarkerAlt, FaMoneyBill } from "react-icons/fa";
import { orderAPI } from "../lib/order";
import toast from "react-hot-toast";
import OrderTracking from "../components/OrderTracking";

const MyOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [trackId, setTrackId] = useState(null);
  const [expanded, setExpanded] = useState({});
const normalizeStatus = (status = "") =>
  status.toLowerCase().replace(/_/g, " ").trim();


  const loadOrders = async () => {
    try {
      const data = await orderAPI.getUserOrders();
      console.log(data)
      setOrders(data.orders);
      console.log(data)
    } catch (e) {
      toast.error(e.message);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const toggleExpand = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const getStatusStyle = (status) => {
  const s = normalizeStatus(status);

  if (s === "delivered")
    return "bg-green-200 text-green-800";

  if (s === "out for delivery")
    return "bg-orange-200 text-orange-800";

  if (["in transit", "reached at hub"].includes(s))
    return "bg-blue-200 text-blue-800";

  if (["picked up", "out for pickup"].includes(s))
    return "bg-purple-200 text-purple-800";

  if (s.includes("rto"))
    return "bg-red-200 text-red-800";

  return "bg-amber-200 text-amber-800";
};

const getProgressStep = (status = "") => {
  const s = normalizeStatus(status);

  if (s === "order placed") return 0;
  if (s === "pickup scheduled") return 1;
  if (s === "picked up") return 2;
  if (s === "in transit") return 3;
  if (s === "out for delivery") return 4;
  if (s === "delivered") return 5;
  if(s === "undelivered") return 6;
  if(s === "pickup generated") return 1;
  if(s === "pickup completed") return 2;
  if(s.includes("rto")) return 7;

  return 0;
};

const mapStatusForUser = (status = "") => {
  const s = normalizeStatus(status);

  if (["order placed", "processing"].includes(s))
    return "Order Placed";

  if (["pickup scheduled"].includes(s))
    return "Pickup Scheduled";

  if (["out for pickup", "picked up", "pickup completed"].includes(s))
    return "Picked Up";

  // 🔥 VERY IMPORTANT
  // SHIPPED === IN TRANSIT (user meaning)
  if (["shipped", "in transit", "reached at hub", "departed hub"].includes(s))
    return "In Transit";

  if (["out for delivery"].includes(s))
    return "Out for Delivery";

  if (["delivered"].includes(s))
    return "Delivered";
  
  if (["undelivered"].includes(s))
    return "In Transit";
  if(["pickup generated"].includes(s))
    return "Pickup scheduled";

  if (s.includes("rto"))
    return "Returned";

  return "Processing";
};


  return (
    <div className="min-h-screen bg-[#F7F3E9] p-6">
      <div className="max-w-4xl mx-auto mt-32">

        <h2 className="text-3xl font-bold text-[#003D33] mb-8">My Orders</h2>

        {orders.length === 0 && (
          <p className="text-center text-gray-500 mt-10">You have no orders yet.</p>
        )}

        {trackId && (
          <OrderTracking shipmentId={trackId} onClose={() => setTrackId(null)} />
        )}

        <div className="space-y-6">
          {orders.map((order) => (
            <motion.div
              key={order._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 rounded-2xl shadow  border-[#B2C5B2]"
            >
              {/* HEADER */}
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-semibold text-[#003D33] text-lg">
                    Order #{order._id.slice(-6)}
                  </p>
                  <p className="text-sm text-[#00695C]">
                    {new Date(order.createdAt).toLocaleString()}
                  </p>
                </div>

          <span
  className={`px-3 py-1 rounded-xl text-sm font-semibold
  ${getStatusStyle(mapStatusForUser(order.shiprocketStatus))}`}
>
  {mapStatusForUser(order.shiprocketStatus)}
</span>



              </div>

             {/* ITEMS */}
<div className="mt-5 space-y-3">
  {order.items.map((i, idx) => (
    <div
      key={idx}
      className="flex items-center gap-4 bg-[#ECE5D3] p-4 rounded-xl"
    >
      {/* PRODUCT IMAGE */}
      <img
        src={`${process.env.NEXT_PUBLIC_API}${i.product?.imageUrls?.[0]}`}
        className="w-16 h-16 rounded-lg object-cover border"
        alt={i.product?.name}
      />

      {/* PRODUCT INFO */}
      <div className="flex-1">
        <p className="font-semibold text-[#003D33]">
          {i.product?.name}
        </p>
        <p className="text-sm text-gray-600">Qty: {i.quantity}</p>
      </div>

      {/* PRICE */}
      <p className="font-bold text-[#C06014]">
        ₹{i.product.price}
      </p>
    </div>
  ))}
</div>


              {/* TOTAL + TRACK */}
              <div className="flex justify-between items-center mt-5">
                <p className="font-bold text-xl text-[#003D33]">
                  Total: ₹{order.totalAmount}
                </p>

                {order.shiprocketOrderId ? (
                  <button
                    onClick={() => setTrackId(order.shiprocketOrderId)}
                    className="px-4 py-2 bg-[#C06014] text-white rounded-xl flex items-center gap-2 shadow hover:opacity-90"
                  >
                    <FaTruck /> Track Order
                  </button>
                ) : (
                  <button
                    disabled
                    className="px-4 py-2 bg-gray-300 text-gray-600 rounded-xl flex items-center gap-2 cursor-not-allowed"
                  >
                    <FaTruck /> Creating Shipment...
                  </button>
                )}
              </div>

              {/* EXPAND BUTTON */}
              <button
                onClick={() => toggleExpand(order._id)}
                className="mt-4 flex items-center gap-2 text-[#C06014] font-semibold"
              >
                {expanded[order._id] ? <FaChevronUp /> : <FaChevronDown />}
                {expanded[order._id] ? "Hide Details" : "View Details"}
              </button>

              {/* EXPANDED AREA */}
              {expanded[order._id] && (
                <div className="mt-5 border-t border-gray-300 pt-4 space-y-4">

                  {/* SHIPPING ADDRESS */}
                  <div className="flex items-start gap-3">
                    <FaMapMarkerAlt className="text-[#C06014] mt-1" />
                    <div>
                      <p className="text-[#003D33] font-semibold">Delivery Address</p>
                      <p className="text-gray-700 text-sm">
                        {order.shippingAddress.fullName}, {order.shippingAddress.addressLine1},{" "}
                        {order.shippingAddress.city}, {order.shippingAddress.state} -{" "}
                        {order.shippingAddress.pincode}
                      </p>
                    </div>
                  </div>

                  {/* PAYMENT METHOD */}
                  <div className="flex items-center gap-3">
                    <FaMoneyBill className="text-[#00695C]" />
                    <p className="text-gray-800">
                      Payment: <span className="font-semibold">{order.paymentMethod.toUpperCase()}</span>
                    </p>
                  </div>

                  {/* SHIPMENT INFO */}
                  {order.shiprocketOrderId && (
                    <div className="bg-[#ECE5D3] p-4 rounded-xl">
                      <p className="font-semibold text-[#003D33]">Shipment Info</p>
                      <p className="text-sm text-gray-700">Order ID: {order.shiprocketOrderId}</p>
                      <p className="text-sm text-gray-700">Shipment ID: {order.shiprocketShipmentId}</p>
                     <p className="text-sm text-gray-700">
  AWB: <span className="font-semibold">{order.awbCode || "Assigning..."}</span>
</p>

                    </div>
                  )}

                  {/* ORDER STATUS TIMELINE */}
                  <div className="mt-3">
                    <p className="font-semibold text-[#003D33] mb-2">Order Progress</p>

                    <div className="flex items-center justify-between">
                 {[
  "Order Placed",
  "Pickup Scheduled",
  "Picked Up",
  "In Transit",
  "Out for Delivery",
  "Delivered"
].map((step, index) => {
  const isActive = index <= getProgressStep(mapStatusForUser(order.shiprocketStatus))

  return (
    <div key={index} className="flex flex-col items-center w-full">
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs
        ${isActive ? "bg-[#C06014]" : "bg-gray-300"}`}
      >
        {index + 1}
      </div>
      <p className="text-xs mt-1 text-center text-gray-700">{step}</p>
    </div>
  );
})}


                    </div>
                  </div>

                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MyOrdersPage;
