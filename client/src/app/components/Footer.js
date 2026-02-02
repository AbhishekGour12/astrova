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
import { useSelector } from "react-redux";
import {useRouter} from "next/navigation"
export default function Footer() {
  const router = useRouter()
  // You can pass user as a prop or get it f
  // rom context
  const user = useSelector((state) => state.auth.user); // Replace with your actual user state
const chats = () => {
  router.push("/astrologers?service=CHAT");
  
};

const calls = () => {
  router.push("/astrologers?service=CALL");
  
};

const meet = () => {
  router.push("/astrologers?service=MEET");
  
};
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
            <div className="mt-4">
              <Link 
                href="/AstrologerOnboarding" 
                className="text-sm hover:underline font-medium"
              >
                Register as Astrologer
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4 text-[15px] uppercase tracking-wide">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li className="border-b pb-3 border-white/30">
                <Link href="/" className="hover:underline">Home</Link>
              </li>
              <li className="border-b pb-3 border-white/30">
                <Link href="/ProductsPage" className="hover:underline">Products</Link>
              </li>
              <li className="border-b pb-3 border-white/30">
                <div className="hover:underline hover:cursor-pointer" onClick={chats}>Chats</div>
              </li>
              <li className={`border-b pb-3 border-white/30 ${user ? "hover:cursor-pointer" : "hover:cursor-not-allowed"}`}>
                <Link 
                  href="/Orders" 
                  className={`hover:underline ${user ? "" : "pointer-events-none opacity-70"}`}
                >
                  MyOrders
                </Link>
              </li>
              <li className="border-b pb-3 border-white/30">
                <div  className="hover:cursor-pointer hover:underline " onClick={calls}>Calls</div>
              </li>
              <li className="border-b pb-3 border-white/30">
                <Link href="/Remedy" className="hover:underline">Remedies</Link>
              </li>
              <li className="border-b pb-3 border-white/30">
                <div  className="hover:cursor-pointer hover:underline" onClick={meet}>Meet</div>
              </li>
              <li className="border-b pb-3 border-white/30">
                <Link href="/about" className="hover:underline">About</Link>
              </li>
            </ul>
          </div>

          {/* Policies & Legal */}
          <div>
            <h3 className="font-semibold mb-4 text-[15px] uppercase tracking-wide">
              Policies & Legal
            </h3>
            <ul className="space-y-2 text-sm">
              <li className="border-b pb-3 border-white/30">
                <Link href="/Contact" className="hover:underline">Contact Us</Link>
              </li>
              <li className="border-b pb-3 border-white/30">
                <Link href="/privacyPolicy" className="hover:underline">Privacy Policy</Link>
              </li>
              <li className="border-b pb-3 border-white/30">
                <Link href="/Terms&Conditions" className="hover:underline">Terms & Conditions</Link>
              </li>
              <li className="border-b pb-3 border-white/30">
                <Link href="/RefundPolicy" className="hover:underline">Refund Policy</Link>
              </li>
              <li className="border-b pb-3 border-white/30">
                <Link href="/ShippingPolicy" className="hover:underline">Shipping Policy</Link>
              </li>
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
                <span>myastrova@gmail.com</span>
              </li>
              <li className="flex items-center space-x-3">
                <FiPhone className="text-xl" />
                <span>+91 7888762191</span>
              </li>
              <li className="flex items-center space-x-3">
                <MdLocationOn className="text-xl" />
                <span>Punjab, India</span>
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