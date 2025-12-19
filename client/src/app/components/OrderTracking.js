"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FaTruck, FaMapMarkerAlt, FaClock } from "react-icons/fa";
import { orderAPI } from "../lib/order";
import toast from "react-hot-toast";

const statusColor = {
  Delivered: "text-green-700",
  "Out for Delivery": "text-orange-600",
  "In Transit": "text-blue-600",
  Processing: "text-gray-600"
};

const OrderTracking = ({ shipmentId, onClose }) => {
  const [tracking, setTracking] = useState(null);
  const [loading, setLoading] = useState(true);
 
  const loadTracking = async () => {
    try {
      setLoading(true);
      const data = await orderAPI.trackOrder(shipmentId);
      console.log(data)
      setTracking(data);
    } catch {
      toast.error("Failed to load tracking details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (shipmentId) loadTracking();
  }, [shipmentId]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[99999]">
        <div className="bg-white px-6 py-4 rounded-xl">Fetching tracking…</div>
      </div>
    );
  }

  if (!tracking) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[99999]"
    >
      <div className="bg-white w-full max-w-lg p-6 rounded-2xl shadow-xl">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-xl text-[#003D33] flex items-center gap-2">
            <FaTruck /> Order Tracking
          </h2>
          <button onClick={onClose} className="text-red-600 text-lg">✕</button>
        </div>

        {/* SUMMARY */}
        <div className="bg-[#ECE5D3] p-4 rounded-xl mb-4">
          <p className="font-semibold text-[#003D33]">
            Courier: {tracking.courier}
          </p>
          <p className="text-sm text-[#00695C]">AWB: {tracking.awb}</p>

          <p className={`font-bold mt-2 ${statusColor[tracking.current_status]}`}>
           Status: {tracking.current_status}
          </p>

          {tracking.etd && (
            <p className="text-xs text-gray-600 mt-1 flex items-center gap-1">
              <FaClock /> Expected by {new Date(tracking.etd).toDateString()}
            </p>
          )}
        </div>

        {/* TIMELINE */}
        <div className="space-y-4 max-h-72 overflow-y-auto pr-2">
          {tracking.tracking_data?.shipment_track_activities?.map((event, idx) => (
            <div key={idx} className="flex gap-3">
              <FaMapMarkerAlt className="text-[#C06014] mt-1" />
              <div>
                <p className="font-semibold text-[#003D33]">{event.activity}</p>
                <p className="text-xs text-gray-600">{event.location || "-"}</p>
                <p className="text-xs text-[#00695C]">
                  {new Date(event.date).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* TRACK LINK */}
        {tracking.track_url && (
          <a
            href={tracking.track_url}
            target="_blank"
            className="block mt-4 text-center text-[#C06014] font-semibold underline"
          >
            Track on Courier Website
          </a>
        )}
      </div>
    </motion.div>
  );
};

export default OrderTracking;
