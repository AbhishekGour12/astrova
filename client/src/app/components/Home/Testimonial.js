"use client";
import Image from "next/image";
import { motion } from "framer-motion";
import { Quote } from "lucide-react";

export default function Testimonial() {
  return (
    <div className="relative overflow-visible">
      {/* ===================== TOP TESTIMONIAL SECTION ===================== */}
      <section className="relative bg-white py-16  sm:py-20 md:py-28 lg:py-32 overflow-visible ">
        {/* Background decorations */}
        <div className="absolute left-[-50px] bottom-[-80px] w-[250px] sm:w-[300px] md:w-[400px] opacity-60 z-0">
          <Image
            src="/star.png"
            alt="Stars"
            width={400}
            height={400}
            className="object-contain"
          />
        </div>

        <div className="absolute right-[-100px] top-[20px] w-[350px] sm:w-[450px] md:w-[600px] opacity-20 z-0">
          <Image
            src="/bgCircle.png"
            alt="Chakra"
            width={600}
            height={600}
            className="object-contain"
          />
        </div>

        {/* Content */}
       <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-10 lg:px-12">
      {/* Badge */}
      <p className="inline-block px-4 sm:px-5 py-2 bg-[#E5DECED6] rounded-full text-[#7E5833] font-medium text-xs sm:text-sm mb-4">
        Testimonial
      </p>

      {/* Heading */}
      <h2 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-semibold leading-snug text-black mb-8 sm:mb-10 max-w-[95%] sm:max-w-[650px] md:w-[700px]">
        Expert Readings Led to Life-Changing Clarity
      </h2>

      {/* Testimonial Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((_, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.03 }}
            transition={{ duration: 0.3 }}
            className="relative bg-white border border-gray-200 rounded-lg shadow-md p-6 overflow-hidden"
          >
            {/* Ellipse Background + Quote */}
            <div className="absolute top-0 left-0 w-24 h-24 sm:w-28 sm:h-28 -translate-x-6 -translate-y-6">
              <Image
                src="/ellipse.png"
                alt="decorative ellipse"
                fill
                className="object-contain opacity-95"
              />
              <div className="absolute inset-0 flex items-center justify-center text-[#7E5833]">
                <Quote size={28} className="opacity-80" />
              </div>
            </div>

            {/* Name */}
            <h3 className="text-[#7E5833] font-semibold italic text-lg sm:text-xl mt-8 mb-4 text-left ml-6">
              Sumona
            </h3>

            {/* Review */}
            <p className="text-[#4A3A28] text-sm sm:text-[15px] leading-relaxed mb-6">
              The reading was incredibly accurate. I finally understand the
              patterns in my life! Truly clarifying and empowering.
            </p>

            {/* Profile Section */}
            <div className="flex items-center justify-between mt-4 flex-wrap sm:flex-nowrap">
              <div className="flex items-center space-x-3">
                {/* Profile Circle */}
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#E5DECED6] flex items-center justify-center text-[#7E5833] font-semibold text-base sm:text-lg">
                  SS
                </div>
                <div>
                  <p className="font-semibold text-[#7E5833] text-sm sm:text-base">
                    Sumona S
                  </p>
                  <p className="text-xs sm:text-sm text-gray-500">
                    23 November 2025
                  </p>
                </div>
              </div>
              {/* Stars */}
              <div className="text-yellow-500 text-sm sm:text-base mt-2 sm:mt-0">
                ★★★★★
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
      </section>

      {/* ===================== BOTTOM BLOG SECTION ===================== */}
      <section className="relative py-16 sm:py-20 md:py-28 overflow-hidden">
        {/* Blended Background with soft overlay */}
        <div className="absolute inset-0 -z-10">
          <Image
            src="/testimonialbg.png"
            alt="Star Background"
            fill
            className="object-cover brightness-[0.9] opacity-10"
          />
          <div className="absolute inset-0 bg-[#F6F3E4BD]/100 mix-blend-overlay"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 md:px-10 lg:px-12">
          {/* Badge */}
          <p className="inline-block px-4 sm:px-5 py-2 bg-[#E5DECED6] rounded-full text-[#7E5833] font-medium text-xs sm:text-sm mb-4">
            Testimonial
          </p>

          {/* Heading */}
          <h2 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-semibold leading-snug text-black mb-8 sm:mb-10 max-w-[95%] sm:max-w-[650px] md:w-[700px]">
            Expert Readings Led to Life-Changing Clarity
          </h2>

          {/* Blog Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
            {[
              {
                title:
                  "Mercury in Libra Retrograde November 2025 : Major Shifts Ahead",
                img: "/testomonial1.png",
              },
              {
                title:
                  "Evil Eye Remover Retrograde November 2025 : Major Shifts Ahead",
                img: "/testimonial1.jpg",
              },
              {
                title:
                  "Mercury in Libra Retrograde November 2025 : Major Shifts Ahead",
                img: "/testomonial1.png",
              },
            ].map((card, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.03 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-xl shadow-md overflow-hidden"
              >
                <Image
                  src={card.img}
                  alt={card.title}
                  width={400}
                  height={250}
                  unoptimized
                  className="object-cover w-full h-[180px] sm:h-[200px] md:h-[220px]"
                />
                <div className="p-4 sm:p-5">
                  <p className="text-[#4A3A28] font-medium text-[14px] sm:text-[15px] leading-snug mb-2">
                    {card.title}
                  </p>
                  <p className="text-[#7E5833] text-[11px] sm:text-xs">
                    29 November 2025
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
