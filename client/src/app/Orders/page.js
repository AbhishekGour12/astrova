"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FaTruck } from "react-icons/fa";
import { orderAPI } from "../lib/order";
import toast from "react-hot-toast";
import OrderTracking from "../../components/OrderTracking"; // 🔥 tracking modal

const MyOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [trackId, setTrackId] = useState(null); // tracking modal

  const loadOrders = async () => {
    try {
      const data = await orderAPI.getUserOrders();
      setOrders(data.orders);
    } catch (e) {
      toast.error(e.message);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const getStatusStyle = (status) => {
    switch (status?.toLowerCase()) {
      case "delivered":
        return "bg-green-200 text-green-800";
      case "intransit":
        return "bg-blue-200 text-blue-800";
      case "shipped":
        return "bg-indigo-200 text-indigo-800";
      case "cancelled":
        return "bg-red-200 text-red-800";
      default:
        return "bg-amber-200 text-amber-800";
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F3E9] p-6">
      <div className="max-w-4xl mx-auto">

        {/* PAGE TITLE */}
        <h2 className="text-3xl font-bold text-[#003D33] mb-8">
          My Orders
        </h2>

        {/* EMPTY STATE */}
        {orders.length === 0 && (
          <p className="text-center text-gray-500 mt-10">
            You have no orders yet.
          </p>
        )}

        {trackId && (
          <OrderTracking 
            shipmentId={trackId}
            onClose={() => setTrackId(null)}
          />
        )}

        {/* ORDER LIST */}
        <div className="space-y-6">
          {orders.map((order) => (
            <motion.div
              key={order._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 rounded-2xl shadow border border-[#B2C5B2]"
            >
              {/* ORDER HEADER */}
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
                  className={`px-3 py-1 rounded-xl text-sm font-semibold ${getStatusStyle(
                    order.shiprocketStatus
                  )}`}
                >
                  {order.shiprocketStatus || "Processing"}
                </span>
              </div>

              {/* ORDERED ITEMS */}
              <div className="mt-5 space-y-3">
                {order.items.map((i, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-4 bg-[#ECE5D3] p-4 rounded-xl"
                  >
                    <img
                      src={`${process.env.NEXT_PUBLIC_API}${i.image}`}
                      className="w-16 h-16 rounded-lg object-cover border"
                    />

                    <div className="flex-1">
                      <p className="font-semibold text-[#003D33]">
                        {i.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        Qty: {i.quantity}
                      </p>
                    </div>

                    <p className="font-bold text-[#C06014]">
                      ₹{i.priceAtPurchase}
                    </p>
                  </div>
                ))}
              </div>

              {/* FOOTER */}
              <div className="flex justify-between items-center mt-5">
                <p className="font-bold text-xl text-[#003D33]">
                  Total: ₹{order.totalAmount}
                </p>

                <div className="flex gap-3">
                  {order.shiprocketShipmentId ? (
                    <button
                      onClick={() => setTrackId(order.shiprocketShipmentId)}
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
              </div>

            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MyOrdersPage;
