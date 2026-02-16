"use client";
import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";

const AboutSection = () => {
  return (
    <section className="relative flex flex-col lg:flex-row items-center justify-between px-4 sm:px-6 md:px-8 lg:px-20 py-9 sm:py-9 md:py-24 lg:py-32 overflow-hidden bg-white max-sm:mt-9">
      {/* Left Side Text */}
      <div className="w-full lg:w-1/2 lg:pr-12 mb-6 lg:mb-0">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className="text-center lg:text-left"
        >
          <p className="inline-block px-4 py-2 sm:px-5 sm:py-2 bg-[#E5DECED6] rounded-full text-[#7E5833] font-semibold mb-4 sm:mb-6 tracking-wide text-sm sm:text-base">
            ABOUT US
          </p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-[40px] font-[Helvetica Neue] leading-[120%] text-black font-medium mb-4 sm:mb-6 max-w-2xl mx-auto lg:mx-0">
            Blending ancient wisdom with <br className="hidden sm:block" /> modern convenience
          </h2>
          <p className="text-[#5C4B3A] text-base sm:text-lg leading-relaxed max-w-2xl mx-auto lg:mx-0">
            We are dedicated to fusing the profound insights of ancient celestial wisdom with the seamless accessibility
            of modern technology. Our platform translates the complex, timeless language of the stars into clear,
            relevant, and actionable guidance for your everyday life. We honor the deep tradition of astrology while
            empowering you to navigate your modern journey with clarity, confidence, and cosmic insight—ancient
            knowledge, delivered instantly.
          </p>
        </motion.div>
      </div>

      {/* Right Side Chakra Image */}
      <div className="relative w-full lg:w-1/2 flex justify-center lg:justify-end items-center ">

        {/* Background circular design */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.3, scale: 1 }}
          transition={{ duration: 1.5 }}
          className="absolute lg:right-[20%] w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] md:w-[500px] md:h-[500px] lg:w-[600px] lg:h-[600px]  "
        >
          <Image
            src="/aboutBg.png"
            alt="Astro Background"
            fill
            className="object-contain opacity-30"
            priority
          />
        </motion.div>

        {/* Spinning Chakra */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
          className="relative z-10 w-[450px] h-[450px] sm:w-[300px] sm:h-[300px] md:w-[350px] md:h-[350px] lg:w-[500px] lg:h-[500px] lg:right-[15%] "
        >
          <Image
            src="/about.png"
            alt="Astro Chakra"
            fill
            className="object-contain drop-shadow-2xl"
            priority
          />
        </motion.div>
      </div>
    </section>
  );
};

export default function About() {
  return (
    <div className="min-h-screen  m-auto  bg-white overflow-hidden ">
      <AboutSection />
    </div>
  );
}