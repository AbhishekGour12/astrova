"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import {
  FiSun,
  FiMoon,
  FiMenu,
  FiX,
  FiUser,
  FiStar,
} from "react-icons/fi";
import { LuSparkles } from "react-icons/lu"; // ✅ Sparkles icon

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "Home", href: "#", icon: <FiStar size={14} /> },
    { name: "Products", href: "#", icon: <LuSparkles size={14} /> },
    { name: "Consultations", href: "#", icon: <FiUser size={14} /> },
    { name: "About", href: "#", icon: <FiSun size={14} /> },
    { name: "Dashboard", href: "#", icon: <FiMoon size={14} /> },
  ];

  return (
    <header
  
  className={`fixed top-0 left-0 right-0 z-9999
    transition-all duration-300
    ${isScrolled ? "bg-[#ECE5D3]/90 backdrop-blur-lg shadow-lg" : "bg-[#ECE5D3]"}
    py-5`}


    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo Section */}
          <div className="flex items-center space-x-3 group cursor-pointer">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-12 h-12 bg-linear-to-br from-[#8B4513] to-[#D2691E] rounded-2xl flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-500 shadow-lg">
                  <LuSparkles className="text-white" size={20} />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#CD5C5C] rounded-full animate-pulse"></div>
              </div>
              <div className="flex flex-col">
                <h1 className="text-3xl font-bold text-[#8B4513] tracking-tight">
                  Astrova
                </h1>
                <p className="text-xs text-[#A0522D] font-light italic tracking-wide">
                  Your Cosmic Companion
                </p>
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1 bg-[#F2ECDF] rounded-2xl px-4 py-2">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all duration-300 hover:bg-[#ECE5D3] hover:scale-105 group/navlink"
                style={{ color: "#8B4513", fontSize: "15px" }}
              >
                <span className="text-[#D2691E] group-hover/navlink:scale-110 transition-transform duration-300">
                  {link.icon}
                </span>
                <span>{link.name}</span>
              </a>
            ))}
          </nav>

          {/* Right Section */}
          <div className="flex items-center space-x-3">
            {/* Login/Signup - Desktop */}
            <div className="hidden md:flex items-center space-x-3">
                <Link href = "/Login"> 
              <button
                className="px-6 py-2.5 font-medium transition-all duration-300 hover:scale-105 border-2 border-[#8B4513] rounded-xl hover:bg-[#ECE5D3] hover:border-[#A0522D] hover:cursor-pointer"
                style={{ color: "#8B4513", fontSize: "15px" }}
              >
                Login
              </button>
              </Link>
              <Link href = "/Signup"> 
              <button
                className="px-6 py-2.5 font-semibold transition-all duration-300 hover:scale-105 hover:shadow-xl transform hover:-translate-y-0.5 rounded-xl flex items-center space-x-2"
                style={{
                  background: "linear-gradient(135deg, #8B4513 0%, #D2691E 100%)",
                  fontSize: "15px",
                  color: "#FFFFFF",
                }}
              >
                <LuSparkles size={16} />
                <span>Sign Up Free</span>
              </button>
              </Link>
            </div>

            {/* Mobile Buttons */}
            <button
              className="md:hidden p-3 bg-[#F2ECDF] rounded-xl border border-[#8B4513] hover:bg-[#ECE5D3] transition-all duration-300"
              style={{ color: "#8B4513" }}
            >
              <FiUser size={20} />
            </button>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-3 bg-[#F2ECDF] rounded-xl border border-[#8B4513] hover:bg-[#ECE5D3] transition-all duration-300"
              style={{ color: "#8B4513" }}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <FiX size={20} /> : <FiMenu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div
            className="md:hidden absolute top-full left-0 right-0 shadow-2xl border-t bg-[#F2ECDF] border-[#ECE5D3]"
            style={{ animation: "slideDown 0.3s ease-out" }}
          >
            <div className="px-4 py-6 space-y-2">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="flex items-center space-x-3 py-4 px-4 rounded-xl font-medium transition-all duration-300 hover:bg-[#ECE5D3] hover:scale-105 group"
                  style={{ color: "#8B4513", fontSize: "16px" }}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className="text-[#D2691E] group-hover:scale-110 transition-transform duration-300">
                    {link.icon}
                  </span>
                  <span>{link.name}</span>
                </a>
              ))}
              <div
                className="pt-4 border-t space-y-3 mt-4"
                style={{ borderColor: "#D2691E" }}
              >
                <button
                  className="w-full flex items-center justify-center space-x-2 py-4 font-medium rounded-xl transition-all duration-300 hover:bg-[#ECE5D3] hover:scale-105 border-2 border-[#8B4513] hover:border-[#A0522D]"
                  style={{ color: "#8B4513", fontSize: "16px" }}
                >
                  <FiUser size={18} />
                  <span>Login</span>
                </button>
                <button
                  className="w-full flex items-center justify-center space-x-2 py-4 font-semibold rounded-xl transition-all duration-300 hover:scale-105 hover:shadow-xl"
                  style={{
                    background:
                      "linear-gradient(135deg, #8B4513 0%, #D2691E 100%)",
                    fontSize: "16px",
                    color: "#FFFFFF",
                  }}
                >
                  <LuSparkles size={18} />
                  <span>Sign Up Free</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </header>
  );
};

export default Header;
