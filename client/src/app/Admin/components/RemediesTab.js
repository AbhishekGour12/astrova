"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  FiEdit2,
  FiTrash2,
  FiUpload,
  FiImage,
  FiPlus,
  FiX,
  FiPackage,
  FiDollarSign,
  FiTag,
  FiFileText,
  FiSearch
} from "react-icons/fi";

export default function RemediesTab() {
  const [remedies, setRemedies] = useState([]);
  const [filteredRemedies, setFilteredRemedies] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [form, setForm] = useState({
    title: "",
    price: "",
    category: "",
    description: "",
    duration: "",
   
  });
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [activeTab, setActiveTab] = useState("list"); // "list" or "form"
  const [isLoading, setIsLoading] = useState(true);

  /* ================= LOAD REMEDIES ================= */
  useEffect(() => {
    loadRemedies();
  }, []);

  useEffect(() => {
    if (remedies.length > 0) {
      const filtered = remedies.filter(remedy =>
        remedy.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        remedy.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        remedy.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredRemedies(filtered);
    }
  }, [searchTerm, remedies]);

  const loadRemedies = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API}/api/remedy`);
      setRemedies(res.data);
      setFilteredRemedies(res.data);
    } catch (error) {
      toast.error("Failed to load remedies");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  /* ================= IMAGE HANDLING ================= */
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setImage(null);
    setImagePreview(null);
  };

  /* ================= FORM SUBMISSION ================= */
  const submitRemedy = async () => {
    if (!form.title.trim()) {
      toast.error("Please enter a title");
      return;
    }
    if (!form.price || isNaN(form.price)) {
      toast.error("Please enter a valid price");
      return;
    }
    if (!form.category.trim()) {
      toast.error("Please enter a category");
      return;
    }

    const fd = new FormData();
    Object.keys(form).forEach(key => {
      if (form[key]) fd.append(key, form[key]);
    });
    if (image) fd.append("image", image);

    

    setLoading(true);

    try {
      if (editingId) {
        await axios.put(`${process.env.NEXT_PUBLIC_API}/api/remedy/${editingId}`, fd);
        toast.success("Remedy updated successfully!");
      } else {
        await axios.post(`${process.env.NEXT_PUBLIC_API}/api/remedy`, fd);
        toast.success("Remedy created successfully!");
      }
      
      resetForm();
      loadRemedies();
      setActiveTab("list");
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setForm({
      title: "",
      price: "",
      category: "",
      description: "",
      duration: "",
      
    });
    setImage(null);
    setImagePreview(null);
    setEditingId(null);
  };

  /* ================= EDIT REMEDY ================= */
  const editRemedy = (remedy) => {
    setEditingId(remedy._id);
    setForm({
      title: remedy.title || "",
      price: remedy.price || "",
      category: remedy.category || "",
      description: remedy.description || "",
      duration: remedy.duration || "",
     
    });
    if (remedy.image) {
      setImagePreview(`${process.env.NEXT_PUBLIC_API}${remedy.image}`);
    }
    setActiveTab("form");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  /* ================= DELETE REMEDY ================= */
  const deleteRemedy = async (id) => {
    if (!confirm("Are you sure you want to delete this remedy? This action cannot be undone.")) return;
    
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API}/api/remedy/${id}`);
      toast.success("Remedy deleted successfully");
      loadRemedies();
    } catch (error) {
      toast.error("Failed to delete remedy");
    }
  };

  /* ================= UI COMPONENTS ================= */
  

  const ListSection = () => (
    <div>
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-serif font-bold text-[#003D33]">
            Remedies Management
          </h2>
          <p className="text-[#00695C] font-serif mt-2">
            Manage all astrology remedies in your collection
          </p>
        </div>
        <button
          onClick={() => setActiveTab("form")}
          className="bg-gradient-to-r from-[#003D33] to-[#00695C] text-white px-6 py-3 rounded-lg font-serif font-medium hover:shadow-lg transition-all flex items-center gap-2"
        >
          <FiPlus size={20} />
          Create New Remedy
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-[#B2C5B2]/30 p-4 mb-6">
        <div className="relative">
          <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#00695C]" />
          <input
            type="text"
            placeholder="Search remedies by title, category, or description..."
            className="w-full pl-12 pr-4 py-3 rounded-lg border border-[#B2C5B2] focus:outline-none focus:ring-2 focus:ring-[#C06014]/30 font-serif"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-gradient-to-r from-[#F7F3E9] to-[#ECE5D3] p-5 rounded-xl">
          <div className="text-2xl font-bold font-serif text-[#003D33]">{remedies.length}</div>
          <div className="text-[#00695C] font-serif">Total Remedies</div>
        </div>
        <div className="bg-gradient-to-r from-[#F7F3E9] to-[#ECE5D3] p-5 rounded-xl">
          <div className="text-2xl font-bold font-serif text-[#003D33]">
            {remedies.filter(r => r.price > 0).length}
          </div>
          <div className="text-[#00695C] font-serif">Paid Remedies</div>
        </div>
        <div className="bg-gradient-to-r from-[#F7F3E9] to-[#ECE5D3] p-5 rounded-xl">
          <div className="text-2xl font-bold font-serif text-[#003D33]">
            {new Set(remedies.map(r => r.category)).size}
          </div>
          <div className="text-[#00695C] font-serif">Categories</div>
        </div>
      </div>

      {/* Remedies Grid */}
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#C06014]"></div>
        </div>
      ) : filteredRemedies.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRemedies.map(remedy => (
            <div
              key={remedy._id}
              className="bg-white rounded-2xl shadow-lg border border-[#B2C5B2]/30 overflow-hidden hover:shadow-xl transition-all duration-300"
            >
              {/* Image */}
              <div className="relative h-48 overflow-hidden bg-gradient-to-br from-[#ECE5D3] to-[#F7F3E9]">
                <img
                  src={`${process.env.NEXT_PUBLIC_API}${remedy.image}`}
                  alt={remedy.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.parentElement.innerHTML = `
                      <div class="w-full h-full flex items-center justify-center">
                        <div class="text-4xl text-[#C06014]">🔮</div>
                      </div>
                    `;
                  }}
                />
                <div className="absolute top-3 left-3">
                  <span className="bg-[#003D33] text-white px-3 py-1 rounded-full text-xs font-serif">
                    {remedy.category || "Uncategorized"}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-serif font-bold text-lg text-[#003D33] line-clamp-1">
                    {remedy.title}
                  </h3>
                  <span className="font-bold text-[#C06014] font-serif">
                    ₹{remedy.price}
                  </span>
                </div>

                <p className="text-[#00695C] text-sm font-serif line-clamp-2 mb-4">
                  {remedy.description || "No description provided"}
                </p>

                {/* Additional Info */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {remedy.duration && (
                    <span className="bg-[#F7F3E9] text-[#00695C] px-3 py-1 rounded-full text-xs font-serif">
                      ⏱️ {remedy.duration}
                    </span>
                  )}
                  {remedy.benefits && remedy.benefits.length > 0 && (
                    <span className="bg-[#F7F3E9] text-[#00695C] px-3 py-1 rounded-full text-xs font-serif">
                      ✅ {remedy.benefits.length} benefits
                    </span>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between items-center pt-4 border-t border-[#B2C5B2]/30">
                  <button
                    onClick={() => editRemedy(remedy)}
                    className="flex items-center gap-2 text-[#00695C] hover:text-[#003D33] font-serif transition-colors"
                  >
                    <FiEdit2 />
                    Edit
                  </button>
                  <button
                    onClick={() => deleteRemedy(remedy._id)}
                    className="flex items-center gap-2 text-red-600 hover:text-red-700 font-serif transition-colors"
                  >
                    <FiTrash2 />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl border border-[#B2C5B2]/30">
          <div className="text-6xl mb-4">🔮</div>
          <h3 className="text-xl font-serif font-bold text-[#003D33] mb-2">
            {searchTerm ? "No remedies found" : "No remedies yet"}
          </h3>
          <p className="text-[#00695C] font-serif mb-6">
            {searchTerm
              ? "Try adjusting your search terms"
              : "Create your first remedy to get started"}
          </p>
          {!searchTerm && (
            <button
              onClick={() => setActiveTab("form")}
              className="bg-gradient-to-r from-[#C06014] to-[#D47C3A] text-white px-6 py-3 rounded-lg font-serif font-medium hover:shadow-lg hover:shadow-[#C06014]/20 transition-all"
            >
              Create Your First Remedy
            </button>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F7F3E9] p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Tab Navigation */}
        <div className="flex border-b border-[#B2C5B2]/30 mb-8">
          <button
            onClick={() => setActiveTab("list")}
            className={`px-6 py-3 font-serif font-medium transition-all ${
              activeTab === "list"
                ? "border-b-2 border-[#C06014] text-[#C06014]"
                : "text-[#00695C] hover:text-[#003D33]"
            }`}
          >
            All Remedies ({remedies.length})
          </button>
          <button
            onClick={() => {
              setActiveTab("form");
              resetForm();
            }}
            className={`px-6 py-3 font-serif font-medium transition-all ${
              activeTab === "form"
                ? "border-b-2 border-[#C06014] text-[#C06014]"
                : "text-[#00695C] hover:text-[#003D33]"
            }`}
          >
            {editingId ? "Edit Remedy" : "Create Remedy"}
          </button>
        </div>

        {/* Content */}
        {activeTab === "form" &&(
          <div className="bg-white rounded-2xl shadow-lg border border-[#B2C5B2]/30 overflow-hidden">
      {/* Form Header */}
      <div className="bg-gradient-to-r from-[#003D33] to-[#00695C] p-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-2xl font-serif font-bold text-white">
              {editingId ? "Update Remedy" : "Create New Remedy"}
            </h3>
            <p className="text-white/80 font-serif text-sm mt-1">
              {editingId ? "Modify the remedy details below" : "Add a new astrology remedy to your collection"}
            </p>
          </div>
          <button
            onClick={() => {
              setActiveTab("list");
              resetForm();
            }}
            className="text-white hover:bg-white/10 p-2 rounded-full transition-colors"
          >
            <FiX size={24} />
          </button>
        </div>
      </div>

      {/* Form Body */}
      <div className="p-6">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-serif font-medium text-[#003D33] mb-2">
                <FiPackage className="inline mr-2" />
                Remedy Title *
              </label>
              <input
                placeholder="e.g., Jupiter Yantra Puja"
                className="w-full px-4 py-3 rounded-lg border border-[#B2C5B2] focus:outline-none focus:ring-2 focus:ring-[#C06014]/30 font-serif"
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-serif font-medium text-[#003D33] mb-2">
                  <FiDollarSign className="inline mr-2" />
                  Price (₹) *
                </label>
                <input
                  placeholder="1999"
                  className="w-full px-4 py-3 rounded-lg border border-[#B2C5B2] focus:outline-none focus:ring-2 focus:ring-[#C06014]/30 font-serif"
                  type="number"
                  value={form.price}
                  onChange={e => setForm({ ...form, price: e.target.value })}
                />
              </div>

             
            </div>

            <div>
              <label className="block text-sm font-serif font-medium text-[#003D33] mb-2">
                <FiTag className="inline mr-2" />
                Category *
              </label>
             <input
                  placeholder="Love, Career, Health, Spiritual"
                  className="w-full px-4 py-3 rounded-lg border border-[#B2C5B2] focus:outline-none focus:ring-2 focus:ring-[#C06014]/30 font-serif"
                  value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value })}
                />
            </div>

            <div>
              <label className="block text-sm font-serif font-medium text-[#003D33] mb-2">
                Duration
              </label>
              <input
                placeholder="e.g., 7 days, 1 month"
                className="w-full px-4 py-3 rounded-lg border border-[#B2C5B2] focus:outline-none focus:ring-2 focus:ring-[#C06014]/30 font-serif"
                value={form.duration}
                onChange={e => setForm({ ...form, duration: e.target.value })}
              />
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            {/* Image Upload */}
            <div>
              <label className="block text-sm font-serif font-medium text-[#003D33] mb-2">
                <FiImage className="inline mr-2" />
                Remedy Image
              </label>
              <div className="border-2 border-dashed border-[#B2C5B2] rounded-xl p-4 text-center">
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="h-48 w-full object-cover rounded-lg mx-auto"
                    />
                    <button
                      onClick={clearImage}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                    >
                      <FiX size={18} />
                    </button>
                  </div>
                ) : (
                  <div className="py-8">
                    <FiUpload className="text-[#00695C] text-3xl mx-auto mb-3" />
                    <p className="text-[#00695C] font-serif mb-2">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-sm text-gray-500">
                      PNG, JPG up to 5MB
                    </p>
                  </div>
                )}
                <input
                  type="file"
                  className="hidden"
                  id="image-upload"
                  onChange={handleImageChange}
                  accept="image/*"
                />
                <label
                  htmlFor="image-upload"
                  className="mt-4 inline-block bg-[#F7F3E9] text-[#003D33] px-4 py-2 rounded-lg font-serif cursor-pointer hover:bg-[#ECE5D3] transition-colors"
                >
                  Choose Image
                </label>
              </div>
            </div>

            
          </div>
        </div>

        {/* Description */}
        <div className="mt-6">
          <label className="block text-sm font-serif font-medium text-[#003D33] mb-2">
            <FiFileText className="inline mr-2" />
            Description
          </label>
          <textarea
            placeholder="Detailed description of the remedy, its benefits, and procedure..."
            className="w-full px-4 py-3 rounded-lg border border-[#B2C5B2] focus:outline-none focus:ring-2 focus:ring-[#C06014]/30 font-serif min-h-[120px]"
            value={form.description}
            onChange={e => setForm({ ...form, description: e.target.value })}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-[#B2C5B2]/30">
          <button
            onClick={() => {
              setActiveTab("list");
              resetForm();
            }}
            className="px-6 py-3 rounded-lg text-[#003D33] border border-[#B2C5B2] hover:bg-[#F7F3E9] font-serif transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={submitRemedy}
            disabled={loading}
            className="bg-gradient-to-r from-[#C06014] to-[#D47C3A] text-white px-8 py-3 rounded-lg font-serif font-medium hover:shadow-lg hover:shadow-[#C06014]/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                {editingId ? "Updating..." : "Creating..."}
              </span>
            ) : (
              editingId ? "Update Remedy" : "Create Remedy"
            )}
          </button>
        </div>
      </div>
    </div>

        )}
        {activeTab === "list" && <ListSection />}
      </div>
    </div>
  );
}