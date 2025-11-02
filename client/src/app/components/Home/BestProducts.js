"use client";
import Image from "next/image";
import { motion } from "framer-motion";

const categories = [
  "All",
  "Pendants",
  "Bracelets",
  "Anklet",
  "Rudraksha",
  "Pyrite",
  "Combos",
  "Gemstones",
];

const products = [
  {
    name: "Raw Pyrite Drop Pendant",
    price: "₹799/-",
    oldPrice: "₹999/-",
    img: "/p4.png",
  },
  {
    name: "Love Attraction Pencil Pendant",
    price: "₹699/-",
    oldPrice: "₹999/-",
    img: "/p5.png",
  },
  {
    name: "Love Attraction - Heart Pendant",
    price: "₹899/-",
    oldPrice: "₹999/-",
    img: "/p6.png",
  },
  {
    name: "Evil Eye Butterfly Pendant",
    price: "₹794/-",
    oldPrice: "₹999/-",
    img: "/p7.png",
  },
  {
    name: "Ultimate Love Pendant",
    price: "₹499/-",
    oldPrice: "₹699/-",
    img: "/p8.png",
  },
  {
    name: "Yellow Agate Heart Pendant",
    price: "₹699/-",
    oldPrice: "₹899/-",
    img: "/p9.png",
  },
  {
    name: "Gold Plated Om Pendant",
    price: "₹1099/-",
    oldPrice: "₹1499/-",
    img: "/p10.png",
  },
  {
    name: "Green Jade Pendant",
    price: "₹689/-",
    oldPrice: "₹999/-",
    img: "/p11.png",
  },
];

export default function BestProducts() {
  return (
    <section className="relative py-12 sm:py-16 lg:py-20 xl:py-24 overflow-hidden">
      {/* Chakra background on top-right - Responsive sizing */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.1 }}
        transition={{ duration: 1.5 }}
        className="absolute top-[5px] right-[5px] sm:top-[10px] sm:right-[10px] w-[60px] h-[60px] sm:w-[80px] sm:h-[80px] md:w-[100px] md:h-[100px] z-0"
      >
        <Image src="/productcakra.png" alt="chakra" fill className="object-contain" />
      </motion.div>

      {/* Section Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8 sm:mb-10">
          <p className="inline-block px-4 py-1.5 sm:px-5 sm:py-2 bg-[#E5DECED6] rounded-full text-[#7E5833] font-medium text-xs sm:text-sm mb-3 sm:mb-4">
            Products
          </p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[42px] xl:text-[48px] font-[Helvetica Neue] font-semibold text-[#000000] leading-tight">
            Our Best Products
          </h2>
        </div>

        {/* Category Filter Bar - Improved responsiveness */}
        <div className="flex flex-wrap justify-center gap-2 sm:gap-3 md:gap-4 mb-8 sm:mb-10 lg:mb-12 px-2">
          {categories.map((cat, index) => (
            <button
              key={index}
              className={`px-3 py-1.5 sm:px-4 sm:py-2 md:px-5 text-xs sm:text-sm rounded-full border border-[#B49A77] text-[#7E5833] hover:bg-[#B49A77] hover:text-[#F6F3E4] transition-all duration-300 whitespace-nowrap ${
                cat === "Pendants"
                  ? "bg-[#7E5833] text-[#F6F3E4]"
                  : "bg-transparent"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Product Cards - Improved grid for all devices */}
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 md:gap-8 lg:gap-10 px-2 sm:px-0">
          {products.map((product, index) => (
            <motion.div
              key={index}
              whileHover={{ y: -8 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="bg-white rounded-xl sm:rounded-2xl shadow-md sm:shadow-lg overflow-hidden flex flex-col p-1.5 sm:p-2"
            >
              {/* Image - Responsive height */}
              <div className="h-[140px] xs:h-[160px] sm:h-[180px] md:h-[200px] lg:h-[220px] relative">
                <Image
                  src={product.img}
                  alt={product.name}
                  fill
                  unoptimized
                  className="object-cover rounded-lg sm:rounded-xl"
                />
              </div>

              {/* Info - Responsive padding and text */}
              <div className="p-3 sm:p-4 md:p-5 lg:p-6 flex flex-col flex-grow justify-between">
                <div>
                  <h3 className="text-xs sm:text-sm md:text-[15px] font-semibold text-[#4A3A28] mb-1.5 sm:mb-2 text-center leading-tight sm:leading-normal">
                    {product.name}
                  </h3>
                  <p className="text-[#7E5833] font-semibold text-xs sm:text-sm md:text-[15px] text-center">
                    {product.price}{" "}
                    <span className="line-through text-gray-400 font-normal text-[10px] sm:text-xs md:text-[13px] ml-1 sm:ml-2 text-center">
                      {product.oldPrice}
                    </span>
                  </p>
                </div>
                <button className="mt-3 sm:mt-4 md:mt-5 w-full py-1.5 sm:py-2 text-xs sm:text-sm bg-[#7E5833] text-[#F6F3E4] rounded-full hover:bg-[#5A3E25] transition-all duration-300">
                  Add to Cart
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}