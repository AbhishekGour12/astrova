"use client";

import { useState } from 'react';
import {
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaClock,
  FaPaperPlane,
  FaUser,
  FaStar,
  FaWhatsapp,
  FaInstagram,
  FaFacebook,
  FaTwitter,
  FaLinkedin,
  FaHeadset
} from 'react-icons/fa';
import toast from 'react-hot-toast';
import axios from 'axios';
import api from '../lib/api';

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

export default function ContactUsPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
    astrologerQuery: false
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const contactInfo = [
    {
      icon: <FaEnvelope />,
      title: 'Email Address',
      details: [
        'myastrova@gmail.com',
       
      ],
      description: 'We respond within 24 hours'
    },
    {
      icon: <FaPhone />,
      title: 'Phone Number',
      details: [
        '+91 9779113118',
        '+91 8544996977'
      ],
      description: 'Mon-Sat: 9 AM - 9 PM'
    },
    {
      icon: <FaMapMarkerAlt />,
      title: 'Office Address',
      details: [
        'MyAstrova Headquarters',
        'D1, 003,  Gardenia Gateway, Sector 75, Noida ',
        'Uttar Pradesh - 201316'
      ],
      description: 'Visit by appointment only'
    },
    {
      icon: <FaClock />,
      title: 'Working Hours',
      details: [
        'Monday - Friday: 9 AM - 9 PM',
        'Saturday: 9 AM - 6 PM',
        'Sunday: 10 AM - 4 PM'
      ],
      description: '24/7 Support for active users'
    }
  ];

  const socialLinks = [
    { icon: <FaWhatsapp />, label: 'WhatsApp', link: 'https://wa.me/919876543210', color: '#25D366' },
    { icon: <FaInstagram />, label: 'Instagram', link: 'https://www.instagram.com/my.astrova/', color: '#E4405F' },
    { icon: <FaFacebook />, label: 'Facebook', link: 'https://www.facebook.com/profile.php?id=61587116236269', color: '#1877F2' },
    
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

 // In your ContactUsPage component, update the handleSubmit function:
const handleSubmit = async (e) => {
  
  let token = localStorage.getItem("token")
  if(!token){
    toast.error("login first");
    return
  }
  setIsSubmitting(true);
  e.preventDefault();
  try {
    // Prepare form data exactly matching model
    const contactData = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      subject: formData.subject,
      message: formData.message,
      astrologerInterest: formData.astrologerQuery // Note: using astrologerQuery from form
    };
    
    // Call the API
    const response = await api.post('/contact/submit', contactData)
    
    if (response.data.success) {
      toast.success(response.data.message || 'Message sent successfully! We\'ll get back to you soon.', {
        duration: 5000,
        icon: '📨'
      });
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
        astrologerQuery: false
      });
    } else {
      toast.error(response.message || 'Failed to send message');
    }
  } catch (error) {
    console.error('Contact form error:', error);
    toast.error(error.message || 'Failed to send message. Please try again.');
  } finally {
    setIsSubmitting(false);
  }
};

  return (
    <div 
      className="min-h-screen pt-[80px] md:pt-[100px]"
      style={{ 
        background: sacredEarthTheme.colors.bg,
        fontFamily: sacredEarthTheme.fonts.body
      }}
    >
      {/* Header Section */}
      <div 
        className="relative py-10 md:py-16 px-4 sm:px-6 lg:px-8 text-center"
        style={{ 
          background: sacredEarthTheme.colors.gradient,
          borderBottom: `2px solid ${sacredEarthTheme.colors.border}`
        }}
      >
        <div className="absolute top-0 left-0 right-0 h-1" style={{ background: sacredEarthTheme.colors.accent }}></div>
        
        <div className="max-w-7xl mx-auto">
          <div className="inline-flex items-center justify-center mb-4 md:mb-6">
            <div 
              className="w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center mr-3 md:mr-4"
              style={{ background: sacredEarthTheme.colors.accent }}
            >
              <FaHeadset className="text-xl md:text-3xl text-white" />
            </div>
            <h1 
              className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight"
              style={{ 
                color: sacredEarthTheme.colors.text,
                fontFamily: sacredEarthTheme.fonts.heading
              }}
            >
              Contact MyAstrova
            </h1>
          </div>
          
          <p 
            className="text-base sm:text-lg md:text-xl max-w-3xl mx-auto mt-2 md:mt-4 px-2"
            style={{ color: sacredEarthTheme.colors.textSecondary }}
          >
            Connect with our celestial support team. Whether you're seeking guidance, 
            have questions about our services, or want to join as an astrologer, 
            we're here to help.
          </p>
          
          <div className="mt-6 md:mt-8 flex flex-wrap justify-center gap-3 md:gap-4">
            {[
              "✨ 24/7 Spiritual Support",
              "🔮 Certified Astrologers",
              "⭐ 4.9/5 Customer Rating"
            ].map((text, idx) => (
              <span 
                key={idx}
                className="px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs md:text-sm font-medium"
                style={{ 
                  background: sacredEarthTheme.colors.cardBg,
                  color: sacredEarthTheme.colors.accent,
                  border: `1px solid ${sacredEarthTheme.colors.border}`
                }}
              >
                {text}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-8 md:py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          
          {/* Left Column - Contact Form */}
          <div className="lg:col-span-2">
            <div 
              className="rounded-2xl p-5 sm:p-8 shadow-xl"
              style={{ 
                background: sacredEarthTheme.colors.cardBg,
                border: `1px solid ${sacredEarthTheme.colors.border}`,
                boxShadow: `0 10px 40px ${sacredEarthTheme.colors.shadow}`
              }}
            >
              <div className="flex items-center mb-6 md:mb-8">
                <div 
                  className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center mr-3 md:mr-4 shrink-0"
                  style={{ background: sacredEarthTheme.colors.accent }}
                >
                  <FaPaperPlane className="text-lg md:text-xl text-white" />
                </div>
                <div>
                  <h2 
                    className="text-xl md:text-2xl font-bold"
                    style={{ 
                      color: sacredEarthTheme.colors.text,
                      fontFamily: sacredEarthTheme.fonts.heading
                    }}
                  >
                    Send us a Message
                  </h2>
                  <p className="text-sm md:text-base" style={{ color: sacredEarthTheme.colors.textSecondary }}>
                    Fill out the form below and we'll get back to you promptly
                  </p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div>
                    <label className="block mb-1.5 md:mb-2 text-sm md:text-base font-medium" style={{ color: sacredEarthTheme.colors.text }}>
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaUser className="text-gray-400" />
                      </div>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        className="block w-full pl-10 pr-3 py-2.5 md:py-3 text-sm md:text-base rounded-lg border focus:outline-none focus:ring-2 focus:ring-offset-1 transition-all"
                        style={{ 
                          background: sacredEarthTheme.colors.bgSecondary,
                          borderColor: sacredEarthTheme.colors.border,
                          color: sacredEarthTheme.colors.text
                        }}
                        placeholder="Enter your full name"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block mb-1.5 md:mb-2 text-sm md:text-base font-medium" style={{ color: sacredEarthTheme.colors.text }}>
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaEnvelope className="text-gray-400" />
                      </div>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        className="block w-full pl-10 pr-3 py-2.5 md:py-3 text-sm md:text-base rounded-lg border focus:outline-none focus:ring-2 focus:ring-offset-1 transition-all"
                        style={{ 
                          background: sacredEarthTheme.colors.bgSecondary,
                          borderColor: sacredEarthTheme.colors.border,
                          color: sacredEarthTheme.colors.text
                        }}
                        placeholder="your@email.com"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div>
                    <label className="block mb-1.5 md:mb-2 text-sm md:text-base font-medium" style={{ color: sacredEarthTheme.colors.text }}>
                      Phone Number
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <FaPhone className="text-gray-400" />
                      </div>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        className="block w-full pl-10 pr-3 py-2.5 md:py-3 text-sm md:text-base rounded-lg border focus:outline-none focus:ring-2 focus:ring-offset-1 transition-all"
                        style={{ 
                          background: sacredEarthTheme.colors.bgSecondary,
                          borderColor: sacredEarthTheme.colors.border,
                          color: sacredEarthTheme.colors.text
                        }}
                        placeholder="+91 98765 43210"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block mb-1.5 md:mb-2 text-sm md:text-base font-medium" style={{ color: sacredEarthTheme.colors.text }}>
                      Subject <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="block w-full px-4 py-2.5 md:py-3 text-sm md:text-base rounded-lg border focus:outline-none focus:ring-2 focus:ring-offset-1 transition-all"
                      style={{ 
                        background: sacredEarthTheme.colors.bgSecondary,
                        borderColor: sacredEarthTheme.colors.border,
                        color: sacredEarthTheme.colors.text
                      }}
                    >
                      <option value="">Select a subject</option>
                      <option value="general">General Inquiry</option>
                      <option value="technical">Technical Support</option>
                      <option value="billing">Billing & Payments</option>
                      <option value="astrologer">Become an Astrologer</option>
                      <option value="feedback">Feedback & Suggestions</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block mb-1.5 md:mb-2 text-sm md:text-base font-medium" style={{ color: sacredEarthTheme.colors.text }}>
                    Your Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows="6"
                    className="block w-full px-4 py-3 text-sm md:text-base rounded-lg border focus:outline-none focus:ring-2 focus:ring-offset-1 transition-all resize-none"
                    style={{ 
                      background: sacredEarthTheme.colors.bgSecondary,
                      borderColor: sacredEarthTheme.colors.border,
                      color: sacredEarthTheme.colors.text
                    }}
                    placeholder="Please share your thoughts, questions, or concerns..."
                  />
                </div>

                <div className="flex items-start md:items-center">
                  <input
                    type="checkbox"
                    id="astrologerQuery"
                    name="astrologerQuery"
                    checked={formData.astrologerQuery}
                    onChange={handleChange}
                    className="mt-1 md:mt-0 h-4 w-4 rounded shrink-0"
                    style={{ 
                      borderColor: sacredEarthTheme.colors.border,
                      color: sacredEarthTheme.colors.accent
                    }}
                  />
                  <label 
                    htmlFor="astrologerQuery" 
                    className="ml-2 text-sm leading-tight md:leading-normal"
                    style={{ color: sacredEarthTheme.colors.textSecondary }}
                  >
                    I'm interested in joining as an astrologer
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 md:py-4 px-6 rounded-xl font-bold text-base md:text-lg transition-all duration-300 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ 
                    background: sacredEarthTheme.colors.accent,
                    color: '#FFFFFF'
                  }}
                  onMouseOver={(e) => e.target.style.background = sacredEarthTheme.colors.accentHover}
                  onMouseOut={(e) => e.target.style.background = sacredEarthTheme.colors.accent}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      Sending...
                    </>
                  ) : (
                    <>
                      <FaPaperPlane className="mr-3" />
                      Send Message
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* FAQ Section */}
            <div 
              className="mt-6 md:mt-8 rounded-2xl p-5 sm:p-8"
              style={{ 
                background: sacredEarthTheme.colors.cardBg,
                border: `1px solid ${sacredEarthTheme.colors.border}`,
                boxShadow: `0 5px 20px ${sacredEarthTheme.colors.shadow}`
              }}
            >
              <h3 
                className="text-xl md:text-2xl font-bold mb-4 md:mb-6"
                style={{ 
                  color: sacredEarthTheme.colors.text,
                  fontFamily: sacredEarthTheme.fonts.heading
                }}
              >
                Frequently Asked Questions
              </h3>
              
              <div className="space-y-4">
                {[
                  {
                    q: "How quickly will I get a response?",
                    a: "We typically respond within 24 hours. For urgent matters, please call our support line."
                  },
                  {
                    q: "Can I speak directly with an astrologer?",
                    a: "Yes! Active users can schedule direct consultations through our platform."
                  },
                  {
                    q: "What are your business hours?",
                    a: "Our support team is available Monday-Saturday from 9 AM to 9 PM. Emergency support is available 24/7."
                  },
                  {
                    q: "How do I become an astrologer on MyAstrova?",
                    a: "Visit our 'Join as Astrologer' page or check the box in the contact form above."
                  }
                ].map((faq, index) => (
                  <div 
                    key={index}
                    className="p-4 rounded-lg border"
                    style={{ 
                      background: sacredEarthTheme.colors.bgSecondary,
                      borderColor: sacredEarthTheme.colors.border
                    }}
                  >
                    <h4 className="font-bold mb-1.5 md:mb-2 text-sm md:text-base" style={{ color: sacredEarthTheme.colors.text }}>
                      {faq.q}
                    </h4>
                    <p className="text-sm md:text-base" style={{ color: sacredEarthTheme.colors.textSecondary }}>
                      {faq.a}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Contact Info */}
          <div className="space-y-6 md:space-y-8">
            {/* Contact Information Cards */}
            {contactInfo.map((info, index) => (
              <div 
                key={index}
                className="rounded-2xl p-5 md:p-6 transition-all duration-300 hover:scale-[1.02]"
                style={{ 
                  background: sacredEarthTheme.colors.cardBg,
                  border: `1px solid ${sacredEarthTheme.colors.border}`,
                  boxShadow: `0 5px 20px ${sacredEarthTheme.colors.shadow}`
                }}
              >
                <div className="flex items-start mb-2">
                  <div 
                    className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center mr-3 md:mr-4 flex-shrink-0"
                    style={{ background: sacredEarthTheme.colors.accent }}
                  >
                    <div className="text-lg md:text-xl text-white">{info.icon}</div>
                  </div>
                  <div>
                    <h3 
                      className="text-lg md:text-xl font-bold"
                      style={{ 
                        color: sacredEarthTheme.colors.text,
                        fontFamily: sacredEarthTheme.fonts.heading
                      }}
                    >
                      {info.title}
                    </h3>
                    <div className="mt-1 space-y-0.5 md:space-y-1">
                      {info.details.map((detail, idx) => (
                        <p 
                          key={idx}
                          className="text-base md:text-lg font-medium break-all sm:break-normal"
                          style={{ color: sacredEarthTheme.colors.textSecondary }}
                        >
                          {detail}
                        </p>
                      ))}
                    </div>
                    <p className="text-xs md:text-sm mt-2" style={{ color: sacredEarthTheme.colors.accent }}>
                      {info.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {/* Social Media Section */}
            <div 
              className="rounded-2xl p-5 md:p-6"
              style={{ 
                background: sacredEarthTheme.colors.cardBg,
                border: `1px solid ${sacredEarthTheme.colors.border}`,
                boxShadow: `0 5px 20px ${sacredEarthTheme.colors.shadow}`
              }}
            >
              <h3 
                className="text-xl md:text-2xl font-bold mb-4 md:mb-6"
                style={{ 
                  color: sacredEarthTheme.colors.text,
                  fontFamily: sacredEarthTheme.fonts.heading
                }}
              >
                Connect With Us
              </h3>
              
              <p className="mb-4 md:mb-6 text-sm md:text-base" style={{ color: sacredEarthTheme.colors.textSecondary }}>
                Follow us for daily horoscopes, spiritual insights, and exclusive offers
              </p>
              
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 md:gap-4">
                {socialLinks.map((social, index) => (
                  <a
                    key={index}
                    href={social.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex  flex-col items-center justify-center p-3 border md:p-3  rounded-xl transition-all duration-300 hover:scale-105"
                    style={{ 
                      background: sacredEarthTheme.colors.bgSecondary,
                      border: `1px solid ${sacredEarthTheme.colors.border}`
                    }}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                  >
                    <div className="text-xl md:text-2xl " style={{ color: social.color }}>
                      {social.icon}
                    </div>
                   
                  </a>
                ))}
              </div>
            </div>

            {/* Emergency Support */}
            <div 
              className="rounded-2xl p-5 md:p-6 text-center"
              style={{ 
                background: `linear-gradient(135deg, ${sacredEarthTheme.colors.text} 0%, ${sacredEarthTheme.colors.textSecondary} 100%)`,
                boxShadow: `0 5px 20px ${sacredEarthTheme.colors.shadow}`
              }}
            >
              <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 rounded-full mb-3 md:mb-4" style={{ background: 'rgba(255,255,255,0.2)' }}>
                <FaStar className="text-xl md:text-2xl text-white" />
              </div>
              
              <h3 
                className="text-lg md:text-xl font-bold mb-2 text-white"
                style={{ fontFamily: sacredEarthTheme.fonts.heading }}
              >
                24/7 Emergency Spiritual Support
              </h3>
              
              <p className="text-white/90 mb-3 md:mb-4 text-sm md:text-base">
                Need immediate guidance? Our emergency support line is always available
              </p>
              
              <div className="text-xl md:text-2xl font-bold text-white mb-3 md:mb-4">
                +91 7888762191
              </div>
              
              <p className="text-xs md:text-sm text-white/80">
                Available for registered users
              </p>
            </div>

            {/* Testimonial */}
            <div 
              className="rounded-2xl p-5 md:p-6"
              style={{ 
                background: sacredEarthTheme.colors.cardBg,
                border: `1px solid ${sacredEarthTheme.colors.border}`,
                boxShadow: `0 5px 20px ${sacredEarthTheme.colors.shadow}`
              }}
            >
              <div className="flex items-center mb-3 md:mb-4">
                {[1, 2, 3, 4, 5].map((star) => (
                  <FaStar key={star} className="text-yellow-500 mr-1 text-sm md:text-base" />
                ))}
              </div>
              
              <p className="italic mb-4 text-sm md:text-base" style={{ color: sacredEarthTheme.colors.textSecondary }}>
                "The support team at MyAstrova helped me connect with the perfect astrologer 
                during a difficult time. Their guidance was life-changing!"
              </p>
              
              <div className="flex items-center">
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full overflow-hidden mr-3">
                  <div 
                    className="w-full h-full flex items-center justify-center"
                    style={{ background: sacredEarthTheme.colors.accent }}
                  >
                    <span className="text-white font-bold text-xs md:text-sm">RP</span>
                  </div>
                </div>
                <div>
                  <p className="font-bold text-sm md:text-base" style={{ color: sacredEarthTheme.colors.text }}>
                    Riya Patel
                  </p>
                  <p className="text-xs md:text-sm" style={{ color: sacredEarthTheme.colors.textSecondary }}>
                    Mumbai, 6 months with MyAstrova
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Banner */}
      <div 
        className="mt-8 md:mt-12 py-6 md:py-8 px-4 text-center"
        style={{ 
          background: sacredEarthTheme.colors.bgSecondary,
          borderTop: `1px solid ${sacredEarthTheme.colors.border}`
        }}
      >
        <div className="max-w-3xl mx-auto">
          <p className="text-base md:text-lg mb-3 md:mb-4" style={{ color: sacredEarthTheme.colors.text }}>
            Ready to start your spiritual journey?
          </p>
          <a 
            href="/astrologers"
            className="inline-flex items-center px-6 py-2.5 md:px-8 md:py-3 rounded-xl font-bold text-base md:text-lg transition-all duration-300 w-full sm:w-auto justify-center"
            style={{ 
              background: sacredEarthTheme.colors.accent,
              color: '#FFFFFF'
            }}
            onMouseOver={(e) => e.target.style.background = sacredEarthTheme.colors.accentHover}
            onMouseOut={(e) => e.target.style.background = sacredEarthTheme.colors.accent}
          >
            Explore Our Astrologers
            <svg className="ml-2 w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}