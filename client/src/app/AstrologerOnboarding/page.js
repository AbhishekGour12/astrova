// app/astrologer-onboarding/page.jsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FaUser,
  FaCertificate,
  FaFileAlt,
  FaWallet,
  FaCheckCircle,
  FaEnvelope,
  FaLock,
  FaArrowRight,
  FaPhone,
  FaComments,
  FaChartLine,
  FaShieldAlt,
  FaStar,
  FaClock,
  FaChevronRight,
  FaRegHandshake
} from "react-icons/fa";

const sacredEarthTheme = {
  colors: {
    bg: '#F7F3E9',
    bgSecondary: '#ECE5D3',
    text: '#003D33',
    textSecondary: '#00695C',
    accent: '#C06014',
    accentHover: '#D47C3A',
    cardBg: '#FFFFFF',
    border: '#B2C5B2',
    shadow: 'rgba(192, 96, 20, 0.2)',
    gradient: 'linear-gradient(135deg, #F7F3E9 0%, #ECE5D3 100%)'
  },
  fonts: {
    heading: 'Cagliostro, serif',
    body: 'Lora, serif'
  }
};

export default function AstrologerOnboardingPage() {
  const router = useRouter();
  
  const [isVisible, setIsVisible] = useState(false);

  const steps = [
    {
      title: "Register",
      description: "Fill basic details",
      icon: <FaUser className="text-white" size={20} />,
      color: "#C06014",
    },
    {
      title: "Upload Docs",
      description: "Certificates & ID",
      icon: <FaCertificate className="text-white" size={20} />,
      color: "#00695C",
    },
    {
      title: "Bank Info",
      description: "For payouts",
      icon: <FaWallet className="text-white" size={20} />,
      color: "#003D33",
    },
    {
      title: "Review",
      description: "By admin team",
      icon: <FaShieldAlt className="text-white" size={20} />,
      color: "#C06014",
    },
    {
      title: "Approval",
      description: "Get credentials",
      icon: <FaCheckCircle className="text-white" size={20} />,
      color: "#00695C",
    },
  ];

  const features = [
    {
      icon: <FaPhone size={24} />,
      title: "Audio/Video Calls",
    },
    {
      icon: <FaComments size={24} />,
      title: "Chat Consultations",
    },
    {
      icon: <FaChartLine size={24} />,
      title: "Earnings Dashboard",
    },
    {
      icon: <FaRegHandshake size={24} />,
      title: "Client Management",
    },
  ];

  const requirements = [
    "Valid ID Proof (Aadhaar/PAN)",
    "Astrology Certification",
    "Bank Account Details",
    "Good Communication Skills",
  ];

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleGetStarted = () => {
    router.push("/Astrologer/register");
  };

  return (
    <div 
      className="min-h-screen pt-[100px]"
      style={{ 
        backgroundColor: sacredEarthTheme.colors.bg,
        fontFamily: sacredEarthTheme.fonts.body
      }}
    >
      {/* Hero Section */}
      <div 
        className="relative py-12 px-4 sm:px-6 lg:px-8"
        style={{ 
          background: sacredEarthTheme.colors.gradient,
          borderBottom: `2px solid ${sacredEarthTheme.colors.border}`
        }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <h1 
              className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 leading-tight"
              style={{ 
                color: sacredEarthTheme.colors.text,
                fontFamily: sacredEarthTheme.fonts.heading
              }}
            >
              Join Our Team of <br className="hidden sm:block" />
              <span style={{ color: sacredEarthTheme.colors.accent }}>Professional Astrologers</span>
            </h1>
            
            <p 
              className="text-lg sm:text-xl mb-8 max-w-2xl mx-auto"
              style={{ color: sacredEarthTheme.colors.textSecondary }}
            >
              Share your wisdom, transform lives, and build your practice with us
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={handleGetStarted}
                className="group px-8 py-4 rounded-full text-lg font-bold shadow-lg transition-all duration-300 transform hover:-translate-y-1 flex items-center gap-3"
                style={{
                  backgroundColor: sacredEarthTheme.colors.accent,
                  color: '#FFFFFF',
                }}
                onMouseEnter={(e) => e.target.style.backgroundColor = sacredEarthTheme.colors.accentHover}
                onMouseLeave={(e) => e.target.style.backgroundColor = sacredEarthTheme.colors.accent}
              >
                Start Registration
                <FaArrowRight className="group-hover:translate-x-2 transition-transform" />
              </button>
              
              <Link 
                href="/Astrologer/login"
                className="px-6 py-4 rounded-full text-lg font-medium transition-colors"
                style={{
                  border: `2px solid ${sacredEarthTheme.colors.accent}`,
                  color: sacredEarthTheme.colors.accent,
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = sacredEarthTheme.colors.accent;
                  e.target.style.color = '#FFFFFF';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.color = sacredEarthTheme.colors.accent;
                }}
              >
                Already Registered?
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 
              className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4"
              style={{ 
                color: sacredEarthTheme.colors.text,
                fontFamily: sacredEarthTheme.fonts.heading
              }}
            >
              Simple Registration Process
            </h2>
            <p 
              className="text-base sm:text-lg"
              style={{ color: sacredEarthTheme.colors.textSecondary }}
            >
              Complete in just 5 easy steps
            </p>
          </div>

          {/* Steps Timeline */}
          <div className="relative">
            {/* Connecting Line */}
            <div 
              className="absolute left-0 right-0 top-8 h-1 hidden sm:block"
              style={{ backgroundColor: sacredEarthTheme.colors.border }}
            ></div>
            
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-6 sm:gap-4">
              {steps.map((step, index) => (
                <div 
                  key={index}
                  className={`flex flex-col items-center text-center transition-all duration-500 ${
                    isVisible ? 'opacity-100' : 'opacity-0'
                  }`}
                  style={{ transitionDelay: `${index * 200}ms` }}
                >
                  {/* Step Circle */}
                  <div 
                    className="w-16 h-16 rounded-full flex items-center justify-center mb-4 relative z-10 shadow-lg"
                    style={{ backgroundColor: step.color }}
                  >
                    {step.icon}
                    <div className="absolute -top-2 -right-2 bg-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold"
                      style={{ 
                        border: `2px solid ${step.color}`,
                        color: sacredEarthTheme.colors.text
                      }}
                    >
                      {index + 1}
                    </div>
                  </div>
                  
                  {/* Step Content */}
                  <div>
                    <h3 
                      className="font-bold text-lg mb-1"
                      style={{ color: sacredEarthTheme.colors.text }}
                    >
                      {step.title}
                    </h3>
                    <p 
                      className="text-sm"
                      style={{ color: sacredEarthTheme.colors.textSecondary }}
                    >
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Detailed Steps */}
          <div className="mt-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 
                  className="text-xl font-bold mb-6"
                  style={{ color: sacredEarthTheme.colors.text }}
                >
                  What You'll Need
                </h3>
                <ul className="space-y-4">
                  {requirements.map((req, index) => (
                    <li 
                      key={index}
                      className="flex items-start gap-3"
                      style={{ color: sacredEarthTheme.colors.text }}
                    >
                      <FaCheckCircle 
                        className="mt-1 flex-shrink-0"
                        style={{ color: sacredEarthTheme.colors.accent }}
                      />
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 
                  className="text-xl font-bold mb-6"
                  style={{ color: sacredEarthTheme.colors.text }}
                >
                  After Approval
                </h3>
                <div 
                  className="p-6 rounded-2xl"
                  style={{ 
                    backgroundColor: sacredEarthTheme.colors.bgSecondary,
                    border: `1px solid ${sacredEarthTheme.colors.border}`
                  }}
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div 
                      className="w-12 h-12 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: sacredEarthTheme.colors.accent }}
                    >
                      <FaLock className="text-white" size={20} />
                    </div>
                    <div>
                      <h4 
                        className="font-bold"
                        style={{ color: sacredEarthTheme.colors.text }}
                      >
                        Secure Access
                      </h4>
                      <p 
                        className="text-sm"
                        style={{ color: sacredEarthTheme.colors.textSecondary }}
                      >
                        Password sent to your registered email
                      </p>
                    </div>
                  </div>
                  <p 
                    className="text-sm"
                    style={{ color: sacredEarthTheme.colors.text }}
                  >
                    Once approved by admin, you'll receive login credentials via email to access your professional dashboard.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="py-12 px-4 sm:px-6 lg:px-8"
        style={{ 
          backgroundColor: sacredEarthTheme.colors.bgSecondary,
          borderTop: `2px solid ${sacredEarthTheme.colors.border}`,
          borderBottom: `2px solid ${sacredEarthTheme.colors.border}`
        }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 
              className="text-2xl sm:text-3xl font-bold mb-4"
              style={{ 
                color: sacredEarthTheme.colors.text,
                fontFamily: sacredEarthTheme.fonts.heading
              }}
            >
              Platform Features
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="text-center p-6 rounded-xl transition-all duration-300 hover:transform hover:-translate-y-2"
                style={{ 
                  backgroundColor: sacredEarthTheme.colors.cardBg,
                  border: `1px solid ${sacredEarthTheme.colors.border}`,
                  boxShadow: `0 4px 12px ${sacredEarthTheme.colors.shadow}`
                }}
              >
                <div 
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ 
                    backgroundColor: sacredEarthTheme.colors.bg,
                    color: sacredEarthTheme.colors.accent
                  }}
                >
                  {feature.icon}
                </div>
                <h3 
                  className="font-bold text-lg"
                  style={{ color: sacredEarthTheme.colors.text }}
                >
                  {feature.title}
                </h3>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div 
            className="rounded-2xl p-8 sm:p-12 text-center"
            style={{ 
              background: `linear-gradient(135deg, ${sacredEarthTheme.colors.accent} 0%, ${sacredEarthTheme.colors.accentHover} 100%)`
            }}
          >
            <h2 
              className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-6 text-white"
              style={{ fontFamily: sacredEarthTheme.fonts.heading }}
            >
              Ready to Begin Your Journey?
            </h2>
            
            <p className="text-lg mb-8 text-amber-100 max-w-2xl mx-auto">
              Join our community of professional astrologers and start transforming lives today.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={handleGetStarted}
                className="group bg-white text-amber-700 hover:bg-amber-50 px-8 py-4 rounded-full text-lg font-bold shadow-xl transform hover:-translate-y-1 transition-all duration-300 flex items-center gap-3"
              >
                Register Now
                <FaArrowRight className="group-hover:translate-x-2 transition-transform" />
              </button>
              
              <div className="text-white text-sm">
                Takes only 10-15 minutes to complete
              </div>
            </div>

            {/* Stats */}
            <div className="mt-12 pt-8 border-t border-white/20">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">24-48</div>
                  <div className="text-amber-100 text-sm">Hours Approval</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">1000+</div>
                  <div className="text-amber-100 text-sm">Active Astrologers</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white">₹25L+</div>
                  <div className="text-amber-100 text-sm">Monthly Payouts</div>
                </div>
              </div>
            </div>
          </div>

          {/* Support Info */}
          <div className="mt-12 text-center">
            <p 
              className="text-sm"
              style={{ color: sacredEarthTheme.colors.textSecondary }}
            >
              Need help? Contact our support team at{" "}
              <a 
                href="mailto:support@astroconnect.com" 
                className="font-bold hover:underline"
                style={{ color: sacredEarthTheme.colors.accent }}
              >
                support@astroconnect.com
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Quick Info */}
      <div className="py-8 px-4 border-t"
        style={{ 
          borderColor: sacredEarthTheme.colors.border,
          backgroundColor: sacredEarthTheme.colors.bgSecondary
        }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-center sm:text-left">
              <p 
                className="font-bold text-sm"
                style={{ color: sacredEarthTheme.colors.text }}
              >
                Simple & Secure Registration
              </p>
              <p 
                className="text-xs"
                style={{ color: sacredEarthTheme.colors.textSecondary }}
              >
                All data is encrypted and protected
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <FaShieldAlt style={{ color: sacredEarthTheme.colors.accent }} />
              <span 
                className="text-sm font-bold"
                style={{ color: sacredEarthTheme.colors.text }}
              >
                100% Secure Platform
              </span>
            </div>
            
            <div>
              <Link 
                href="/Astrologer/login"
                className="flex items-center gap-2 text-sm font-medium hover:underline"
                style={{ color: sacredEarthTheme.colors.accent }}
              >
                Sign In Here
                <FaChevronRight size={12} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}