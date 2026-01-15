"use client";
import Image from "next/image";
import { motion } from "framer-motion";

export default function PremiumProductSection() {
  return (
    <div className="relative z-[5] mb-[20px] mt-[50px] overflow-visible h-fit max-sm:mb-[0px] max-sm:mt-[150px]">
      <section className="
  relative 
  bg-transparent text-white
  pt-28 pb-32 
  overflow-visible z-[10]
  
  min-h-[600px]  /* Default height thodi kam */
  sm:min-h-[650px]
  md:min-h-[750px]
  lg:min-h-[800px]
">

        <div className="absolute inset-0 -z-10 max-sm:h-[400px] ">
          <Image
            src="/bg1.png"
            alt="Background"
            fill
            priority
            className="object-cover brightness-[0.35] "
          />
        </div>

        {/* ========== MAIN CONTENT ========== */}
        <div className=" z-10 max-w-7xl mx-auto px-3 md:px-12 text-left   ">
          {/* Badge */}
          <p className="inline-block px-5 py-2   bg-[#E5DECED6] rounded-full text-[#7E5833] font-medium text-sm  max-sm:py-1">
            Premium Product
          </p>

          {/* Heading */}
          <h2 className="text-xl sm:text-2xl md:text-4xl lg:text-[40px] leading-snug font-semibold text-white max-w-[650px] mb-20 md:mb-32">
            Expertly paired essentials: the quickest way to elevate your luck now.
          </h2>
        </div>

        {/* ========== LEFT COMBO IMAGE ========== */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="absolute  h-fit bottom-[-200px] left-[-20px] md:left-[40px] w-[55%] sm:w-[50%] md:w-[45%] lg:w-[40%] overflow-visible z-[10] max-sm:bottom-[30%] "
        >
          {/* Left Combo Image */}
          <Image
            src="/left_combo.png"
            alt="Left Combo"
            width={900}
            height={600}
            className="object-contain w-full drop-shadow-2xl mr-[100px]"
          />

          {/* Left Text */}
          <p className="absolute lg:text-2xl  max-md:left-[30%] max-md:bottom-[90%] bottom-[60%] text-3xl  left-[90%]  sm:text-lg font-medium text-white w-[200px] leading-tight max-sm:text-sm ">
            Ultimate Problem <br /> Solver Combo
          </p>
        </motion.div>

        {/* ========== RIGHT COMBO IMAGE ========== */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="absolute bottom-[-50px] right-[-40px] md:right-[40px] w-[55%] sm:w-[50%] md:w-[45%]  h-fit lg:w-[40%] overflow-vissib z-[10] max-sm:bottom-[30%] border-black"
        >
          {/* Right Combo Image */}
          <Image
            src="/rightcombo.png"
            alt="Right Combo"
            width={900}
            height={600}
            className="object-contain w-full drop-shadow-2xl"
          />

          {/* Right Text */}
          <p className="absolute bottom-[75%]  right-[25%] lg:text-2xl text-base sm:text-sm font-medium text-white text-right leading-tight max-sm:text-xs">
            Dhan Sampan Combo <br /> with Krishna Kavach
          </p>
        </motion.div>
      </section>
    </div>
  );
}
