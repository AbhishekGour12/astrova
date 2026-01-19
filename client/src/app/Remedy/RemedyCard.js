"use client";
import { useState } from "react";
import { FiClock, FiChevronRight } from "react-icons/fi";

export default function RemedyCard({ remedy, onBook }) {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="group flex flex-col h-full bg-white rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-[#B2C5B2]/20 hover:border-[#C06014]/30 overflow-hidden">
      
      {/* --- Image Container --- */}
      {/* Height changes: Mobile(12rem/48) -> Tablet(14rem/56) -> Desktop(16rem/64) */}
      <div className="relative h-48 sm:h-56 md:h-64 overflow-hidden flex-shrink-0">
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent z-10"></div>

        {!imageError ? (
          <img
            src={`${process.env.NEXT_PUBLIC_API}${remedy.image}`}
            alt={remedy.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-in-out"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#ECE5D3] to-[#F7F3E9]">
            <div className="text-4xl sm:text-5xl md:text-6xl text-[#C06014]">🔮</div>
          </div>
        )}

        {/* Top Badge (Category) */}
        {remedy.category && (
          <div className="absolute top-3 left-3 sm:top-4 sm:left-4 z-20">
            <div className="bg-gradient-to-r from-[#003D33] to-[#00695C] text-white px-3 py-1 sm:px-4 sm:py-1.5 rounded-full text-xs sm:text-sm font-serif shadow-lg tracking-wide">
              {remedy.category}
            </div>
          </div>
        )}

        {/* Bottom Overlay (Duration) */}
        {remedy.duration && (
          <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 z-20 flex items-center gap-1.5 sm:gap-2 text-white/90">
            <FiClock className="text-[#C06014] w-3 h-3 sm:w-4 sm:h-4" />
            <span className="text-xs sm:text-sm font-medium font-serif tracking-wide">
              {remedy.duration}
            </span>
          </div>
        )}
      </div>

      {/* --- Content Container --- */}
      {/* Flex-1 ensures this section fills available space, pushing button to bottom */}
      <div className="flex-1 flex flex-col p-4 sm:p-5 md:p-6">
        
        {/* Title & Price Row */}
        <div className="flex justify-between items-start gap-3 mb-2 sm:mb-3">
          <h3 className="font-serif font-bold text-lg sm:text-xl md:text-2xl text-[#003D33] leading-tight">
            {remedy.title}
          </h3>
          <div className="flex-shrink-0 text-right">
            <div className="text-lg sm:text-xl md:text-2xl font-bold text-[#C06014] font-serif">
              ₹{remedy.price}
            </div>
          </div>
        </div>

        {/* Description */}
        {/* line-clamp-2 for mobile, line-clamp-3 for larger screens */}
        <p className="text-[#00695C] font-serif text-xs sm:text-sm leading-relaxed mb-4 sm:mb-6 line-clamp-2 md:line-clamp-3 min-h-[2.5rem] sm:min-h-[3.75rem]">
          {remedy.description}
        </p>

        {/* Action Button */}
        {/* mt-auto forces button to the bottom of the card */}
        <div className="mt-auto">
          <button
            onClick={onBook}
            className="w-full bg-gradient-to-r from-[#003D33] via-[#00695C] to-[#003D33] bg-size-200 text-white px-4 py-2.5 sm:px-6 sm:py-3 rounded-lg sm:rounded-xl font-serif text-sm sm:text-base font-medium hover:shadow-lg transition-all duration-300 group-hover:bg-right-bottom hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2"
            style={{ backgroundSize: "200% 100%" }}
          >
            <span>Book Now</span>
            <FiChevronRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}