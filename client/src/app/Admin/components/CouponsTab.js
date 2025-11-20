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

  // ------------------------------
  // LOAD ALL COUPONS
  // ------------------------------
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

  // ------------------------------
  // OPEN ADD COUPON MODAL
  // ------------------------------
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

  // ------------------------------
  // OPEN EDIT MODAL
  // ------------------------------
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

  // ------------------------------
  // ADD OR UPDATE COUPON
  // ------------------------------
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

  // ------------------------------
  // DELETE COUPON
  // ------------------------------
  const deleteCoupon = async (id) => {
    if (!confirm("Are you sure you want to delete this coupon?")) return;

    try {
      await couponAPI.delete(id);
      toast.success("Coupon deleted successfully");
      loadCoupons();
    } catch (error) {
      toast.error(error.message);
    }
  };

  // ------------------------------
  // TOGGLE ACTIVE / INACTIVE
  // ------------------------------
  const toggleStatus = async (id) => {
    try {
      await couponAPI.toggleStatus(id);
      toast.success("Status updated!");
      loadCoupons();
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 shadow-xl border border-[#B2C5B2]">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-[#003D33]">Coupons Management</h2>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={openAddModal}
          className="px-5 py-3 bg-gradient-to-r from-[#C06014] to-[#D47C3A] text-white rounded-2xl font-semibold flex items-center gap-2"
        >
          <FaPlus /> Add Coupon
        </motion.button>
      </div>

      {/* TABLE */}
      <div className="overflow-auto rounded-2xl border border-[#ECE5D3]">

        <table className="w-full text-left">
          <thead className="bg-[#F7F3E9] text-[#003D33]">
            <tr>
              <th className="p-4">Code</th>
              <th className="p-4">Discount</th>
              <th className="p-4">Min Amount</th>
              <th className="p-4">Max Discount</th>
              <th className="p-4">Expires</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr><td colSpan="7" className="py-8 text-center text-gray-500">Loading...</td></tr>
            ) : coupons.length === 0 ? (
              <tr><td colSpan="7" className="py-8 text-center text-gray-500">No coupons added yet.</td></tr>
            ) : (
              coupons.map((cp) => (
                <tr key={cp._id} className="border-t border-[#ECE5D3]">
                  <td className="p-4 font-semibold">{cp.code}</td>

                  <td className="p-4">
                    {cp.discountType === "percentage"
                      ? `${cp.discountValue}%`
                      : `₹${cp.discountValue}`}
                  </td>

                  <td className="p-4">₹{cp.minAmount}</td>
                  <td className="p-4">₹{cp.maxDiscount}</td>
                  <td className="p-4">{cp.expiresAt?.slice(0, 10)}</td>

                  <td className="p-4">
                    <span
                      className={`px-3 py-1 text-sm rounded-xl font-semibold ${
                        cp.active
                          ? "bg-green-200 text-green-700"
                          : "bg-red-200 text-red-700"
                      }`}
                    >
                      {cp.active ? "Active" : "Inactive"}
                    </span>
                  </td>

                  <td className="p-4 flex items-center gap-4 justify-center">
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

      {/* MODAL */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            {/* BACKDROP */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.45 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]"
              onClick={closeModal}
            />

            {/* MODAL BOX */}
            <motion.div
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              className="fixed top-1/2 left-1/2 w-full max-w-lg 
                         -translate-x-1/2 -translate-y-1/2 bg-white 
                         rounded-3xl shadow-2xl p-8 z-[9999] 
                         border border-[#ECE5D3]"
            >
              <h3 className="text-2xl font-bold text-[#003D33] mb-6">
                {editingCoupon ? "Edit Coupon" : "Add New Coupon"}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-5">

                {/* CODE */}
                <div>
                  <label className="font-medium">Coupon Code *</label>
                  <input
                    required
                    value={couponData.code}
                    onChange={(e) =>
                      setCouponData({ ...couponData, code: e.target.value })
                    }
                    className="w-full p-3 border border-[#B2C5B2] rounded-xl bg-[#F7F3E9]"
                    placeholder="e.g. DIWALI10"
                  />
                </div>

                {/* DISCOUNT TYPE */}
                <div>
                  <label className="font-medium">Discount Type *</label>
                  <select
                    value={couponData.discountType}
                    onChange={(e) =>
                      setCouponData({
                        ...couponData,
                        discountType: e.target.value,
                      })
                    }
                    className="w-full p-3 border border-[#B2C5B2] rounded-xl bg-[#F7F3E9]"
                  >
                    <option value="percentage">Percentage</option>
                    <option value="flat">Flat Amount</option>
                  </select>
                </div>

                {/* DISCOUNT VALUE */}
                <div>
                  <label className="font-medium">Discount Value *</label>
                  <input
                    type="number"
                    required
                    value={couponData.discountValue}
                    onChange={(e) =>
                      setCouponData({
                        ...couponData,
                        discountValue: e.target.value,
                      })
                    }
                    className="w-full p-3 border border-[#B2C5B2] rounded-xl bg-[#F7F3E9]"
                    placeholder="10 or 200"
                  />
                </div>

                {/* MIN AMOUNT */}
                <div>
                  <label className="font-medium">Minimum Amount</label>
                  <input
                    type="number"
                    value={couponData.minAmount}
                    onChange={(e) =>
                      setCouponData({
                        ...couponData,
                        minAmount: e.target.value,
                      })
                    }
                    className="w-full p-3 border border-[#B2C5B2] rounded-xl bg-[#F7F3E9]"
                  />
                </div>

                {/* MAX DISCOUNT */}
                <div>
                  <label className="font-medium">Max Discount</label>
                  <input
                    type="number"
                    value={couponData.maxDiscount}
                    onChange={(e) =>
                      setCouponData({
                        ...couponData,
                        maxDiscount: e.target.value,
                      })
                    }
                    className="w-full p-3 border border-[#B2C5B2] rounded-xl bg-[#F7F3E9]"
                  />
                </div>

                {/* EXPIRY DATE */}
                <div>
                  <label className="font-medium">Expires At *</label>
                  <input
                    type="date"
                    required
                    value={couponData.expiresAt}
                    onChange={(e) =>
                      setCouponData({
                        ...couponData,
                        expiresAt: e.target.value,
                      })
                    }
                    className="w-full p-3 border border-[#B2C5B2] rounded-xl bg-[#F7F3E9]"
                  />
                </div>

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

export default CouponsTab;
