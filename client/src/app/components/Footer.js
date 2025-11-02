"use client";
import { FaFacebookF, FaInstagram, FaLinkedinIn, FaYoutube } from "react-icons/fa";
import { MdEmail, MdLocationOn } from "react-icons/md";
import { FiPhone } from "react-icons/fi";

export default function Footer() {
  return (
    <footer className="w-full mt-6">
      {/* Upper Footer Section */}
      <div className="bg-[#B49A77] text-white py-10 px-6 md:px-20">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4 text-[15px] uppercase tracking-wide">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              {["Link 1", "Link 2", "Link 3", "Link 4", "Link 5"].map((item, index) => (
                <li key={index} className="hover:underline cursor-pointer">{item}</li>
              ))}
            </ul>
          </div>

          {/* Important Links */}
          <div>
            <h3 className="font-semibold mb-4 text-[15px] uppercase tracking-wide">Important Links</h3>
            <ul className="space-y-2 text-sm">
              {["Link 1", "Link 2", "Link 3", "Link 4", "Link 5"].map((item, index) => (
                <li key={index} className="hover:underline cursor-pointer">{item}</li>
              ))}
            </ul>
          </div>

          {/* Connect Section */}
          <div>
            <h3 className="font-semibold mb-4 text-[15px] uppercase tracking-wide">Connect</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center space-x-3">
                <MdEmail className="text-lg" />
                <span>Astrova@gmail.com</span>
              </li>
              <li className="flex items-center space-x-3">
                <FiPhone className="text-lg" />
                <span>9565874586</span>
              </li>
              <li className="flex items-center space-x-3">
                <MdLocationOn className="text-lg" />
                <span>Location or Address</span>
              </li>
            </ul>

            {/* Social Icons */}
            <div className="flex space-x-4 mt-5 text-lg">
              <a href="#" className="hover:opacity-80">
                <FaFacebookF className="text-blue-600 bg-white rounded-full p-1 w-6 h-6" />
              </a>
              <a href="#" className="hover:opacity-80">
                <FaInstagram className="text-pink-600 bg-white rounded-full p-1 w-6 h-6" />
              </a>
              <a href="#" className="hover:opacity-80">
                <FaLinkedinIn className="text-blue-500 bg-white rounded-full p-1 w-6 h-6" />
              </a>
              <a href="#" className="hover:opacity-80">
                <FaYoutube className="text-red-600 bg-white rounded-full p-1 w-6 h-6" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Copyright Bar */}
      <div className="bg-white py-3 text-center text-[14px] text-black font-medium">
        Copyright © 2025 <span className="font-semibold">Astrova</span> (Powered by Astrova Services Pvt. Ltd.). All Rights Reserved
      </div>
    </footer>
  );
}
