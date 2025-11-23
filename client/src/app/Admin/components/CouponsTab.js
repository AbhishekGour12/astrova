"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaPlus,
  FaTrash,
  FaEdit,
  FaToggleOn,
  FaToggleOff,
} from "react-icons/fa";
import toast from "react-hot-toast";
import { couponAPI } from "../../lib/coupons";

const CouponsTab = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);

  const [couponData, setCouponData] = useState({
    code: "",
    discountType: "percentage",
    discountValue: "",
    minAmount: "",
    maxDiscount: "",
    expiresAt: "",
    active: true,
  });

  const loadCoupons = async () => {
    try {
      setLoading(true);
      const data = await couponAPI.getAll();
      setCoupons(data.coupons);
    } catch (error) {
      toast.error(error.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const openAddModal = () => {
    setEditingCoupon(null);
    setCouponData({
      code: "",
      discountType: "percentage",
      discountValue: "",
      minAmount: "",
      maxDiscount: "",
      expiresAt: "",
      active: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (coupon) => {
    setEditingCoupon(coupon);
    setCouponData({
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      minAmount: coupon.minAmount,
      maxDiscount: coupon.maxDiscount,
      expiresAt: coupon.expiresAt?.slice(0, 10),
      active: coupon.active,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCoupon(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCoupon) {
        await couponAPI.update(editingCoupon._id, couponData);
        toast.success("Coupon updated successfully!");
      } else {
        await couponAPI.create(couponData);
        toast.success("Coupon created successfully!");
      }
      closeModal();
      loadCoupons();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const deleteCoupon = async (id) => {
    if (!confirm("Delete this coupon?")) return;
    try {
      await couponAPI.delete(id);
      toast.success("Coupon deleted");
      loadCoupons();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const toggleStatus = async (id) => {
    try {
      await couponAPI.toggleStatus(id);
      toast.success("Status updated!");
      loadCoupons();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-xl border border-[#B2C5B2]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h2 className="text-2xl sm:text-3xl font-bold text-[#003D33]">
          Coupon Management
        </h2>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={openAddModal}
          className="px-5 py-3 bg-gradient-to-r from-[#C06014] to-[#D47C3A] text-white rounded-2xl font-semibold flex items-center gap-2"
        >
          <FaPlus /> Add Coupon
        </motion.button>
      </div>

      {/* Desktop Table */}
      <div className="hidden sm:block overflow-auto rounded-2xl border border-[#ECE5D3]">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#F7F3E9] text-[#003D33]">
            <tr>
              <th className="p-3">Code</th>
              <th className="p-3">Discount</th>
              <th className="p-3">Min Amount</th>
              <th className="p-3">Max Discount</th>
              <th className="p-3">Expires</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr><td colSpan="7" className="py-8 text-center text-gray-500">Loading...</td></tr>
            ) : coupons.length === 0 ? (
              <tr><td colSpan="7" className="py-8 text-center text-gray-500">No coupons yet.</td></tr>
            ) : (
              coupons.map((cp) => (
                <tr key={cp._id} className="border-t border-[#ECE5D3]">
                  <td className="p-3 font-semibold">{cp.code}</td>
                  <td className="p-3">
                    {cp.discountType === "percentage"
                      ? `${cp.discountValue}%`
                      : `₹${cp.discountValue}`}
                  </td>
                  <td className="p-3">₹{cp.minAmount}</td>
                  <td className="p-3">₹{cp.maxDiscount}</td>
                  <td className="p-3">{cp.expiresAt?.slice(0, 10)}</td>
                  <td className="p-3">
                    <span
                      className={`px-3 py-1 text-xs rounded-lg font-semibold ${
                        cp.active
                          ? "bg-green-200 text-green-700"
                          : "bg-red-200 text-red-700"
                      }`}
                    >
                      {cp.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="p-3 flex items-center justify-center gap-3">
                    <button onClick={() => toggleStatus(cp._id)}>
                      {cp.active ? (
                        <FaToggleOn className="text-2xl text-green-600" />
                      ) : (
                        <FaToggleOff className="text-2xl text-gray-400" />
                      )}
                    </button>

                    <button onClick={() => openEditModal(cp)}>
                      <FaEdit className="text-xl text-blue-600" />
                    </button>

                    <button onClick={() => deleteCoupon(cp._id)}>
                      <FaTrash className="text-xl text-red-500" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="grid sm:hidden gap-4">
        {coupons.map((cp) => (
          <motion.div
            key={cp._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border rounded-2xl p-4 shadow-sm"
          >
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-[#003D33] text-sm">{cp.code}</h3>
              <span
                className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                  cp.active
                    ? "bg-green-200 text-green-700"
                    : "bg-red-200 text-red-700"
                }`}
              >
                {cp.active ? "Active" : "Inactive"}
              </span>
            </div>

            <p className="text-xs text-[#00695C] mt-1">
              Discount:{" "}
              <strong>
                {cp.discountType === "percentage"
                  ? `${cp.discountValue}%`
                  : `₹${cp.discountValue}`}
              </strong>
            </p>
            <p className="text-xs text-[#00695C]">
              Min: ₹{cp.minAmount} | Max: ₹{cp.maxDiscount}
            </p>

            <p className="text-xs text-[#00695C] mt-1">
              Expires: {cp.expiresAt?.slice(0, 10)}
            </p>

            <div className="flex gap-3 justify-end mt-3">
              <button onClick={() => toggleStatus(cp._id)}>
                {cp.active ? (
                  <FaToggleOn className="text-lg text-green-600" />
                ) : (
                  <FaToggleOff className="text-lg text-gray-400" />
                )}
              </button>

              <button onClick={() => openEditModal(cp)}>
                <FaEdit className="text-lg text-blue-600" />
              </button>

              <button onClick={() => deleteCoupon(cp._id)}>
                <FaTrash className="text-lg text-red-500" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Coupon Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.45 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]"
              onClick={closeModal}
            />

            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              className="fixed top-1/2 left-1/2 w-[90%] max-w-lg 
                         -translate-x-1/2 -translate-y-1/2 bg-white 
                         rounded-3xl shadow-2xl p-6 z-[9999] 
                         border border-[#ECE5D3]"
            >
              <h3 className="text-2xl font-bold text-[#003D33] mb-4">
                {editingCoupon ? "Edit Coupon" : "Add New Coupon"}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">

                <InputField
                  label="Coupon Code *"
                  value={couponData.code}
                  onChange={(e) =>
                    setCouponData({ ...couponData, code: e.target.value })
                  }
                  required
                />

                <SelectField
                  label="Discount Type *"
                  value={couponData.discountType}
                  onChange={(e) =>
                    setCouponData({ ...couponData, discountType: e.target.value })
                  }
                  options={[
                    { value: "percentage", label: "Percentage" },
                    { value: "flat", label: "Flat Amount" },
                  ]}
                />

                <InputField
                  label="Discount Value *"
                  type="number"
                  value={couponData.discountValue}
                  onChange={(e) =>
                    setCouponData({ ...couponData, discountValue: e.target.value })
                  }
                  required
                />

                <InputField
                  label="Minimum Amount"
                  type="number"
                  value={couponData.minAmount}
                  onChange={(e) =>
                    setCouponData({ ...couponData, minAmount: e.target.value })
                  }
                />

                <InputField
                  label="Max Discount"
                  type="number"
                  value={couponData.maxDiscount}
                  onChange={(e) =>
                    setCouponData({ ...couponData, maxDiscount: e.target.value })
                  }
                />

                <InputField
                  label="Expires At *"
                  type="date"
                  value={couponData.expiresAt}
                  onChange={(e) =>
                    setCouponData({ ...couponData, expiresAt: e.target.value })
                  }
                  required
                />

                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-[#003D33] to-[#00695C] text-white rounded-2xl font-semibold"
                >
                  {editingCoupon ? "Update Coupon" : "Create Coupon"}
                </button>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

/* Reusable InputField */
const InputField = ({ label, ...props }) => (
  <div>
    <label className="font-medium">{label}</label>
    <input
      {...props}
      className="w-full p-3 border border-[#B2C5B2] rounded-xl bg-[#F7F3E9]"
    />
  </div>
);

/* Reusable SelectField */
const SelectField = ({ label, options, ...props }) => (
  <div>
    <label className="font-medium">{label}</label>
    <select
      {...props}
      className="w-full p-3 border border-[#B2C5B2] rounded-xl bg-[#F7F3E9]"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  </div>
);

export default CouponsTab;
