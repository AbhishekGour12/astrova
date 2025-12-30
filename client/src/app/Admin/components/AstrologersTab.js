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
  const [selectedAstrologer, setSelectedAstrologer] = useState(null);


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
    <div>
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
             <div className="flex flex-col gap-2">
  <button
    onClick={() => setSelectedAstrologer(ast)}
    className="w-full border border-[#00695C] text-[#00695C] py-2 rounded-lg text-sm hover:bg-[#F7F3E9]"
  >
    View Profile
  </button>

  {!ast.isApproved && (
    <button
      onClick={() => approveAstrologer(ast._id)}
      className="bg-green-600 text-white py-2 rounded-lg text-sm flex items-center justify-center gap-1"
    >
      <FaCheckCircle /> Approve
    </button>
  )}

  <button
    onClick={() => deleteAstrologer(ast._id)}
    className="bg-red-500 text-white py-2 rounded-lg text-sm flex items-center justify-center gap-1"
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
    {selectedAstrologer&& (
  <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
    <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 relative">

      {/* Close */}
      <button
        onClick={() => setSelectedAstrologer(null)}
        className="absolute top-3 right-4 text-xl text-gray-500 hover:text-black"
      >
        ✕
      </button>

      {/* Header */}
      <div className="flex gap-5 items-center mb-6">
        <img
          src={`${process.env.NEXT_PUBLIC_IMAGE_URL}${selectedAstrologer.profileImageUrl}`}
          className="w-24 h-24 rounded-xl object-cover border"
        />
        <div>
          <h2 className="text-2xl font-bold text-[#003D33]">
            {selectedAstrologer.fullName}
          </h2>
          <p className="text-[#00695C] text-sm">
            {selectedAstrologer.expertise?.join(", ")}
          </p>
          <p className="text-xs text-gray-500">
            {selectedAstrologer.languages?.join(", ")}
          </p>
        </div>
      </div>

      {/* DETAILS GRID */}
      <div className="grid md:grid-cols-2 gap-4 text-sm">
        <ProfileRow label="Email" value={selectedAstrologer.email} />
        <ProfileRow label="Phone" value={selectedAstrologer.phone} />
        <ProfileRow label="Gender" value={selectedAstrologer.gender} />
        <ProfileRow label="Age" value={selectedAstrologer.age} />
        <ProfileRow label="Experience" value={`${selectedAstrologer.experienceYears} years`} />
        <ProfileRow label="Education" value={selectedAstrologer.education} />
        <ProfileRow label="Availability" value={selectedAstrologer.availability} />
        <ProfileRow label="Chat Rate" value={`₹${selectedAstrologer.pricing?.chatPerMinute}/min`} />
        <ProfileRow label="Call Rate" value={`₹${selectedAstrologer.pricing?.callPerMinute}/min`} />
        <ProfileRow label="Total Earnings" value={`₹${selectedAstrologer.totalEarnings}`} />
      </div>

      {/* BIO */}
      <div className="mt-4">
        <h4 className="font-semibold text-[#003D33] mb-1">Bio</h4>
        <p className="text-sm text-gray-700">
          {selectedAstrologer.bio}
        </p>
      </div>

      {/* ACHIEVEMENTS */}
      {selectedAstrologer.achievements?.length > 0 && (
        <div className="mt-4">
          <h4 className="font-semibold text-[#003D33] mb-1">Achievements</h4>
          <ul className="list-disc pl-5 text-sm text-gray-700">
            {selectedAstrologer.achievements.map((a, i) => (
              <li key={i}>{a}</li>
            ))}
          </ul>
        </div>
      )}

      {/* CERTIFICATIONS */}
      {selectedAstrologer.certifications?.length > 0 && (
        <div className="mt-6">
          <h4 className="font-semibold text-[#003D33] mb-2">
            Certifications
          </h4>

          {selectedAstrologer.certifications.map((c) => (
            <div
              key={c._id}
              className="flex items-center justify-between border rounded-lg p-3 mb-2"
            >
              <span className="text-sm">{c.title}</span>

              <a
                href={`${process.env.NEXT_PUBLIC_IMAGE_URL}${c.fileUrl}`}
                download
                target="_blank"
                className="text-sm text-[#C06014] font-medium hover:underline"
              >
                Download
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
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

const ProfileRow = ({ label, value }) => (
  <div className="flex justify-between border-b pb-1">
    <span className="text-[#00695C]">{label}</span>
    <span className="font-medium text-[#003D33]">{value || "-"}</span>
  </div>
);
