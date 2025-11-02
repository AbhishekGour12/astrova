"use client";
import { motion } from "framer-motion";
import {
  FaUserCheck,
  FaClipboardList,
  FaCalendarAlt,
  FaPhoneAlt,
} from "react-icons/fa";
import Image from "next/image";

export default function ConsultationSection() {
  return (
    <div className="relative z-[5] mt-[100px] overflow-visible h-[550px]">
      <section className="relative bg-transparent text-white overflow-visible z-[10] min-h-[650px] md:min-h-[750px] lg:min-h-[850px]">
        {/* ================= BACKGROUND ================= */}
        <div className="absolute inset-0 -z-10">
          <Image
            src="/consultantbg.jpg"
            alt="Background"
            height={100}
            width={100}
            className="object-cover brightness-[0.35] h-[550px] w-[100%] max-md:h-[100%] "
          />
        </div>

        {/* ================= CHAKRA OVERLAY ================= */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.15 }}
          transition={{ duration: 1.5 }}
          className="absolute top-[-100px] md:top-[-250px] left-1/2 -translate-x-1/2 w-[400px] h-[100px] md:w-[900px] md:h-[900px] z-[0]"
        >
          <Image
            src="/bgCircle.png"
            alt="chakra"
            fill
            className="object-contain pointer-events-none h-[600px] w-[60%]"
          />
        </motion.div>

        {/* ================= MAIN CONTAINER ================= */}
        <div className="relative pt-12  max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between px-4 sm:px-6 md:px-12 z-[5] overflow-visible">
          {/* ================= LEFT CONTENT ================= */}
          <div className="w-full md:w-1/2 lg:w-2/5 space-y-6 z-[10] text-center md:text-left">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 mx-auto md:mx-0 w-fit pb-2">
              Book a Consultation
            </h2>

            <p className="text-[#EAEAEA] text-base sm:text-lg leading-relaxed max-w-md mx-auto md:mx-0">
              Connect with a top astrologer in minutes! Simply choose your
              expert, select a convenient time, provide your birth details, and
              start your insightful consultation via call, chat, or detailed
              report.
            </p>

            {/* ================= STEPS ================= */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 pt-8 text-center justify-items-center">
              <div className="flex flex-col items-center">
                <FaUserCheck className="text-2xl sm:text-3xl mb-2 text-[#E8D4B4]" />
                <p className="text-xs sm:text-sm font-medium">Select Expert</p>
              </div>
              <div className="flex flex-col items-center">
                <FaClipboardList className="text-2xl sm:text-3xl mb-2 text-[#E8D4B4]" />
                <p className="text-xs sm:text-sm font-medium">Choose Type</p>
              </div>
              <div className="flex flex-col items-center">
                <FaCalendarAlt className="text-2xl sm:text-3xl mb-2 text-[#E8D4B4]" />
                <p className="text-xs sm:text-sm font-medium">Schedule</p>
              </div>
              <div className="flex flex-col items-center">
                <FaPhoneAlt className="text-2xl sm:text-3xl mb-2 text-[#E8D4B4]" />
                <p className="text-xs sm:text-sm font-medium">Connect</p>
              </div>
            </div>

            {/* ================= BUTTON ================= */}
            <div className="pt-6 flex justify-center md:justify-start">
              <button className="px-6 sm:px-8 py-3 bg-[#F6F3E4] text-[#725E43] rounded-lg shadow-md hover:bg-[#E8E3CF] transition-all duration-300 text-sm sm:text-base font-medium">
                Book Now
              </button>
            </div>
          </div>

          {/* ================= RIGHT PANDIT IMAGE ================= */}
          <div className="relative  md:absolute md:bottom-0 md:right-0 md:w-1/2 lg:w-[55%]  flex justify-center md:justify-end overflow-visible z-[5] mt-10 md:mt-0">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="relative w-[90%] sm:w-[80%] md:w-full flex justify-end overflow-visible"
            >
              <Image
                src="/pandit2.png"
                alt="Pandit"
                width={1000}
                height={1300}
                className="
                  object-contain object-bottom drop-shadow-2xl pointer-events-none
                  w-full
                  h-full
                  md:h-[115%] lg:h-[125%] xl:h-[130%]
                  md:-translate-y-[8%] lg:-translate-y-[10%] xl:-translate-y-[12%]
                "
              />
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
