"use client";
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaYoutube,
} from "react-icons/fa";
import { MdEmail, MdLocationOn } from "react-icons/md";
import { FiPhone } from "react-icons/fi";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full bg-[#B49A77] text-white font-poppins">
      
      {/* Top Section */}
      <div className="py-10 px-6 md:px-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10">

          {/* Brand Info */}
          <div>
            <h3 className="font-semibold mb-4 text-[18px] uppercase tracking-wide">
              MyAstrova
            </h3>
            <p className="text-sm leading-relaxed text-white/90">
              Personalized astrology readings, celestial products, and expert consultation services tailored to your life journey.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4 text-[15px] uppercase tracking-wide">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              {[
                "Home",
                "Products",
                "Horoscope",
                "Talk to Astrologer",
                "Book Consultation",
              ].map((item, index) => (
                <li key={index}>
                  <Link href="#" className="hover:underline">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Astrology Services */}
          <div>
            <h3 className="font-semibold mb-4 text-[15px] uppercase tracking-wide">
              Services
            </h3>
            <ul className="space-y-2 text-sm">
              {[
                "Kundli Matching",
                "Gemstone Recommendation",
                "Numerology Report",
                "Vastu Consultation",
                "Daily Zodiac Predictions",
              ].map((item, index) => (
                <li key={index} className="hover:underline cursor-pointer">
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold mb-4 text-[15px] uppercase tracking-wide">
              Contact Us
            </h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center space-x-3">
                <MdEmail className="text-xl" />
                <span>support@myastrova.com</span>
              </li>
              <li className="flex items-center space-x-3">
                <FiPhone className="text-xl" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center space-x-3">
                <MdLocationOn className="text-xl" />
                <span>New Delhi, India</span>
              </li>
            </ul>

            {/* Social Icons */}
            <div className="flex space-x-4 mt-5">
              {[
                { Icon: FaFacebookF, color: "text-blue-600" },
                { Icon: FaInstagram, color: "text-pink-600" },
                { Icon: FaLinkedinIn, color: "text-blue-500" },
                { Icon: FaYoutube, color: "text-red-600" },
              ].map((social, index) => (
                <a key={index} href="#" className="hover:opacity-90">
                  <social.Icon
                    className={`${social.color} bg-white rounded-full p-1 w-7 h-7`}
                  />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="bg-[#a48b6a] py-4 text-center text-[13px] sm:text-[14px] text-white/95">
        © {new Date().getFullYear()}{" "}
        <span className="font-semibold">MYASTROVA</span> — All Rights Reserved.
      </div>
    </footer>
  );
}
