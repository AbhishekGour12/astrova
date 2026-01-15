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
import {useRouter} from "next/navigation"
export default function AstrologerListSection() {
  const [astrologers, setAstrologers] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter()
  // FETCH DATA
  useEffect(() => {
    const fetchAstrologers = async () => {
      try {
        const { data } = await axios.get(
          `${process.env.NEXT_PUBLIC_API}/api/admin/astrologers/?service=ALL`
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
const astrologerProfile =(id) =>{
   router.push(`astrologers/${id}`)

}
  return (
    <section className="relative bg-white mt-[5%] max-md:mt-[60%] max-sm:mt-[70%] md:py-28 overflow-hidden">
      {/* Decorative Backgrounds */}
      <div className="absolute top-30 w-[500px] opacity-5 -z-0 left-[-100px]">
        <Image
          src="/productstar.png"
          alt="Left Star"
          width={500}
          height={500}
        />
      </div>
      <div className="absolute right-[-50px] top-[50px] w-[250px] opacity-50 -z-0">
        <Image src="/star.png" alt="Right Star" width={250} height={250} />
      </div>

      {/* Increased container width for wider cards */}
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 relative z-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-10">
          <div>
            <p className="inline-block px-4 py-1 bg-[#E5DECED6] text-[#7E5833] rounded-full text-sm font-medium mb-3">
              Expert Guidance
            </p>
            <h2 className="text-3xl max-md:text-2xl font-bold leading-snug text-black max-w-2xl">
              Connect with India&apos;s Top Astrologers
            </h2>
            <p className="text-gray-600 mt-2">
              Get instant clarity on love, career, and life from certified
              experts.
            </p>
          </div>
          <Link href="/astrologers?service=ALL" className="mt-6 md:mt-0 px-6 py-2 bg-[#003D33] text-white rounded-md font-medium hover:bg-[#002a23] transition">
            View All Astrologers
          </Link>
        </div>

        {/* SLIDER SECTION */}
        {astrologers.length === 0 ? (
          <p className="text-center text-gray-500">No astrologers found.</p>
        ) : (
          <Swiper
            modules={[Autoplay, Pagination]}
            spaceBetween={30} // Increased gap between cards
            slidesPerView={1}
            pagination={{ clickable: true, dynamicBullets: true }}
            autoplay={{ delay: 5000, disableOnInteraction: false }}
            breakpoints={{
              640: { slidesPerView: 1 }, // Mobile: Full width card
              768: { slidesPerView: 2 }, // Tablet: 2 Cards
              1200: { slidesPerView: 3 }, // Laptop: 3 Cards (Wider than 4)
              1600: { slidesPerView: 4 }, // Large Screens: 4 Cards
            }}
            className="pb-14 !px-4" // Padding to prevent shadow cut-off
          >
            {astrologers.map((astro) => {
              // Availability & Price Check Logic
              const avail = astro.availability || "NONE";
              
              // For "ALL" availability, show all three options regardless of pricing
              const isAllAvailability = avail === "ALL";
              
              // Check if meet is available (MEET or ALL)
              const isMeetAvailable = ["MEET", "ALL"].includes(avail);
              
              // For non-ALL availability, check pricing
              const showChat = (isAllAvailability || ["CHAT", "BOTH", "ALL"].includes(avail)) && 
                              (astro.pricing?.chatPerMinute > 0 || isAllAvailability);
              const showCall = (isAllAvailability || ["CALL", "BOTH", "ALL"].includes(avail)) && 
                              (astro.pricing?.callPerMinute > 0 || isAllAvailability);
              const showMeet = isMeetAvailable;

              return (
                // !h-auto + h-full ensures Equal Height for all cards
                <SwiperSlide key={astro._id} className="!h-auto">
                  <div className="border border-gray-200 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 bg-white overflow-hidden h-full flex flex-col group hover:cursor-pointer" onClick={() =>{astrologerProfile(astro._id)}}>
                    
                    {/* Upper Section: Image & Details */}
                    {/* flex-1 pushes the pricing footer to the bottom */}
                    <div className="flex items-start p-6 border-b border-gray-100 flex-1 relative">
                      
                      {/* Image */}
                      <div className="w-20 h-20 rounded-full overflow-hidden flex-shrink-0 border-2 border-[#E5DECED6] group-hover:border-[#7E5833] transition-colors">
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

                      {/* Text Details */}
                      <div className="ml-5 flex-1">
                        <div className="flex justify-between items-start">
                          <h3 className="text-[#7E5833] font-bold text-lg leading-tight line-clamp-1">
                            {astro.fullName}
                          </h3>
                          {astro.averageRating > 0 && (
                            <span className="text-xs flex items-center bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-md font-bold">
                              <FaStar className="mr-1 text-yellow-600" />
                              {astro.averageRating.toFixed(1)}
                            </span>
                          )}
                        </div>

                        <div className="text-sm text-gray-600 space-y-2 mt-2">
                          <p className="flex items-start space-x-2">
                            <FaLanguage className="mt-1 text-gray-400 flex-shrink-0" />
                            <span className="line-clamp-1">
                              {Array.isArray(astro.languages)
                                ? astro.languages.join(", ")
                                : astro.languages}
                            </span>
                          </p>

                          <p className="flex items-center space-x-2">
                            <FaUserGraduate className="text-gray-400 flex-shrink-0" />
                            <span>{astro.experienceYears} Years Exp.</span>
                          </p>

                          <p className="flex items-start space-x-2">
                            <MdWork className="mt-1 text-gray-400 flex-shrink-0" />
                            <span className="line-clamp-1">
                              {Array.isArray(astro.expertise)
                                ? astro.expertise.join(", ")
                                : astro.expertise}
                            </span>
                          </p>

                          {/* "Available for Meet" Indicator */}
                          {isMeetAvailable && (
                            <div className="pt-1">
                              <span className="inline-flex items-center space-x-1.5 text-green-700 font-bold text-[11px] bg-green-50 border border-green-200 px-2.5 py-1 rounded-full">
                                <FaMapMarkerAlt className="text-green-600" />
                                <span>Available for In-Person Meet</span>
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Lower Section: Dynamic Pricing */}
                    {/* Consistent height footer logic */}
                    {(showChat || showCall || showMeet) && (
                      <div className="bg-gray-50 px-4 py-4 border-t border-gray-100 mt-auto">
                        <div className="grid grid-flow-col auto-cols-fr gap-2 divide-x divide-gray-200">
                          
                          {/* CHAT */}
                          {showChat && astro.pricing?.chatPerMinute > 0 && (
                            <div className="flex flex-col items-center px-2">
                              <FaCommentDots className="text-gray-400 mb-1 text-sm" />
                              <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-0.5">Chat</span>
                              <span className="text-[#003D33] font-bold text-base whitespace-nowrap">
                                ₹{astro.pricing.chatPerMinute}/m
                              </span>
                            </div>
                          )}
                          
                          {/* CHAT (when ALL availability but no pricing) */}
                          {showChat && (!astro.pricing?.chatPerMinute || astro.pricing.chatPerMinute <= 0) && (
                            <div className="flex flex-col items-center px-2">
                              <FaCommentDots className="text-gray-400 mb-1 text-sm" />
                              <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-0.5">Chat</span>
                              <span className="text-[#003D33] font-bold text-sm whitespace-nowrap">
                                Contact {astro.fullName.split(' ')[0]}
                              </span>
                            </div>
                          )}

                          {/* CALL */}
                          {showCall && astro.pricing?.callPerMinute > 0 && (
                            <div className="flex flex-col items-center px-2">
                              <FaPhoneAlt className="text-gray-400 mb-1 text-sm" />
                              <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-0.5">Call</span>
                              <span className="text-[#003D33] font-bold text-base whitespace-nowrap">
                                ₹{astro.pricing.callPerMinute}/m
                              </span>
                            </div>
                          )}
                          
                          {/* CALL (when ALL availability but no pricing) */}
                          {showCall && (!astro.pricing?.callPerMinute || astro.pricing.callPerMinute <= 0) && (
                            <div className="flex flex-col items-center px-2">
                              <FaPhoneAlt className="text-gray-400 mb-1 text-sm" />
                              <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-0.5">Call</span>
                              <span className="text-[#003D33] font-bold text-sm whitespace-nowrap">
                                Contact {astro.name.split(' ')[0]}
                              </span>
                            </div>
                          )}

                          {/* MEET */}
                          {showMeet && (
                            <div className="flex flex-col items-center px-2">
                              <FaVideo className="text-gray-400 mb-1 text-sm" />
                              <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-0.5">Meet</span>
                              <span className="text-[#003D33] font-bold text-sm whitespace-nowrap text-center">
                                {astro.pricing?.meetPerMinute > 0 
                                  ? `₹${astro.pricing.meetPerMinute}/m`
                                  : `Contact ${astro.fullName.split(' ')[0]}`
                                }
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