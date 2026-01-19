"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import RemedyCard from "./RemedyCard";
import RemedyModal from "./RemedyModal";
import { FiSearch, FiFilter } from "react-icons/fi";

export default function RemediesPage() {
  const [remedies, setRemedies] = useState([]);
  const [filteredRemedies, setFilteredRemedies] = useState([]);
  const [selected, setSelected] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");

  useEffect(() => {
    fetchRemedies();
  }, []);

  useEffect(() => {
    if (remedies.length > 0) {
      let filtered = remedies;
      
      if (searchTerm) {
        filtered = filtered.filter(remedy => 
          remedy.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          remedy.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      if (activeCategory !== "all") {
        filtered = filtered.filter(remedy => 
          remedy.category === activeCategory
        );
      }
      
      setFilteredRemedies(filtered);
    }
  }, [searchTerm, activeCategory, remedies]);

  const fetchRemedies = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API}/api/remedy`);
      setRemedies(res.data);
      setFilteredRemedies(res.data);
    } catch (error) {
      console.error("Error fetching remedies:", error);
    } finally {
      setLoading(false);
    }
  };

  // Extract unique categories from remedies
  const categories = ["all", ...new Set(remedies.map(r => r.category).filter(Boolean))];

  return (
    <div className="min-h-screen bg-[#F7F3E9]">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-[#003D33]/10 to-[#C06014]/10 py-16 px-4">
        <div className="max-w-7xl mx-auto text-center mt-[50px]">
          <h1 className="text-5xl font-serif font-bold text-[#003D33] mb-4 max-md:text-4xl max-sm:text-xl">
            Powerful Astrology Remedies
          </h1>
          <p className="text-lg text-[#00695C] font-serif max-w-3xl mx-auto max-md:text-base max-sm:text-sm ">
            Discover ancient Vedic solutions tailored to your planetary positions. 
            Each remedy is crafted with spiritual precision for maximum impact.
          </p>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          {/* Search Bar */}
          <div className="relative flex-1">
            <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#00695C]" />
            <input
              type="text"
              placeholder="Search remedies by name or description..."
              className="w-full pl-12 pr-4 py-3 rounded-xl  -[#B2C5B2] focus:outline-none focus:ring-2 focus:ring-[#C06014]/30 bg-white font-serif"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            <FiFilter className="text-[#00695C] shrink-0" />
            {categories.map((category) => (
              <button
                key={category}
                className={`px-4 py-2 rounded-full font-serif whitespace-nowrap transition-all ${
                  activeCategory === category
                    ? "bg-[#C06014] text-white"
                    : "bg-white text-[#003D33]  -[#B2C5B2] hover:-[#C06014]"
                }`}
                onClick={() => setActiveCategory(category)}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 -t-2 -b-2 -[#C06014]"></div>
          </div>
        ) : (
          <>
            {/* Results Info */}
            <div className="mb-6">
              <p className="text-[#00695C] font-serif">
                Showing {filteredRemedies.length} of {remedies.length} remedies
              </p>
            </div>

            {/* Remedies Grid */}
            {filteredRemedies.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {filteredRemedies.map(remedy => (
                  <RemedyCard
                    key={remedy._id}
                    remedy={remedy}
                    onBook={() => setSelected(remedy)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="text-[#C06014] text-6xl mb-4">🔮</div>
                <h3 className="text-xl font-serif text-[#003D33] mb-2">
                  No remedies found
                </h3>
                <p className="text-[#00695C] font-serif">
                  Try adjusting your search or filter criteria
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Features Section */}
      <div className="bg-[#ECE5D3] py-12 px-4 mt-12">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-serif font-bold text-center text-[#003D33] mb-8 max-md:text-2xl max-sm:text-xl">
            Why Choose MyAstrova Remedies?
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: "🌿", title: "Authentic Vedic Methods", desc: "Traditional remedies passed down through generations" },
              { icon: "⭐", title: "Personalized Guidance", desc: "Tailored solutions based on your birth chart" },
              { icon: "🕊️", title: "Spiritual Energy", desc: "Each remedy is energized with positive vibrations" }
            ].map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-xl text-center">
                <div className="text-3xl mb-4 max-md:text-2xl">{feature.icon}</div>
                <h3 className="font-serif font-bold text-[#003D33] mb-2 max-md:text-base">{feature.title}</h3>
                <p className="text-[#00695C] font-serif text-sm ">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {selected && (
        <RemedyModal
          remedy={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}