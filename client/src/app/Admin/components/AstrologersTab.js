"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FaCheckCircle, FaTrash, FaStar } from "react-icons/fa";
import toast from "react-hot-toast";
import api from "../../lib/api";

export default function AstrologersTab() {
  const [astrologers, setAstrologers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  /* ================= FETCH ASTROLOGERS ================= */
  const fetchAstrologers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/admin/astrologers");
      setAstrologers(res.data || []);
    } catch (err) {
      toast.error("Failed to load astrologers");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAstrologers();
  }, []);

  /* ================= APPROVE ASTROLOGER ================= */
  const approveAstrologer = async (id) => {
    if (!confirm("Approve this astrologer? Password will be emailed.")) return;

    try {
      await api.patch(`/admin/astrologers/approve/${id}`);
      toast.success("Astrologer approved & credentials sent");
      fetchAstrologers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Approval failed");
    }
  };

  /* ================= DELETE ASTROLOGER ================= */
  const deleteAstrologer = async (id) => {
    if (!confirm("Delete this astrologer permanently?")) return;

    try {
      await api.delete(`/admin/astrologers/${id}`);
      toast.success("Astrologer deleted");
      fetchAstrologers();
    } catch (err) {
      toast.error("Delete failed");
    }
  };

  /* ================= FILTER ================= */
  const filteredAstrologers = astrologers.filter(
    (a) =>
      a.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.expertise?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  /* ================= UI ================= */
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[#003D33]">
            Astrologer Management
          </h2>
          <p className="text-sm text-[#00695C]">
            Approve, monitor & manage astrologers
          </p>
        </div>

        <input
          placeholder="Search astrologer..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="border rounded-lg px-4 py-2 text-sm w-full md:w-64"
        />
      </div>

      {/* Loader */}
      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-10 h-10 border-4 border-[#C06014]/30 border-t-[#C06014] rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredAstrologers.map((ast) => (
            <motion.div
              key={ast._id}
              whileHover={{ y: -4 }}
              className="bg-white rounded-2xl border border-[#B2C5B2]/40 shadow-md p-5"
            >
              {/* Header */}
              <div className="flex items-center gap-4 mb-4">
                {ast.profileImageUrl ? (
                  <img
                    src={`${process.env.NEXT_PUBLIC_IMAGE_URL}${ast.profileImageUrl}`}
                    className="w-14 h-14 rounded-xl object-cover"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-[#ECE5D3] flex items-center justify-center text-xl font-bold text-[#003D33]">
                    {ast.fullName?.[0]}
                  </div>
                )}

                <div>
                  <h3 className="font-semibold text-[#003D33]">
                    {ast.fullName}
                  </h3>
                  <p className="text-xs text-[#00695C]">
                    {ast.expertise}
                  </p>
                </div>
              </div>

              {/* Info */}
              <div className="space-y-1 text-xs mb-4">
                <InfoRow label="Email" value={ast.email} />
                <InfoRow label="Phone" value={ast.phone} />
                <InfoRow label="Rate" value={`₹${ast.minuteRate}/min`} />
                <InfoRow label="Age" value={ast.age}/>
                <InfoRow
                  label="Status"
                  value={ast.isApproved ? "Approved" : "Pending"}
                  badge={
                    ast.isApproved
                      ? "bg-green-100 text-green-600"
                      : "bg-amber-100 text-amber-600"
                  }
                />
              </div>

              {/* Rating */}
              <div className="flex items-center gap-1 text-sm mb-4">
                <FaStar className="text-amber-400" />
                <span className="font-semibold text-[#003D33]">
                  {ast.averageRating || 0}
                </span>
                <span className="text-[#00695C]">
                  ({ast.totalConsultations || 0} chats)
                </span>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                {!ast.isApproved && (
                  <button
                    onClick={() => approveAstrologer(ast._id)}
                    className="flex-1 bg-green-600 text-white py-2 rounded-lg text-sm flex items-center justify-center gap-1"
                  >
                    <FaCheckCircle /> Approve
                  </button>
                )}

                <button
                  onClick={() => deleteAstrologer(ast._id)}
                  className="flex-1 bg-red-500 text-white py-2 rounded-lg text-sm flex items-center justify-center gap-1"
                >
                  <FaTrash /> Delete
                </button>
              </div>
            </motion.div>
          ))}

          {!filteredAstrologers.length && (
            <div className="col-span-full text-center py-16 text-[#00695C]">
              No astrologers found
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ================= SMALL COMPONENT ================= */
const InfoRow = ({ label, value, badge }) => (
  <div className="flex justify-between">
    <span className="text-[#00695C]">{label}</span>
    <span className={`px-2 py-1 rounded ${badge || ""}`}>{value}</span>
  </div>
);
