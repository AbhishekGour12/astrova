"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { FaTrash, FaPlus, FaSave } from "react-icons/fa";

const emptySlide = {
  title: "",
  subtitle: "",
  description: "",
  showButton: false,
  buttonText: "",
  buttonLink: "",
  buttonColor: "bg-purple-600 hover:bg-purple-700",
  image: null,
};

export default function CarouselTab() {
  const [page, setPage] = useState("products");
  const [carousel, setCarousel] = useState({ slides: [] });
  const [newSlide, setNewSlide] = useState(emptySlide);
  const [editingSlides, setEditingSlides] = useState({});
  const [loading, setLoading] = useState(false);

  // ===============================
  // FETCH CAROUSEL
  // ===============================
  const fetchCarousel = async () => {
    try {
      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_API}/api/admin/carousel/${page}`
      );
      if (res.data.carousel) {
        setCarousel(res.data.carousel);
      } else {
        setCarousel({ page, slides: [] });
      }
      setEditingSlides({});
    } catch (error) {
      console.error("Error fetching carousel:", error);
      setCarousel({ page, slides: [] });
    }
  };

  useEffect(() => {
    fetchCarousel();
  }, [page]);

  // ===============================
  // ADD SLIDE
  // ===============================
  const addSlide = async () => {
    if (!newSlide.image) {
      alert("Image required");
      return;
    }

    const formData = new FormData();
    formData.append("page", page);
    formData.append("title", newSlide.title);
    formData.append("subtitle", newSlide.subtitle);
    formData.append("description", newSlide.description);
    formData.append("showButton", newSlide.showButton.toString());
    formData.append("buttonText", newSlide.buttonText);
    formData.append("buttonLink", newSlide.buttonLink);
    formData.append("buttonColor", newSlide.buttonColor);
    formData.append("image", newSlide.image);

    setLoading(true);
    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API}/api/admin/carousel/slide`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setNewSlide(emptySlide);
      fetchCarousel();
    } catch (error) {
      console.error("Error adding slide:", error);
      alert("Failed to add slide");
    } finally {
      setLoading(false);
    }
  };

  // ===============================
  // LOCAL EDIT
  // ===============================
  const handleEdit = (id, key, value) => {
    setEditingSlides((prev) => ({
      ...prev,
      [id]: {
        ...(prev[id] || carousel.slides.find((s) => s._id === id)),
        [key]: value,
      },
    }));
  };

  // ===============================
  // SAVE SLIDE
  // ===============================
  const saveSlide = async (slideId) => {
    const slide = editingSlides[slideId];
    if (!slide) return;

    const formData = new FormData();
    formData.append("title", slide.title || "");
    formData.append("subtitle", slide.subtitle || "");
    formData.append("description", slide.description || "");
    formData.append("showButton", slide.showButton?.toString() || "false");
    formData.append("buttonText", slide.buttonText || "");
    formData.append("buttonLink", slide.buttonLink || "");
    formData.append("buttonColor", slide.buttonColor || "bg-purple-600 hover:bg-purple-700");

    if (slide.image instanceof File) {
      formData.append("image", slide.image);
    }

    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_API}/api/admin/carousel/${page}/${slideId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      fetchCarousel();
    } catch (error) {
      console.error("Error saving slide:", error);
      alert("Failed to save slide");
    }
  };

  // ===============================
  // DELETE SLIDE
  // ===============================
  const deleteSlide = async (slideId) => {
    if (!confirm("Delete this slide?")) return;
    
    try {
      await axios.delete(
        `${process.env.NEXT_PUBLIC_API}/api/admin/carousel/${page}/${slideId}`
      );
      fetchCarousel();
    } catch (error) {
      console.error("Error deleting slide:", error);
      alert("Failed to delete slide");
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* HEADER - Fixed at top */}
      <div className="flex justify-between items-center mb-6 pb-4 border-b">
        <h2 className="text-2xl font-bold text-[#003D33]">Carousel Manager</h2>
        <select
          value={page}
          onChange={(e) => setPage(e.target.value)}
          className="px-4 py-2 rounded-xl border bg-white shadow-sm"
        >
          <option value="home">Home</option>
          <option value="products">Products</option>
          <option value="remedies">Remedies</option>
        </select>
      </div>

      {/* SCROLLABLE CONTENT AREA */}
      <div className="flex-1 overflow-y-auto pr-2 space-y-6 pb-6">
        {/* No slides message */}
        {carousel.slides?.length === 0 && (
          <div className="bg-white rounded-xl p-8 text-center shadow">
            <div className="text-gray-400 mb-2">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-gray-500 text-lg font-medium mb-1">No slides yet</p>
            <p className="text-gray-400 text-sm">Add your first slide to get started</p>
          </div>
        )}

        {/* EXISTING SLIDES */}
        {carousel.slides?.map((s, i) => {
          const slide = editingSlides[s._id] || s;

          return (
            <div key={s._id} className="bg-white p-5 rounded-2xl shadow space-y-4 border border-gray-100">
              <div className="flex justify-between items-center border-b pb-3">
                <div>
                  <h3 className="font-semibold text-lg">Slide {i + 1}</h3>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    {page.toUpperCase()} page
                  </span>
                </div>
                <button
                  onClick={() => deleteSlide(s._id)}
                  className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete slide"
                >
                  <FaTrash />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* LEFT COLUMN - Images */}
                <div className="space-y-4">
                  {/* CURRENT IMAGE PREVIEW */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700 flex items-center justify-between">
                      <span>Current Image</span>
                      <span className="text-xs text-gray-500">Click image to view full</span>
                    </label>
                    <div className="relative group cursor-pointer">
                      <img
                        src={`${process.env.NEXT_PUBLIC_API}${s.image}`}
                        className="h-48 w-full object-cover rounded-xl border"
                        alt={`Slide ${i + 1}`}
                        onClick={() => window.open(`${process.env.NEXT_PUBLIC_API}${s.image}`, '_blank')}
                      />
                     
                    </div>
                  </div>

                  {/* UPDATE IMAGE */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Update Image</label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) =>
                          handleEdit(s._id, "image", e.target.files[0])
                        }
                        className="flex-1 p-2 border rounded-lg text-sm"
                        id={`file-${s._id}`}
                      />
                      <label
                        htmlFor={`file-${s._id}`}
                        className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg cursor-pointer text-sm font-medium transition-colors"
                      >
                        Browse
                      </label>
                    </div>
                    <p className="text-xs text-gray-500">
                      Recommended: 1920×1080px (16:9 aspect ratio)
                    </p>
                  </div>
                </div>

                {/* RIGHT COLUMN - Content */}
                <div className="space-y-4">
                  {/* TEXT FIELDS */}
                  <div className="space-y-3">
                    {["title", "subtitle", "description"].map((field) => (
                      <div key={field} className="space-y-1">
                        <label className="text-sm font-medium text-gray-700 capitalize">
                          {field}
                          {field === "title" && <span className="text-red-500 ml-1">*</span>}
                        </label>
                        {field === "description" ? (
                          <textarea
                            value={slide[field] || ""}
                            onChange={(e) => handleEdit(s._id, field, e.target.value)}
                            placeholder={`Enter ${field}...`}
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[100px]"
                            rows={3}
                          />
                        ) : (
                          <input
                            value={slide[field] || ""}
                            onChange={(e) => handleEdit(s._id, field, e.target.value)}
                            placeholder={`Enter ${field}`}
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        )}
                      </div>
                    ))}
                  </div>

                  {/* BUTTON SETTINGS */}
                  <div className="space-y-4 pt-2 border-t">
                    <label className="flex gap-2 items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={Boolean(slide.showButton)}
                        onChange={(e) =>
                          handleEdit(s._id, "showButton", e.target.checked)
                        }
                        className="rounded w-4 h-4"
                      />
                      <span className="text-sm font-medium text-gray-700">Show Button</span>
                    </label>

                    {slide.showButton && (
                      <div className="space-y-4 p-4 bg-gray-50 rounded-lg border">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">Button Text</label>
                            <input
                              value={slide.buttonText || ""}
                              onChange={(e) =>
                                handleEdit(s._id, "buttonText", e.target.value)
                              }
                              placeholder="e.g., Shop Now"
                              className="w-full p-2 border rounded"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">Button Link</label>
                            <input
                              value={slide.buttonLink || ""}
                              onChange={(e) =>
                                handleEdit(s._id, "buttonLink", e.target.value)
                              }
                              placeholder="e.g., /products"
                              className="w-full p-2 border rounded"
                            />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="text-sm font-medium text-gray-700">Button Color</label>
                          <div className="grid grid-cols-5 gap-2">
                            {[
                              { value: "bg-purple-600 hover:bg-purple-700", label: "Purple", color: "bg-purple-600" },
                              { value: "bg-blue-600 hover:bg-blue-700", label: "Blue", color: "bg-blue-600" },
                              { value: "bg-green-600 hover:bg-green-700", label: "Green", color: "bg-green-600" },
                              { value: "bg-red-600 hover:bg-red-700", label: "Red", color: "bg-red-600" },
                              { value: "bg-yellow-600 hover:bg-yellow-700", label: "Yellow", color: "bg-yellow-600" },
                            ].map((option) => (
                              <button
                                key={option.value}
                                type="button"
                                onClick={() => handleEdit(s._id, "buttonColor", option.value)}
                                className={`flex flex-col items-center justify-center p-2 rounded-lg border ${slide.buttonColor === option.value ? 'ring-2 ring-offset-2 ring-blue-500' : ''}`}
                              >
                                <div className={`w-6 h-6 rounded-full ${option.color} mb-1`}></div>
                                <span className="text-xs">{option.label}</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* SAVE BUTTON */}
              <div className="pt-4 border-t flex justify-end">
                <button
                  onClick={() => saveSlide(s._id)}
                  className="px-5 py-2.5 rounded-xl bg-green-600 text-white flex gap-2 items-center hover:bg-green-700 transition-colors font-medium"
                >
                  <FaSave /> Save Changes
                </button>
              </div>
            </div>
          );
        })}

        {/* DIVIDER & ADD NEW SECTION - Only show if we have existing slides */}
        {carousel.slides?.length > 0 && (
          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="px-4 bg-gray-50 text-gray-500 text-sm font-medium">Add New Slide</span>
            </div>
          </div>
        )}

        {/* ADD NEW SLIDE FORM */}
        <div className="bg-gradient-to-br from-[#F7F3E9] to-[#F0EBDF] p-6 rounded-2xl space-y-6 border border-amber-100">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold flex gap-2 items-center text-lg">
              <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                <FaPlus className="text-amber-700" />
              </div>
              Add New Slide
            </h3>
            <span className="text-sm font-medium text-amber-800 bg-amber-100 px-3 py-1 rounded-full">
              {page.toUpperCase()} Page
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* LEFT COLUMN - Image Upload */}
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Slide Image <span className="text-red-500">*</span>
                </label>
                <div className={`border-2 ${!newSlide.image ? 'border-dashed border-gray-300' : 'border-green-200'} rounded-xl p-4 transition-colors`}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      setNewSlide({ ...newSlide, image: e.target.files[0] })
                    }
                    className="hidden"
                    id="new-slide-image"
                  />
                  <label
                    htmlFor="new-slide-image"
                    className="cursor-pointer flex flex-col items-center justify-center"
                  >
                    {newSlide.image ? (
                      <>
                        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-3">
                          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <span className="text-green-700 font-medium">Image Selected</span>
                        <span className="text-xs text-gray-500 mt-1">{newSlide.image.name}</span>
                      </>
                    ) : (
                      <>
                        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <span className="text-gray-700 font-medium">Click to upload image</span>
                        <span className="text-xs text-gray-500 mt-1">PNG, JPG, WEBP up to 5MB</span>
                      </>
                    )}
                  </label>
                </div>
                <p className="text-xs text-gray-500">
                  Required. Recommended: 1920×1080px (16:9 aspect ratio)
                </p>
              </div>
            </div>

            {/* RIGHT COLUMN - Content */}
            <div className="space-y-4">
              {/* TEXT FIELDS */}
              <div className="space-y-3">
                {["title", "subtitle", "description"].map((field) => (
                  <div key={field} className="space-y-1">
                    <label className="text-sm font-medium text-gray-700 capitalize">
                      {field}
                      {field === "title" && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    {field === "description" ? (
                      <textarea
                        value={newSlide[field]}
                        onChange={(e) =>
                          setNewSlide({ ...newSlide, [field]: e.target.value })
                        }
                        placeholder={`Enter ${field}...`}
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[100px]"
                        rows={3}
                      />
                    ) : (
                      <input
                        value={newSlide[field]}
                        onChange={(e) =>
                          setNewSlide({ ...newSlide, [field]: e.target.value })
                        }
                        placeholder={`Enter ${field}`}
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    )}
                  </div>
                ))}
              </div>

              {/* BUTTON SETTINGS */}
              <div className="space-y-4 pt-2">
                <label className="flex gap-2 items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={newSlide.showButton}
                    onChange={(e) =>
                      setNewSlide({ ...newSlide, showButton: e.target.checked })
                    }
                    className="rounded w-4 h-4"
                  />
                  <span className="text-sm font-medium text-gray-700">Add Button</span>
                </label>

                {newSlide.showButton && (
                  <div className="space-y-4 p-4 bg-white rounded-lg border">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Button Text</label>
                        <input
                          value={newSlide.buttonText}
                          onChange={(e) =>
                            setNewSlide({ ...newSlide, buttonText: e.target.value })
                          }
                          placeholder="e.g., Shop Now"
                          className="w-full p-2 border rounded"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-sm font-medium text-gray-700">Button Link</label>
                        <input
                          value={newSlide.buttonLink}
                          onChange={(e) =>
                            setNewSlide({ ...newSlide, buttonLink: e.target.value })
                          }
                          placeholder="e.g., /products"
                          className="w-full p-2 border rounded"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-sm font-medium text-gray-700">Button Color</label>
                      <div className="grid grid-cols-5 gap-2">
                        {[
                          { value: "bg-purple-600 hover:bg-purple-700", label: "Purple", color: "bg-purple-600" },
                          { value: "bg-blue-600 hover:bg-blue-700", label: "Blue", color: "bg-blue-600" },
                          { value: "bg-green-600 hover:bg-green-700", label: "Green", color: "bg-green-600" },
                          { value: "bg-red-600 hover:bg-red-700", label: "Red", color: "bg-red-600" },
                          { value: "bg-yellow-600 hover:bg-yellow-700", label: "Yellow", color: "bg-yellow-600" },
                        ].map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() => setNewSlide({ ...newSlide, buttonColor: option.value })}
                            className={`flex flex-col items-center justify-center p-2 rounded-lg border ${newSlide.buttonColor === option.value ? 'ring-2 ring-offset-2 ring-blue-500' : ''}`}
                          >
                            <div className={`w-6 h-6 rounded-full ${option.color} mb-1`}></div>
                            <span className="text-xs">{option.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ADD BUTTON */}
          <div className="pt-4 border-t flex justify-end">
            <button
              onClick={addSlide}
              disabled={loading || !newSlide.image}
              className={`px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${
                loading || !newSlide.image
                  ? "bg-gray-300 cursor-not-allowed text-gray-500"
                  : "bg-gradient-to-r from-[#7d5732] to-[#6a4a2b] hover:from-[#6a4a2b] hover:to-[#5a3e24] text-white shadow-md hover:shadow-lg"
              }`}
            >
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Adding Slide...
                </>
              ) : (
                <>
                  <FaPlus /> Add Slide
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}