"use client";
import Image from "next/image";
import { motion } from "framer-motion";
import { Quote, Star } from "lucide-react";
import { useEffect, useState } from "react";
import axios from "axios";

const REVIEWS_PER_SLIDE = 3;

export default function Testimonial() {
  const [siteReviews, setSiteReviews] = useState([]); // Top section reviews
  const [astroReviews, setAstroReviews] = useState([]); // Bottom section reviews
  const [index, setIndex] = useState(0);

  // 🔹 Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API;
        
        // 1. Fetch General Site Reviews (Top Section)
        const siteRes = await axios.get(`${apiUrl}/api/ratings/reviews`);
        setSiteReviews(siteRes.data.reviews || []);

        // 2. Fetch Astrologer Reviews (Bottom Section)
        const astroRes = await axios.get(`${apiUrl}/api/ratings/astrologer-reviews`);
        
        setAstroReviews(astroRes.data.reviews || []);
        
      } catch (err) {
        console.error("Failed to load reviews", err);
      }
    };
    fetchData();
  }, []);

  // 🔹 Auto slide carousel for Top Section
  useEffect(() => {
    if (siteReviews.length <= REVIEWS_PER_SLIDE) return;
    const interval = setInterval(() => {
      setIndex((prev) =>
        prev + REVIEWS_PER_SLIDE >= siteReviews.length ? 0 : prev + REVIEWS_PER_SLIDE
      );
    }, 4000);
    return () => clearInterval(interval);
  }, [siteReviews]);

  const visibleSiteReviews = siteReviews.slice(index, index + REVIEWS_PER_SLIDE);

  return (
    <div className="relative overflow-visible">
      
      {/* ===================== TOP SECTION: SITE TESTIMONIALS ===================== */}
      <section className="relative bg-white py-16 sm:py-20 md:py-28 lg:py-32 overflow-visible">
        {/* Background decorations */}
        <div className="absolute left-[-50px] bottom-[-80px] w-[250px] sm:w-[300px] md:w-[400px] opacity-60 z-0 pointer-events-none">
          <Image src="/star.png" alt="Stars" width={400} height={400} className="object-contain" />
        </div>
        <div className="absolute right-[-100px] top-[20px] w-[350px] sm:w-[450px] md:w-[600px] opacity-20 z-0 pointer-events-none">
          <Image src="/bgCircle.png" alt="Chakra" width={600} height={600} className="object-contain" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-10 lg:px-12">
          {/* Badge */}
          <p className="inline-block px-4 sm:px-5 py-2 bg-[#E5DECED6] rounded-full text-[#7E5833] font-medium text-xs sm:text-sm mb-4">
            Testimonial
          </p>

          {/* Heading */}
          <h2 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-semibold leading-snug text-black mb-8 sm:mb-10 max-w-[95%] sm:max-w-[650px] md:w-[700px]">
            User Love for MyAstrova
          </h2>

          {/* Site Reviews Grid / Slider */}
          {/* UPDATED LAYOUT:
              1. flex: Enables horizontal row layout
              2. overflow-x-auto: Enables scrolling on mobile
              3. snap-x: Enables snap scrolling
              4. md:grid: Switches to Grid on tablets/desktop
          */}
          <div className="flex md:grid md:grid-cols-3 gap-6 overflow-x-auto md:overflow-visible snap-x snap-mandatory pb-4 md:pb-0 scrollbar-hide">
            {visibleSiteReviews.map((review) => (
              <motion.div
                key={review._id}
                whileHover={{ scale: 1.03 }}
                transition={{ duration: 0.3 }}
                // UPDATED ITEM: min-w added to prevent shrinking on mobile flex layout
                className="relative bg-white border border-gray-200 rounded-lg shadow-md p-6 overflow-hidden min-w-[85vw] sm:min-w-[45vw] md:min-w-0 snap-center flex-shrink-0"
              >
                {/* Decorative Ellipse */}
                <div className="absolute top-0 left-0 w-24 h-24 sm:w-28 sm:h-28 -translate-x-6 -translate-y-6">
                  <Image src="/ellipse.png" alt="ellipse" fill className="object-contain opacity-95" />
                  <div className="absolute inset-0 flex items-center justify-center text-[#7E5833]">
                    <Quote size={28} className="opacity-80" />
                  </div>
                </div>

                {/* Content */}
                <h3 className="text-[#7E5833] font-semibold italic text-lg sm:text-xl mt-8 mb-4 ml-6">
                  {review.userId?.username || "Anonymous"}
                </h3>
                <p className="text-[#4A3A28] text-sm sm:text-[15px] leading-relaxed mb-6">
                  {review.review.length > 150 ? review.review.slice(0, 150) + "..." : review.review}
                </p>

                {/* Footer */}
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-[#E5DECED6] flex items-center justify-center text-[#7E5833] font-bold">
                      {review.userId?.username?.charAt(0).toUpperCase() || "U"}
                    </div>
                    <div>
                      <p className="font-semibold text-[#7E5833] text-sm">{review.userId?.username}</p>
                      <p className="text-xs text-gray-500">{review.createdAt?.slice(0, 10)}</p>
                    </div>
                  </div>
                  <div className="flex text-yellow-500 text-sm">
                    {"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== BOTTOM SECTION: ASTROLOGER REVIEWS ===================== */}
      <section className="relative py-16 sm:py-20 md:py-28 overflow-hidden bg-[#FDFBF7]">
        {/* Background Overlay */}
        <div className="absolute inset-0 -z-10">
          <Image
            src="/testimonialbg.png"
            alt="Background"
            fill
            className="object-cover brightness-[0.9] opacity-10"
          />
          <div className="absolute inset-0 bg-[#F6F3E4BD]/100 mix-blend-overlay"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 md:px-10 lg:px-12">
          {/* Badge */}
          <p className="inline-block px-4 sm:px-5 py-2 bg-[#E5DECED6] rounded-full text-[#7E5833] font-medium text-xs sm:text-sm mb-4">
            Astrologer Reviews
          </p>

          {/* Heading */}
          <h2 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-semibold leading-snug text-black mb-8 sm:mb-12 max-w-[95%] sm:max-w-[750px]">
              Trusted by Thousands for Expert Guidance
          </h2>

          {/* Astrologer Review Cards - SLIDER ENABLED */}
          <div className="flex md:grid md:grid-cols-3 gap-6 lg:gap-8 overflow-x-auto md:overflow-visible snap-x snap-mandatory pb-6 md:pb-0 scrollbar-hide">
            {astroReviews.length > 0 ? (
              astroReviews.map((item) => (
                <motion.div
                  key={item._id}
                  whileHover={{ y: -5 }}
                  // UPDATED ITEM: Added min-w-[85vw] for mobile slider effect
                  className="bg-white rounded-2xl shadow-lg border border-[#E5E0D6] p-5 flex flex-col h-full min-w-[85vw] sm:min-w-[45vw] md:min-w-0 snap-center flex-shrink-0"
                >
                  {/* 1. Astrologer Header */}
                  <div className="flex items-center gap-4 border-b border-gray-100 pb-4 mb-4">
                    <div className="relative w-14 h-14 flex-shrink-0">
                      <img
                        src={item.astrologer?.profileImageUrl 
                          ? `${process.env.NEXT_PUBLIC_API}${item.astrologer.profileImageUrl}` 
                          : "/avatar-placeholder.png"}
                        alt={item.astrologer?.fullName}
                        className="rounded-full h-full w-full object-cover border-2 border-[#E5DECED6]"
                      />
                    </div>
                    <div>
                      <h4 className="text-[#3E2723] font-bold text-lg leading-tight">
                        {item.astrologer?.fullName}
                      </h4>
                      <p className="text-[#7E5833] text-xs font-medium">
                        {item.astrologer?.expertise?.[0] || "Vedic Astrologer"}
                      </p>
                    </div>
                  </div>

                  {/* 2. Review Content */}
                  <div className="flex-grow">
                    <div className="flex text-yellow-400 mb-2">
                      {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            size={14} 
                            fill={i < item.rating ? "currentColor" : "none"} 
                            className={i < item.rating ? "text-yellow-400" : "text-gray-300"}
                          />
                      ))}
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed italic">
                      "{item.comment?.length > 120 ? item.comment.slice(0, 120) + "..." : item.comment}"
                    </p>
                  </div>

                  {/* 3. User Footer */}
                  <div className="mt-5 pt-3 border-t border-gray-50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-[10px] text-gray-600 font-bold">
                          {item.user?.username?.charAt(0).toUpperCase() || "U"}
                        </div>
                        <span className="text-xs text-gray-500 font-medium">
                          {item.user?.username || "Anonymous User"}
                        </span>
                    </div>
                    <span className="text-[10px] text-gray-400">
                      {item.createdAt?.slice(0, 10)}
                    </span>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full text-center py-10 text-gray-500 w-full">
                Loading astrologer reviews...
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}