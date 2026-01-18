"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import axios from "axios";
import {
  FaLanguage,
  FaUserGraduate,
  FaStar,
  FaVideo,
  FaPhoneAlt,
  FaCommentDots,
  FaMapMarkerAlt,
} from "react-icons/fa";
import { MdWork } from "react-icons/md";

// Swiper Imports
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AstrologerListSection() {
  const [astrologers, setAstrologers] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // FETCH DATA
  useEffect(() => {
    const fetchAstrologers = async () => {
      try {
        const { data } = await axios.get(
          `${process.env.NEXT_PUBLIC_API}/api/astrologer/?service=ALL`
        );
        setAstrologers(data);
      } catch (error) {
        console.error("Error fetching astrologers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAstrologers();
  }, []);

  // LOADING STATE
  if (loading) {
    return (
      <section className="relative bg-white mt-[10%] py-28 flex justify-center items-center">
        <p className="text-[#7E5833] font-semibold animate-pulse">
          Loading Top Astrologers...
        </p>
      </section>
    );
  }

  const astrologerProfile = (id) => {
    router.push(`astrologers/${id}`);
  };

  return (
    <section className="relative bg-white mt-[5%] max-md:mt-[60%] max-sm:mt-[100%] md:py-28 overflow-hidden pt-10 pb-10">
      {/* Decorative Backgrounds */}
      <div className="absolute top-30 w-[500px] opacity-5 -z-0 left-[-100px]">
        <Image src="/productstar.png" alt="Left Star" width={500} height={500} />
      </div>
      <div className="absolute right-[-50px] top-[50px] w-[250px] opacity-50 -z-0">
        <Image src="/star.png" alt="Right Star" width={250} height={250} />
      </div>

      <div className="max-w-[1440px] mx-auto px-4 md:px-12 relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 md:mb-10">
          <div>
            <p className="inline-block px-4 py-1 bg-[#E5DECED6] text-[#7E5833] rounded-full text-sm font-medium mb-3">
              Expert Guidance
            </p>
            <h2 className="text-2xl md:text-3xl font-bold leading-snug text-black max-w-2xl">
              Connect with India&apos;s Top Astrologers
            </h2>
            <p className="text-gray-600 mt-2 text-sm md:text-base">
              Get instant clarity on love, career, and life from certified experts.
            </p>
          </div>
          <Link
            href="/astrologers?service=ALL"
            className="mt-6 md:mt-0 px-6 py-2 bg-[#003D33] text-white rounded-md font-medium hover:bg-[#002a23] transition"
          >
            View All Astrologers
          </Link>
        </div>

        {/* SLIDER SECTION */}
        {astrologers.length === 0 ? (
          <p className="text-center text-gray-500">No astrologers found.</p>
        ) : (
          <Swiper
            modules={[Autoplay, Pagination]}
            // Responsive space between slides
            spaceBetween={15} 
            slidesPerView={1}
            pagination={{ clickable: true, dynamicBullets: true }}
            autoplay={{ delay: 5000, disableOnInteraction: false }}
            breakpoints={{
              320: { slidesPerView: 1, spaceBetween: 10 }, // Very small screens
              480: { slidesPerView: 1, spaceBetween: 20 },
              640: { slidesPerView: 1, spaceBetween: 30 },
              768: { slidesPerView: 2, spaceBetween: 30 },
              1200: { slidesPerView: 3, spaceBetween: 30 },
              1600: { slidesPerView: 4, spaceBetween: 30 },
            }}
            className="pb-14 !px-1 md:!px-4" // Reduced padding on mobile
          >
            {astrologers.map((astro) => {
              const avail = astro.availability || "NONE";
              const isAllAvailability = avail === "ALL";
              const isMeetAvailable = ["MEET", "ALL"].includes(avail);

              const showChat =
                (isAllAvailability || ["CHAT", "BOTH", "ALL"].includes(avail)) &&
                (astro.pricing?.chatPerMinute > 0 || isAllAvailability);
              const showCall =
                (isAllAvailability || ["CALL", "BOTH", "ALL"].includes(avail)) &&
                (astro.pricing?.callPerMinute > 0 || isAllAvailability);
              const showMeet = isMeetAvailable;

              return (
                <SwiperSlide key={astro._id} className="!h-auto">
                  <div
                    className="border border-gray-200 rounded-xl md:rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 bg-white overflow-hidden h-full flex flex-col group hover:cursor-pointer"
                    onClick={() => {
                      astrologerProfile(astro._id);
                    }}
                  >
                    {/* Upper Section: Image & Details */}
                    {/* Reduced padding from p-6 to p-3 on mobile */}
                    <div className="flex items-start p-3 sm:p-5 md:p-6 border-b border-gray-100 flex-1 relative">
                      
                      {/* Image - Responsive Size */}
                      <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 rounded-full overflow-hidden flex-shrink-0 border-2 border-[#E5DECED6] group-hover:border-[#7E5833] transition-colors">
                        <img
                          src={
                            astro.profileImageUrl
                              ? `${process.env.NEXT_PUBLIC_API}${astro.profileImageUrl}`
                              : "/default-avatar.png"
                          }
                          alt={astro.name}
                          className="object-cover w-full h-full"
                        />
                      </div>

                      {/* Text Details - Reduced margins */}
                      <div className="ml-3 sm:ml-4 md:ml-5 flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <h3 className="text-[#7E5833] font-bold text-base sm:text-lg leading-tight line-clamp-1 truncate pr-1">
                            {astro.fullName}
                          </h3>
                          {astro.averageRating > 0 && (
                            <span className="text-[10px] sm:text-xs flex-shrink-0 flex items-center bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded-md font-bold">
                              <FaStar className="mr-1 text-yellow-600" />
                              {astro.averageRating.toFixed(1)}
                            </span>
                          )}
                        </div>

                        <div className="text-xs sm:text-sm text-gray-600 space-y-1.5 mt-1.5">
                          <p className="flex items-start space-x-1.5">
                            <FaLanguage className="mt-0.5 text-gray-400 flex-shrink-0" />
                            <span className="line-clamp-1 break-all">
                              {Array.isArray(astro.languages)
                                ? astro.languages.join(", ")
                                : astro.languages}
                            </span>
                          </p>

                          <p className="flex items-center space-x-1.5">
                            <FaUserGraduate className="text-gray-400 flex-shrink-0" />
                            <span>{astro.experienceYears} Years Exp.</span>
                          </p>

                          <p className="flex items-start space-x-1.5">
                            <MdWork className="mt-0.5 text-gray-400 flex-shrink-0" />
                            <span className="line-clamp-1 break-all">
                              {Array.isArray(astro.expertise)
                                ? astro.expertise.join(", ")
                                : astro.expertise}
                            </span>
                          </p>

                          {isMeetAvailable && (
                            <div className="pt-1">
                              <span className="inline-flex items-center space-x-1 text-green-700 font-bold text-[10px] sm:text-[11px] bg-green-50 border border-green-200 px-2 py-0.5 rounded-full whitespace-nowrap">
                                <FaMapMarkerAlt className="text-green-600" />
                                <span>In-Person Meet</span>
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Lower Section: Dynamic Pricing */}
                    {(showChat || showCall || showMeet) && (
                      <div className="bg-gray-50 px-2 sm:px-4 py-3 border-t border-gray-100 mt-auto">
                        <div className="grid grid-flow-col auto-cols-fr gap-1 divide-x divide-gray-200">
                          
                          {/* CHAT */}
                          {showChat && (
                            <div className="flex flex-col items-center px-1">
                              <FaCommentDots className="text-gray-400 mb-1 text-xs sm:text-sm" />
                              <span className="text-[8px] sm:text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-0.5">Chat</span>
                              <span className="text-[#003D33] font-bold text-xs sm:text-sm md:text-base whitespace-nowrap">
                                {astro.pricing?.chatPerMinute > 0 
                                  ? `₹${astro.pricing.chatPerMinute}/m` 
                                  : "Contact"}
                              </span>
                            </div>
                          )}

                          {/* CALL */}
                          {showCall && (
                            <div className="flex flex-col items-center px-1">
                              <FaPhoneAlt className="text-gray-400 mb-1 text-xs sm:text-sm" />
                              <span className="text-[8px] sm:text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-0.5">Call</span>
                              <span className="text-[#003D33] font-bold text-xs sm:text-sm md:text-base whitespace-nowrap">
                                {astro.pricing?.callPerMinute > 0 
                                  ? `₹${astro.pricing.callPerMinute}/m` 
                                  : "Contact"}
                              </span>
                            </div>
                          )}

                          {/* MEET */}
                          {showMeet && (
                            <div className="flex flex-col items-center px-1">
                              <FaVideo className="text-gray-400 mb-1 text-xs sm:text-sm" />
                              <span className="text-[8px] sm:text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-0.5">Meet</span>
                              <span className="text-[#003D33] font-bold text-xs sm:text-sm whitespace-nowrap text-center">
                                {astro.pricing?.meetPerMinute > 0
                                  ? `₹${astro.pricing.meetPerMinute}/m`
                                  : "Contact"} 
                                  {/* Shortened "Contact Name" to just "Contact" for mobile to prevent overflow */}
                              </span>
                            </div>
                          )}

                        </div>
                      </div>
                    )}
                  </div>
                </SwiperSlide>
              );
            })}
          </Swiper>
        )}
      </div>
    </section>
  );
}