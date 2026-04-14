"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FaCheckCircle, FaTrash, FaStar, FaDownload, FaEye, FaTimes, FaPhone, FaComments, FaUserClock, FaEdit, FaSave, FaAlignRight, FaArrowRight } from "react-icons/fa";
import { MdEmail, MdLocationOn } from "react-icons/md";
import { FiPhone, FaRupeeSign } from "react-icons/fa";
import toast from "react-hot-toast";
import api from "../../lib/api";

export default function AstrologersTab() {
  const [astrologers, setAstrologers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedAstrologer, setSelectedAstrologer] = useState(null);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({});

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
    const loadingToast = toast.loading("Approving astrologer...");
    try {
      await api.patch(`/admin/astrologers/approve/${id}`);
      toast.success("Astrologer approved & credentials sent", {
        id: loadingToast,
      });
      fetchAstrologers();
    } catch (err) {
      toast.error(err.response?.data?.message || "Approval failed", {
        id: loadingToast,
      });
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

  /* ================= UPDATE ASTROLOGER ================= */
  const updateAstrologer = async (id, updatedData) => {
    const loadingToast = toast.loading("Updating astrologer details...");
    try {
      const response = await api.put(`/admin/astrologers/${id}`, updatedData);
      toast.success("Astrologer updated successfully", {
        id: loadingToast,
      });
      fetchAstrologers();
      setIsEditing(false);
      setSelectedAstrologer(response.data.astrologer);
      return response.data;
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed", {
        id: loadingToast,
      });
      throw err;
    }
  };

  /* ================= DOWNLOAD DOCUMENT ================= */
  const downloadDocument = async (url, filename) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_IMAGE_URL}${url}`);
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);
      toast.success("Document downloaded");
    } catch (err) {
      toast.error("Failed to download document");
    }
  };

  /* ================= HANDLE EDIT ================= */
  const handleEditClick = () => {
    setIsEditing(true);
    setEditFormData({
      fullName: selectedAstrologer.fullName || "",
      email: selectedAstrologer.email || "",
      phone: selectedAstrologer.phone || "",
      age: selectedAstrologer.age || "",
      gender: selectedAstrologer.gender || "",
      languages: Array.isArray(selectedAstrologer.languages) 
        ? selectedAstrologer.languages.join(", ") 
        : selectedAstrologer.languages || "",
      expertise: Array.isArray(selectedAstrologer.expertise)
        ? selectedAstrologer.expertise.join(", ")
        : selectedAstrologer.expertise || "",
      experienceYears: selectedAstrologer.experienceYears || "",
      education: selectedAstrologer.education || "",
      certificationTitle: selectedAstrologer.certificationTitle || "",
      availability: selectedAstrologer.availability || "BOTH",
      chatPerMinute: selectedAstrologer.pricing?.chatPerMinute || "",
      callPerMinute: selectedAstrologer.pricing?.callPerMinute || "",
      bio: selectedAstrologer.bio || "",
      achievements: Array.isArray(selectedAstrologer.achievements)
        ? selectedAstrologer.achievements.join("\n")
        : selectedAstrologer.achievements || "",
      bankName: selectedAstrologer.bankName || "",
      bankAccountNumber: selectedAstrologer.bankAccountNumber || "",
      ifsc: selectedAstrologer.ifsc || "",
    });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    // Prepare update data
    const updateData = {
      fullName: editFormData.fullName,
      email: editFormData.email,
      phone: editFormData.phone,
      age: editFormData.age ? parseInt(editFormData.age) : undefined,
      gender: editFormData.gender,
      languages: editFormData.languages ? editFormData.languages.split(",").map(l => l.trim()) : [],
      expertise: editFormData.expertise ? editFormData.expertise.split(",").map(e => e.trim()) : [],
      experienceYears: editFormData.experienceYears ? parseInt(editFormData.experienceYears) : 0,
      education: editFormData.education,
      certificationTitle: editFormData.certificationTitle,
      availability: editFormData.availability,
      pricing: {
        chatPerMinute: editFormData.chatPerMinute ? parseInt(editFormData.chatPerMinute) : 0,
        callPerMinute: editFormData.callPerMinute ? parseInt(editFormData.callPerMinute) : 0,
      },
      bio: editFormData.bio,
      achievements: editFormData.achievements ? editFormData.achievements.split("\n").filter(a => a.trim()) : [],
      bankName: editFormData.bankName,
      bankAccountNumber: editFormData.bankAccountNumber,
      ifsc: editFormData.ifsc,
    };

    await updateAstrologer(selectedAstrologer._id, updateData);
  };

  /* ================= FILTER ================= */
  const filteredAstrologers = astrologers.filter((a) => {
    const search = searchTerm.toLowerCase();
    return (
      a.fullName?.toLowerCase().includes(search) ||
      (Array.isArray(a.expertise)
        ? a.expertise.join(" ").toLowerCase().includes(search)
        : a.expertise?.toLowerCase().includes(search)) ||
      a.email?.toLowerCase().includes(search)
    );
  });

  /* ================= AVAILABILITY BADGE ================= */
  const getAvailabilityBadge = (availability) => {
    const badges = {
      CHAT: { color: "bg-blue-100 text-blue-800", icon: <FaComments className="mr-1" />, text: "Chat Only" },
      CALL: { color: "bg-green-100 text-green-800", icon: <FaPhone className="mr-1" />, text: "Call Only" },
      BOTH: { color: "bg-purple-100 text-purple-800", icon: <><FaComments className="mr-1" /><FaPhone className="mr-1" /></>, text: "Chat + Call" },
      MEET: { color: "bg-amber-100 text-amber-800", icon: <FaUserClock className="mr-1" />, text: "Meet Only" },
      ALL: { color: "bg-indigo-100 text-indigo-800", icon: <><FaComments className="mr-1" /><FaPhone className="mr-1" /><FaUserClock className="mr-1" /></>, text: "All Services" }
    };
    return badges[availability] || { color: "bg-gray-100 text-gray-800", text: availability };
  };

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

        <div className="relative">
          <input
            placeholder="Search by name, expertise or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 pl-10 text-sm w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-[#003D33]"
          />
          <div className="absolute left-3 top-2.5 text-gray-400">
            🔍
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 border border-[#B2C5B2]/40 shadow-sm">
          <div className="text-sm text-gray-600">Total Astrologers</div>
          <div className="text-2xl font-bold text-[#003D33]">{astrologers.length}</div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-[#B2C5B2]/40 shadow-sm">
          <div className="text-sm text-gray-600">Approved</div>
          <div className="text-2xl font-bold text-green-600">
            {astrologers.filter(a => a.isApproved).length}
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-[#B2C5B2]/40 shadow-sm">
          <div className="text-sm text-gray-600">Pending</div>
          <div className="text-2xl font-bold text-amber-600">
            {astrologers.filter(a => !a.isApproved).length}
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border border-[#B2C5B2]/40 shadow-sm">
          <div className="text-sm text-gray-600">Active Today</div>
          <div className="text-2xl font-bold text-blue-600">
            {astrologers.filter(a => a.isOnline).length}
          </div>
        </div>
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
              className="bg-white rounded-2xl border border-[#B2C5B2]/40 shadow-md p-5 hover:shadow-lg transition-shadow"
            >
              {/* Header */}
              <div className="flex items-center gap-4 mb-4">
                {ast.profileImageUrl ? (
                  <img
                    src={`${process.env.NEXT_PUBLIC_API}${ast.profileImageUrl}`}
                    className="w-14 h-14 rounded-xl object-cover border-2 border-white shadow"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#ECE5D3] to-[#D8C9A3] flex items-center justify-center text-xl font-bold text-[#003D33] shadow">
                    {ast.fullName?.[0]}
                  </div>
                )}

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-[#003D33]">
                      {ast.fullName}
                    </h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${getAvailabilityBadge(ast.availability).color}`}>
                      {getAvailabilityBadge(ast.availability).text}
                    </span>
                  </div>
                  <p className="text-xs text-[#00695C] mt-1">
                    {Array.isArray(ast.expertise) ? ast.expertise.join(", ") : ast.expertise}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <FaStar className="text-amber-400 text-xs" />
                    <span className="text-xs font-medium">{ast.averageRating || "0.0"}</span>
                    <span className="text-xs text-gray-500">({ast.totalConsultations || 0} consults)</span>
                  </div>
                </div>
              </div>

              {/* Info */}
              <div className="space-y-2 text-xs mb-4">
                <InfoRow label="Email" value={ast.email} truncate={true} />
                <InfoRow label="Phone" value={ast.phone} />
                <InfoRow label="Chat Rate" value={`₹${ast.pricing?.chatPerMinute || 0}/min`} />
                <InfoRow label="Call Rate" value={`₹${ast.pricing?.callPerMinute || 0}/min`} />
                <div className="flex justify-between">
                  <span className="text-[#00695C]">Status</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${ast.isApproved ? "bg-green-100 text-green-600" : "bg-amber-100 text-amber-600"}`}>
                    {ast.isApproved ? "✓ Approved" : "⏳ Pending"}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => setSelectedAstrologer(ast)}
                  className="w-full border border-[#00695C] text-[#00695C] py-2 rounded-lg text-sm hover:bg-[#F7F3E9] transition-colors"
                >
                  View Full Profile
                </button>

                <div className="grid grid-cols-2 gap-2">
                  {!ast.isApproved && (
                    <button
                      onClick={() => approveAstrologer(ast._id)}
                      className="bg-green-600 text-white py-2 rounded-lg text-sm flex items-center justify-center gap-1 hover:bg-green-700 transition-colors"
                    >
                      <FaCheckCircle /> Approve
                    </button>
                  )}
                  <button
                    onClick={() => deleteAstrologer(ast._id)}
                    className="bg-red-100 text-red-600 py-2 rounded-lg text-sm flex items-center justify-center gap-1 hover:bg-red-200 transition-colors"
                  >
                    <FaTrash /> Delete
                  </button>
                </div>
              </div>
            </motion.div>
          ))}

          {!filteredAstrologers.length && (
            <div className="col-span-full text-center py-16 text-[#00695C]">
              <div className="text-4xl mb-4">🔍</div>
              <p className="text-lg font-medium">No astrologers found</p>
              <p className="text-sm text-gray-600 mt-2">Try a different search term</p>
            </div>
          )}
        </div>
      )}

      {/* View Profile Modal */}
      {selectedAstrologer && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 relative">
            {/* Close Button */}
            <button
              onClick={() => {
                setSelectedAstrologer(null);
                setIsEditing(false);
              }}
              className="  absolute top-1 right-2 text-gray-500 hover:text-black text-xl"
            >
              <FaTimes />
            </button>

            {!isEditing ? (
              // View Mode
              <>
                {/* Header */}
                <div className="flex flex-col md:flex-row gap-6 items-start mb-6">
                  <div className="relative">
                    {selectedAstrologer.profileImageUrl ? (
                      <img
                        src={`${process.env.NEXT_PUBLIC_API}${selectedAstrologer.profileImageUrl}`}
                        className="w-32 h-32 rounded-xl object-cover border-4 border-white shadow-lg"
                      />
                    ) : (
                      <div className="w-32 h-32 rounded-xl bg-gradient-to-br from-[#ECE5D3] to-[#D8C9A3] flex items-center justify-center text-4xl font-bold text-[#003D33] shadow-lg">
                        {selectedAstrologer.fullName?.[0]}
                      </div>
                    )}
                    <div className={`absolute -bottom-2 -right-2 px-3 py-1 rounded-full text-xs font-medium ${selectedAstrologer.isApproved ? "bg-green-100 text-green-600" : "bg-amber-100 text-amber-600"}`}>
                      {selectedAstrologer.isApproved ? "Approved" : "Pending Approval"}
                    </div>
                  </div>

                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <h2 className="text-2xl font-bold text-[#003D33]">
                        {selectedAstrologer.fullName}
                        {selectedAstrologer.gender && <span className="text-lg text-gray-600 ml-2">({selectedAstrologer.gender})</span>}
                      </h2>
                      <button
                        onClick={handleEditClick}
                        className="flex items-center gap-2 px-4 py-2 bg-[#003D33] text-white rounded-lg text-sm hover:bg-[#002822] transition-colors"
                      >
                        <FaEdit /> Edit Profile
                      </button>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-3 mt-2">
                      <div className={`flex items-center px-3 py-1 rounded-full text-sm ${getAvailabilityBadge(selectedAstrologer.availability).color}`}>
                        {getAvailabilityBadge(selectedAstrologer.availability).icon}
                        {getAvailabilityBadge(selectedAstrologer.availability).text}
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <span className="text-gray-600">({selectedAstrologer.totalConsultations || 0} consults)</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                      <div className="flex items-center gap-2">
                        <MdEmail className="text-gray-400" />
                        <span className="text-sm truncate">{selectedAstrologer.email}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FaPhone className="text-gray-400" />
                        <span className="text-sm">{selectedAstrologer.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FaRupeeSign className="text-gray-400" />
                        <span className="text-sm">₹{selectedAstrologer.paidEarnings || 0} earned</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left Column */}
                  <div className="space-y-6">
                    {/* Personal Information */}
                    <Section title="Personal Information">
                      <ProfileRow label="Full Name" value={selectedAstrologer.fullName} />
                      <ProfileRow label="Email" value={selectedAstrologer.email} />
                      <ProfileRow label="Phone" value={selectedAstrologer.phone} />
                      <ProfileRow label="Age" value={selectedAstrologer.age} />
                      <ProfileRow label="Gender" value={selectedAstrologer.gender} />
                      <ProfileRow label="Languages" value={Array.isArray(selectedAstrologer.languages) ? selectedAstrologer.languages.join(", ") : selectedAstrologer.languages} />
                    </Section>

                    {/* Professional Information */}
                    <Section title="Professional Information">
                      <ProfileRow label="Expertise" value={Array.isArray(selectedAstrologer.expertise) ? selectedAstrologer.expertise.join(", ") : selectedAstrologer.expertise} />
                      <ProfileRow label="Experience" value={`${selectedAstrologer.experienceYears || 0} years`} />
                      <ProfileRow label="Education" value={selectedAstrologer.education} />
                      <ProfileRow label="Certification Title" value={selectedAstrologer.certificationTitle} />
                    </Section>

                    {/* Pricing Information */}
                    <Section title="Pricing Information">
                      <ProfileRow label="Availability" value={selectedAstrologer.availability} />
                      {(selectedAstrologer.availability === "CHAT" || selectedAstrologer.availability === "BOTH" || selectedAstrologer.availability === "ALL") && (
                        <ProfileRow label="Chat Rate" value={`₹${selectedAstrologer.pricing?.chatPerMinute || 0} per minute`} />
                      )}
                      {(selectedAstrologer.availability === "CALL" || selectedAstrologer.availability === "BOTH" || selectedAstrologer.availability === "ALL") && (
                        <ProfileRow label="Call Rate" value={`₹${selectedAstrologer.pricing?.callPerMinute || 0} per minute`} />
                      )}
                      {(selectedAstrologer.availability === "MEET" || selectedAstrologer.availability === "ALL") && (
                        <ProfileRow label="Meet Service" value="Available (Rate to be discussed directly)" />
                      )}
                    </Section>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-6">
                    {/* Bio & Achievements */}
                    <Section title="Bio">
                      <p className="text-gray-700 text-sm leading-relaxed p-3 bg-gray-50 rounded-lg">
                        {selectedAstrologer.bio || "No bio provided"}
                      </p>
                    </Section>

                    {selectedAstrologer.achievements && selectedAstrologer.achievements.length > 0 && (
                      <Section title="Achievements">
                        <ul className="space-y-2">
                          {Array.isArray(selectedAstrologer.achievements) ? selectedAstrologer.achievements.map((achievement, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-green-500 mt-1">•</span>
                              <span className="text-sm text-gray-700">{achievement}</span>
                            </li>
                          )) : (
                            <p className="text-sm text-gray-700">{selectedAstrologer.achievements}</p>
                          )}
                        </ul>
                      </Section>
                    )}

                    {/* Bank Details */}
                    <Section title="Bank Details">
                      <ProfileRow label="Bank Name" value={selectedAstrologer.bankName} />
                      <ProfileRow label="Account Number" value={selectedAstrologer.bankAccountNumber} />
                      <ProfileRow label="IFSC Code" value={selectedAstrologer.ifsc} />
                    </Section>

                    {/* Documents Section */}
                    <Section title="Documents">
                      {/* Certification Documents */}
                      {selectedAstrologer.certifications && selectedAstrologer.certifications.length > 0 && (
                        <div className="mb-4">
                          <h4 className="font-medium text-gray-700 mb-2">Certifications:</h4>
                          <div className="space-y-2">
                            {selectedAstrologer.certifications.map((doc, index) => (
                              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div>
                                  <p className="text-sm font-medium">{doc.title || `Certification ${index + 1}`}</p>
                                  <p className="text-xs text-gray-500">{doc.fileUrl?.split('/').pop()}</p>
                                </div>
                                <button
                                  onClick={() => downloadDocument(doc.fileUrl, `certification_${index + 1}.${doc.fileUrl?.split('.').pop()}`)}
                                  className="flex items-center gap-2 px-3 py-1 bg-[#003D33] text-white rounded text-sm hover:bg-[#002822]"
                                >
                                  <FaDownload /> Download
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Verification Documents */}
                      {selectedAstrologer.verificationDocuments && selectedAstrologer.verificationDocuments.length > 0 && (
                        <div>
                          <h4 className="font-medium text-gray-700 mb-2">Verification Documents:</h4>
                          <div className="space-y-2">
                            {selectedAstrologer.verificationDocuments.map((doc, index) => (
                              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div>
                                  <p className="text-sm font-medium">
                                    {doc.originalName || `Verification Doc ${index + 1}`}
                                  </p>
                                  <p className="text-xs text-gray-500">{doc.fileUrl?.split('/').pop()}</p>
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => window.open(`${process.env.NEXT_PUBLIC_API}${doc}`, '_blank')}
                                    className="flex items-center gap-1 px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-100"
                                  >
                                    <FaEye /> View
                                  </button>
                                  <button
                                    onClick={() => downloadDocument(doc, doc.originalName || `verification_${index + 1}.${doc?.split('.').pop()}`)}
                                    className="flex items-center gap-1 px-3 py-1 bg-[#C06014] text-white rounded text-sm hover:bg-[#A35010]"
                                  >
                                    <FaDownload /> Download
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {(!selectedAstrologer.certifications || selectedAstrologer.certifications.length === 0) && 
                       (!selectedAstrologer.verificationDocuments || selectedAstrologer.verificationDocuments.length === 0) && (
                        <p className="text-gray-500 text-sm italic">No documents uploaded</p>
                      )}
                    </Section>
                  </div>
                </div>

                {/* Footer Actions */}
                <div className="mt-8 pt-6 border-t border-gray-200 flex justify-end gap-3">
                  <button
                    onClick={() => setSelectedAstrologer(null)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
                  >
                    Close
                  </button>
                  {!selectedAstrologer.isApproved && (
                    <button
                      onClick={() => {
                        approveAstrologer(selectedAstrologer._id);
                        setSelectedAstrologer(null);
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 flex items-center gap-2"
                    >
                      <FaCheckCircle /> Approve & Send Credentials
                    </button>
                  )}
                </div>
              </>
            ) : (
              // Edit Mode Form
              <form onSubmit={handleEditSubmit} className="space-y-6 ">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-[#003D33]">Edit Astrologer Profile</h2>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="text-gray-500 hover:text-gray-700 "
                  >
                    <FaArrowRight size={20} />
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Personal Information */}
                  <Section title="Personal Information">
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                        <input
                          type="text"
                          name="fullName"
                          value={editFormData.fullName}
                          onChange={handleEditChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003D33] focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                        <input
                          type="email"
                          name="email"
                          value={editFormData.email}
                          onChange={handleEditChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003D33] focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                        <input
                          type="tel"
                          name="phone"
                          value={editFormData.phone}
                          onChange={handleEditChange}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003D33] focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
                        <input
                          type="number"
                          name="age"
                          value={editFormData.age}
                          onChange={handleEditChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003D33] focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                        <select
                          name="gender"
                          value={editFormData.gender}
                          onChange={handleEditChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003D33] focus:border-transparent"
                        >
                          <option value="">Select</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Languages (comma separated)</label>
                        <input
                          type="text"
                          name="languages"
                          value={editFormData.languages}
                          onChange={handleEditChange}
                          placeholder="Hindi, English, Tamil"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003D33] focus:border-transparent"
                        />
                      </div>
                    </div>
                  </Section>

                  {/* Professional Information */}
                  <Section title="Professional Information">
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Expertise (comma separated)</label>
                        <input
                          type="text"
                          name="expertise"
                          value={editFormData.expertise}
                          onChange={handleEditChange}
                          placeholder="Vedic Astrology, Palmistry, Tarot"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003D33] focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Experience (years)</label>
                        <input
                          type="number"
                          name="experienceYears"
                          value={editFormData.experienceYears}
                          onChange={handleEditChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003D33] focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Education</label>
                        <input
                          type="text"
                          name="education"
                          value={editFormData.education}
                          onChange={handleEditChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003D33] focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Certification Title</label>
                        <input
                          type="text"
                          name="certificationTitle"
                          value={editFormData.certificationTitle}
                          onChange={handleEditChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003D33] focus:border-transparent"
                        />
                      </div>
                    </div>
                  </Section>

                  {/* Pricing & Availability */}
                  <Section title="Pricing & Availability">
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Availability</label>
                        <select
                          name="availability"
                          value={editFormData.availability}
                          onChange={handleEditChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003D33] focus:border-transparent"
                        >
                          <option value="CHAT">Chat Only</option>
                          <option value="CALL">Call Only</option>
                          <option value="BOTH">Chat + Call</option>
                          <option value="MEET">Meet Only</option>
                          <option value="ALL">All Services</option>
                        </select>
                      </div>
                      {(editFormData.availability === "CHAT" || editFormData.availability === "BOTH" || editFormData.availability === "ALL") && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Chat Rate (₹/minute)</label>
                          <input
                            type="number"
                            name="chatPerMinute"
                            value={editFormData.chatPerMinute}
                            onChange={handleEditChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003D33] focus:border-transparent"
                          />
                        </div>
                      )}
                      {(editFormData.availability === "CALL" || editFormData.availability === "BOTH" || editFormData.availability === "ALL") && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Call Rate (₹/minute)</label>
                          <input
                            type="number"
                            name="callPerMinute"
                            value={editFormData.callPerMinute}
                            onChange={handleEditChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003D33] focus:border-transparent"
                          />
                        </div>
                      )}
                    </div>
                  </Section>

                  {/* Bank Details */}
                  <Section title="Bank Details">
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                        <input
                          type="text"
                          name="bankName"
                          value={editFormData.bankName}
                          onChange={handleEditChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003D33] focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                        <input
                          type="text"
                          name="bankAccountNumber"
                          value={editFormData.bankAccountNumber}
                          onChange={handleEditChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003D33] focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">IFSC Code</label>
                        <input
                          type="text"
                          name="ifsc"
                          value={editFormData.ifsc}
                          onChange={handleEditChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003D33] focus:border-transparent"
                        />
                      </div>
                    </div>
                  </Section>

                  {/* Bio & Achievements */}
                  <Section title="Bio">
                    <div>
                      <textarea
                        name="bio"
                        value={editFormData.bio}
                        onChange={handleEditChange}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003D33] focus:border-transparent"
                        placeholder="Enter bio here..."
                      />
                    </div>
                  </Section>

                  <Section title="Achievements">
                    <div>
                      <textarea
                        name="achievements"
                        value={editFormData.achievements}
                        onChange={handleEditChange}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#003D33] focus:border-transparent"
                        placeholder="One achievement per line..."
                      />
                      <p className="text-xs text-gray-500 mt-1">Enter each achievement on a new line</p>
                    </div>
                  </Section>
                </div>

                {/* Form Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#003D33] text-white rounded-lg text-sm hover:bg-[#002822] flex items-center gap-2"
                  >
                    <FaSave /> Save Changes
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ================= REUSABLE COMPONENTS ================= */
const InfoRow = ({ label, value, badge, truncate = false }) => (
  <div className="flex justify-between items-center">
    <span className="text-[#00695C] text-xs">{label}</span>
    <span className={`px-2 py-1 rounded text-xs ${badge || "text-gray-700"} ${truncate ? "truncate max-w-[150px]" : ""}`}>
      {value || "-"}
    </span>
  </div>
);

const ProfileRow = ({ label, value }) => (
  <div className="flex justify-between items-center py-2 border-b border-gray-100">
    <span className="text-sm text-gray-600">{label}</span>
    <span className="text-sm font-medium text-gray-800 text-right">{value || "-"}</span>
  </div>
);

const Section = ({ title, children }) => (
  <div className="border border-gray-200 rounded-xl p-4">
    <h3 className="font-semibold text-[#003D33] mb-3 pb-2 border-b border-gray-100">{title}</h3>
    <div>{children}</div>
  </div>
);