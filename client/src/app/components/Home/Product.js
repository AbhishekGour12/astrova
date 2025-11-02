"use client";
import Image from "next/image";
import { motion } from "framer-motion";

const products = [
  {
    title: "Gemstone Consultation",
    desc: "Starts at INR 79 Only",
    img: "./p1.png",
  },
  {
    title: "Rudraksh Consultation",
    desc: "Starts at INR 79 Only",
    img: "./p2.png",
  },
  {
    title: "Palmistry Products",
    desc: "Starts at INR 79 Only",
    img: "./p3.png",
  },
  {
    title: "Kundli Matching",
    desc: "Starts at INR 199 Only",
    img: "./p2.png",
  },
];

export default function ProductSection() {
  return (
    <section className="relative bg-[#B49A77] text-white py-8 sm:py-12 md:py-16 lg:py-20 xl:py-24 overflow-hidden">
      {/* Background Chakra (center top) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.2 }}
        transition={{ duration: 1.5 }}
        className="absolute top-[-100px] xs:top-[-150px] sm:top-[-200px] md:top-[-250px] lg:top-[-300px] xl:top-[-350px] left-1/2 -translate-x-1/2 w-[250px] h-[200px] xs:w-[300px] xs:h-[250px] sm:w-[400px] sm:h-[350px] md:w-[500px] md:h-[450px] lg:w-[700px] lg:h-[600px] xl:w-[900px] xl:h-[800px] opacity-10 z-0"
      >
        <Image src="/productcakra.png" alt="chakra" fill className="object-contain" />
      </motion.div>

      {/* Star Design (bottom-left corner) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.2 }}
        transition={{ duration: 1.5, delay: 0.5 }}
        className="absolute bottom-[15px] left-[10px] xs:bottom-[20px] xs:left-[15px] sm:bottom-[25px] sm:left-[25px] md:bottom-[35px] md:left-[50px] lg:bottom-[45px] lg:left-[75px] xl:bottom-[60px] xl:left-[100px] w-[40px] h-[40px] xs:w-[50px] xs:h-[50px] sm:w-[60px] sm:h-[60px] md:w-[70px] md:h-[70px] lg:w-[85px] lg:h-[85px] xl:w-[100px] xl:h-[100px] opacity-10 z-0"
      >
        <Image src="/productstar.png" alt="Star Design" fill className="object-contain" />
      </motion.div>

      {/* Content Wrapper */}
      <div className="relative z-10 max-w-7xl mx-auto px-3 xs:px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12">
        {/* Header Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 sm:mb-8 md:mb-10 lg:mb-12">
          <h2
            className="text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-[36px] xl:text-[48px] font-[Helvetica Neue] font-normal text-[#F6F3E4] leading-tight sm:leading-snug mb-4 md:mb-0 text-center md:text-left"
            style={{ lineHeight: "1.3" }}
          >
            Blending ancient wisdom with <br className="hidden xs:block" /> modern convenience
          </h2>
          <button className="px-4 py-2 xs:px-5 xs:py-2.5 sm:px-6 sm:py-3 bg-[#F6F3E4] text-[#725E43] rounded-lg shadow-md hover:bg-[#E8E3CF] transition-all duration-300 text-xs xs:text-sm sm:text-base font-medium whitespace-nowrap self-center md:self-auto w-fit">
            View All Products
          </button>
        </div>

        {/* Product Cards */}
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 xs:gap-4 sm:gap-5 md:gap-6 lg:gap-7 xl:gap-8">
          {products.map((product, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="bg-white text-[#725E43] rounded-lg xs:rounded-xl sm:rounded-2xl shadow-lg overflow-hidden flex flex-col hover:shadow-xl transition-all duration-300"
            >
              <div className="h-[120px] xs:h-[130px] sm:h-[150px] md:h-[170px] lg:h-[190px] xl:h-[200px] relative">
                <Image
                  src={product.img}
                  alt={product.title}
                  fill
                  unoptimized
                  className="object-cover"
                />
              </div>
              <div className="p-3 xs:p-4 sm:p-5 md:p-6 flex flex-col justify-between flex-1">
                <div className="mb-2 xs:mb-3 sm:mb-4">
                  <h3 className="text-sm xs:text-base sm:text-lg font-semibold mb-1 xs:mb-2 line-clamp-2 leading-tight">
                    {product.title}
                  </h3>
                  <p className="text-xs xs:text-sm opacity-80">{product.desc}</p>
                </div>
                <button className="w-fit px-2 py-1 xs:px-3 xs:py-1.5 sm:px-4 sm:py-2 bg-[#E5DECED6] text-[#725E43] rounded-full text-xs xs:text-sm shadow hover:bg-[#E8E3CF] transition-all duration-300">
                  View Products ➜
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}