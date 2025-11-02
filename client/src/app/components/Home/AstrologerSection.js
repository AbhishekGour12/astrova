"use client";
import Image from "next/image";
import { FaLanguage, FaUserGraduate, FaRegClock } from "react-icons/fa";
import { HiOutlineStatusOnline, HiOutlineStatusOffline } from "react-icons/hi";

export default function ComingSoonSection() {
  const astrologers = [
    {
      name: "Tarot Prithviii",
      lang: "Hindi",
      exp: "1 Years",
      skill: "Tarot Reading",
      rate: "₹12/Min",
      actualRate: "₹30/Min",
      flat: "FLAT DEAL - ₹12/Min",
      status: "Offline",
      img: "/astrologer.png",
    },
    {
      name: "Tarot Shivansh",
      lang: "Hindi",
      exp: "1 Years",
      skill: "Tarot Reading",
      rate: "₹15/Min",
      actualRate: "₹35/Min",
      flat: "FLAT DEAL - ₹15/Min",
      status: "Online",
      img: "/astrloger3.png",
    },
    {
      name: "Tarot Dhamru",
      lang: "Hindi",
      exp: "1 Years",
      skill: "Tarot Reading",
      rate: "₹18/Min",
      actualRate: "₹40/Min",
      flat: "FLAT DEAL - ₹18/Min",
      status: "Offline",
      img: "/pandit3.png",
    },
  ];

  return (
    <section className="relative bg-white mt-[10%] md:py-28 overflow-hidden max-md:mt-[60%]">
      {/* Decorative Backgrounds */}
      <div className="absolute top-30 w-[500px] opacity-5 -z-0 left-[-100px]">
        <Image src="/productstar.png" alt="Left Star" width={500} height={500} />
      </div>
      <div className="absolute right-[-50px] top-[50px] w-[250px] opacity-50 -z-0">
        <Image src="/star.png" alt="Right Star" width={250} height={250} />
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-12">
          <div>
            <p className="inline-block px-4 py-1 bg-[#E5DECED6] text-[#7E5833] rounded-full text-sm font-medium mb-3">
              Coming Soon
            </p>
            <h2 className="text-3xl  max-md:text-lg font-semibold leading-snug text-black max-w-2xl">
              Soon, you’ll be able to connect with a network of expert astrologers
              for personalized guidance.
            </h2>
          </div>
          <button className="mt-6 md:mt-0 px-6 py-2 bg-[#E5DECED6] text-[#7E5833] rounded-md font-medium hover:bg-[#d8cfbb] transition">
            Notify Me
          </button>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {astrologers.map((astro, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition bg-white overflow-hidden z-0 "
            >
              {/* Upper Section */}
              <div className="flex items-center p-6 border-b border-gray-200">
                <div className="w-20 h-20 rounded-full overflow-hidden flex-shrink-0 ">
                  <Image
                    src={astro.img}
                    alt={astro.name}
                    width={100}
                    height={100}
                   
                    className="object-cover  w-[100%] h-[100%]"
                  />
                </div>
                <div className="ml-5">
                  <h3 className="text-[#7E5833] font-semibold text-lg mb-1">
                    {astro.name}
                  </h3>
                  <div className="text-sm text-gray-700 space-y-1">
                    <p className="flex items-center space-x-2">
                      <FaLanguage /> <span>{astro.lang}</span>
                    </p>
                    <p className="flex items-center space-x-2">
                      <FaUserGraduate /> <span>{astro.exp}</span>
                    </p>
                    <p className="flex items-center space-x-2">
                      <FaRegClock /> <span>{astro.skill}</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Lower Section */}
              <div className="flex items-center justify-between px-6 py-3 text-[#7E5833] text-sm">
                <div>
                  <p>
                    <span className="font-semibold">{astro.rate}</span>{" "}
                    <span className="line-through text-gray-400 text-xs">
                      {astro.actualRate}
                    </span>
                  </p>
                  <p className="text-xs font-medium">{astro.flat}</p>
                </div>

                {astro.status === "Online" ? (
                  <span className="flex items-center text-green-700 text-xs font-medium border border-green-400 rounded-md px-2 py-[2px]">
                    <HiOutlineStatusOnline className="mr-1" /> Online
                  </span>
                ) : (
                  <span className="flex items-center text-gray-500 text-xs font-medium border border-gray-300 rounded-md px-2 py-[2px]">
                    <HiOutlineStatusOffline className="mr-1" /> Offline
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
