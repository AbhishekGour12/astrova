"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FaTruck, FaMapMarkerAlt } from "react-icons/fa";
import { orderAPI } from "../lib/order";
import toast from "react-hot-toast";

const OrderTracking = ({ shipmentId, onClose }) => {
  const [tracking, setTracking] = useState(null);

  const loadTracking = async () => {
    try {
      const data = await orderAPI.trackOrder(shipmentId);
      setTracking(data);
    } catch (e) {
      toast.error("Failed to load tracking");
    }
  };

  useEffect(() => {
    loadTracking();
  }, [shipmentId]);

  if (!tracking)
    return (
      <div className="text-center p-10">
        <p>Loading tracking...</p>
      </div>
    );

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[99999]"
    >
      <div className="bg-white w-full max-w-lg p-6 rounded-2xl shadow-xl">
        
        {/* HEADER */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-xl text-[#003D33]">Order Tracking</h2>
          <button onClick={onClose} className="text-red-600 text-lg">✕</button>
        </div>

        {/* SUMMARY */}
        <div className="p-4 bg-[#ECE5D3] rounded-xl mb-4">
          <p className="text-[#003D33] font-semibold">
            Courier: {tracking?.courier_name}
          </p>
          <p className="text-[#00695C]">AWB: {tracking?.awb}</p>
          <p className="font-bold mt-2 text-[#C06014]">
            Current Status: {tracking?.current_status}
          </p>
        </div>

        {/* TIMELINE */}
        <div className="space-y-4 max-h-80 overflow-auto pr-2">
          {tracking?.tracking_data?.shipment_track?.map((event, i) => (
            <div key={i} className="flex items-start gap-3">
              <FaMapMarkerAlt className="text-[#C06014] mt-1" />
              <div>
                <p className="font-semibold text-[#003D33]">{event.activity}</p>
                <p className="text-sm text-gray-600">{event.location}</p>
                <p className="text-xs text-[#00695C]">
                  {new Date(event.date).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default OrderTracking;
