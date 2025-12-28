"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";

export default function MiniAdStrip({ slides = [] }) {
  if (!slides.length) return null;

  return (
    <div className="w-full mt-4">
      <Swiper
        modules={[Autoplay]}
        autoplay={{
          delay: 2500,
          disableOnInteraction: false,
        }}
        loop
        slidesPerView={1}
        className="h-[50px] rounded-lg bg-[#FFF7ED] border border-[#E6D8C3]"
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide._id}>
            <a
              href={slide.buttonLink || "#"}
              className="relative flex items-center h-full px-2"
            >
              {/* Image Container */}
              <div className="relative h-[38px] w-full rounded-md overflow-hidden">
                <img
                  src={`${process.env.NEXT_PUBLIC_API}${slide.image}`}
                  alt={slide.title}
                  className="h-full w-full object-fill"
                />

                {/* Title Overlay */}
                {slide.title && (
                  <div className="absolute inset-0 bg-black/30 flex items-end">
                    <p className="text-[10px] sm:text-[11px] text-white font-medium px-2 pb-1 truncate">
                      {slide.title}
                    </p>
                  </div>
                )}
              </div>

              {/* CTA Arrow */}
              <span className="ml-2 text-xs font-semibold text-[#7E5833] whitespace-nowrap">
                →
              </span>
            </a>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
