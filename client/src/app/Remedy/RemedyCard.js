"use client";
import { useState } from "react";
import { FiClock, FiStar, FiChevronRight } from "react-icons/fi";

export default function RemedyCard({ remedy, onBook }) {
  const [imageError, setImageError] = useState(false);

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300  -[#B2C5B2]/20 group hover:-[#C06014]/30  ">
      {/* Image Container with Gradient Overlay */}
      <div className="relative h-60 overflow-hidden">
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent z-10"></div>
        
        {!imageError ? (
          <img
            src={`${process.env.NEXT_PUBLIC_API}${remedy.image}`}
            alt={remedy.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#ECE5D3] to-[#F7F3E9]">
            <div className="text-6xl text-[#C06014]">🔮</div>
          </div>
        )}
        
        {/* Top Badges */}
        <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-20">
          {/* Category Badge */}
          {remedy.category && (
            <div className="bg-gradient-to-r from-[#003D33] to-[#00695C] text-white px-4 py-2 rounded-full text-sm font-serif shadow-lg">
              {remedy.category}
            </div>
          )}
          
         
        </div>
        
        {/* Bottom Overlay with Duration */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 z-20">
          {remedy.duration && (
            <div className="flex items-center gap-2 text-white font-serif">
              <FiClock size={16} className="text-[#C06014]" />
              <span className="text-sm font-medium">{remedy.duration}</span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Title with Price */}
        <div className="flex justify-between items-start mb-3">
          <h3 className="font-serif font-bold text-xl text-[#003D33] leading-tight pr-2">
            {remedy.title}
          </h3>
          <div className="flex flex-col items-end">
            <div className="text-2xl font-bold text-[#C06014] font-serif">
              ₹{remedy.price}
            </div>

          
          </div>
          <p className="">{remedy.duration}</p>
        </div>

        {/* Description */}
        <p className="text-[#00695C] font-serif text-sm mb-6 line-clamp-2 min-h-[40px]">
          {remedy.description}
        </p>

        {/* Action Button */}
        <button
          onClick={onBook}
          className="w-full bg-gradient-to-r from-[#003D33] via-[#00695C] to-[#003D33] bg-size-200 text-white px-6 py-3 rounded-xl font-serif font-medium hover:shadow-lg transition-all duration-300 group-hover:bg-right-bottom hover:scale-[1.02] flex items-center justify-center gap-2"
          style={{
            backgroundSize: '200% 100%',
          }}
        >
          <span>Book Now</span>
          <FiChevronRight className="group-hover:translate-x-1 transition-transform" />
        </button>

        
      </div>

      {/* Hover Effect  */}
      <div className="absolute inset-0 -2 -transparent group-hover:-[#C06014]/20 rounded-2xl pointer-events-none transition-all duration-300"></div>
    </div>
  );
}