// app/shipping-policy/page.js
"use client";
import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  FaTruck,
  FaMapMarkerAlt,
  FaClock,
  FaCheckCircle,
  FaTimesCircle,
  FaBox,
  FaGlobeAsia,
  FaRupeeSign,
  FaPhone,
  FaEnvelope,
  FaQuestionCircle,
  FaExchangeAlt,
  FaShieldAlt
} from 'react-icons/fa';

const ShippingPolicy = () => {
  const [activeTab, setActiveTab] = useState('domestic');

  const shippingData = {
    domestic: {
      title: "Domestic Shipping (Within India)",
      zones: [
        {
          name: "Metro Cities",
          cities: ["Delhi", "Mumbai", "Bengaluru", "Chennai", "Kolkata", "Hyderabad", "Pune", "Ahmedabad"],
          deliveryTime: "2-4 Business Days",
          cost: "₹99"
        },
        {
          name: "Tier 2 Cities",
          cities: ["Jaipur", "Lucknow", "Chandigarh", "Indore", "Bhopal", "Nagpur", "Coimbatore", "Visakhapatnam"],
          deliveryTime: "4-6 Business Days",
          cost: "₹149"
        },
        {
          name: "Tier 3 & Rural Areas",
          cities: ["All other cities and rural areas"],
          deliveryTime: "6-10 Business Days",
          cost: "₹199"
        }
      ],
      specialServices: [
        {
          name: "Express Delivery",
          time: "1-2 Business Days",
          cost: "₹299",
          description: "Available in select metro cities"
        },
        {
          name: "Same Day Delivery",
          time: "Within 24 Hours",
          cost: "₹499",
          description: "Available in Delhi, Mumbai, Bengaluru (Order before 12 PM)"
        }
      ]
    },
    international: {
      title: "International Shipping",
      regions: [
        {
          name: "Asia & Middle East",
          countries: ["UAE", "Singapore", "Malaysia", "Sri Lanka", "Bangladesh", "Nepal", "Qatar", "Oman"],
          deliveryTime: "7-12 Business Days",
          cost: "From ₹1,299"
        },
        {
          name: "Europe",
          countries: ["UK", "Germany", "France", "Italy", "Spain", "Netherlands", "Switzerland"],
          deliveryTime: "10-15 Business Days",
          cost: "From ₹1,799"
        },
        {
          name: "North America",
          countries: ["USA", "Canada"],
          deliveryTime: "12-18 Business Days",
          cost: "From ₹2,199"
        },
        {
          name: "Australia & New Zealand",
          countries: ["Australia", "New Zealand"],
          deliveryTime: "14-20 Business Days",
          cost: "From ₹2,499"
        }
      ],
      notes: [
        "Custom duties and taxes are the responsibility of the recipient",
        "International shipments require additional documentation",
        "Some items may have shipping restrictions based on destination country"
      ]
    }
  };

  const policies = [
    {
      title: "Processing Time",
      icon: <FaClock />,
      content: "All orders are processed within 1-2 business days. Orders placed after 2 PM IST are processed the next business day. Weekend orders are processed on Monday."
    },
    {
      title: "Shipping Partners",
      icon: <FaTruck />,
      content: "We partner with trusted logistics providers including Delhivery, Blue Dart, DTDC, FedEx, and DHL for international shipments. You will receive tracking details within 24 hours of shipment."
    },
    {
      title: "Tracking Your Order",
      icon: <FaMapMarkerAlt />,
      content: "Once your order is shipped, you will receive a tracking link via SMS and email. You can also track your order from your account dashboard. Tracking is updated at every major checkpoint."
    },
    {
      title: "Shipping Restrictions",
      icon: <FaTimesCircle />,
      content: "Some remote locations, military bases, and islands may have limited shipping options or additional delivery times. We'll notify you if there are any restrictions for your address."
    },
    {
      title: "Free Shipping",
      icon: <FaBox />,
      content: "Free standard shipping is available on all orders above ₹999 within India. International orders above ₹5,000 qualify for discounted shipping rates."
    }
  ];

  const deliveryTimeline = [
    { day: "Day 1", activity: "Order placed and payment confirmed" },
    { day: "Day 1-2", activity: "Order processing & quality check" },
    { day: "Day 2", activity: "Item packed with protective materials" },
    { day: "Day 2-3", activity: "Handed to courier partner" },
    { day: "Day 3-10", activity: "In transit with regular tracking updates" },
    { day: "Final Day", activity: "Delivery attempted (3 attempts)" }
  ];

  const faqs = [
    {
      question: "Can I change my shipping address after placing an order?",
      answer: "Yes, you can change your shipping address within 2 hours of placing the order. Contact our customer support team immediately at support@astrologyshop.com or call +91-9876543210."
    },
    {
      question: "What happens if I'm not available to receive the package?",
      answer: "Our delivery partners will attempt delivery 3 times on consecutive days. If unsuccessful, the package will be returned to our facility. You can reschedule delivery by contacting the courier directly or reaching out to us."
    },
    {
      question: "Do you ship on weekends and holidays?",
      answer: "We process orders only on business days (Monday-Friday). However, deliveries may occur on Saturdays depending on the courier service. No deliveries on major holidays."
    },
    {
      question: "How are fragile items packed?",
      answer: "Fragile items like crystals, yantras, and glass products are packed with extra bubble wrap, foam, and double-walled boxes. We ensure maximum protection during transit."
    },
    {
      question: "Can I cancel my order after it's shipped?",
      answer: "Once shipped, orders cannot be cancelled. However, you can refuse delivery when it arrives. Refunds are processed within 7-10 business days after the package is returned to us."
    },
    {
      question: "What is your lost package policy?",
      answer: "If your package is lost in transit, we initiate an investigation with the courier. If not located within 7 business days, we reship your order at no extra cost or provide a full refund."
    }
  ];

  const coverageAreas = {
    pinCodeRanges: [
      { area: "North India", range: "110000-119999, 121000-127999, 140000-160999" },
      { area: "West India", range: "360000-395999, 400000-445999" },
      { area: "South India", range: "500000-690999, 700000-737999" },
      { area: "East India", range: "700000-799999, 800000-854999" }
    ],
    specialCoverage: [
      "Jammu & Kashmir - Additional 2-3 days delivery time",
      "North Eastern States - Additional 3-5 days delivery time",
      "Andaman & Nicobar - Shipping via air only, additional charges apply",
      "Lakshadweep - Limited service, contact for availability"
    ]
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F7F3E9] to-[#ECE5D3]">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-[#003D33] to-[#00695C] text-white py-12 px-4 pt-[100px]">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Shipping Policy</h1>
            <p className="text-xl opacity-90">Fast, reliable delivery of spiritual products across India and worldwide</p>
          </motion.div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl p-6 shadow-lg border border-gray-200"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <FaClock className="text-2xl text-green-600" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Processing Time</h3>
                <p className="text-gray-600">1-2 Business Days</p>
              </div>
            </div>
            <p className="text-gray-700">All orders processed within 48 hours</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl p-6 shadow-lg border border-gray-200"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <FaTruck className="text-2xl text-blue-600" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Delivery Time</h3>
                <p className="text-gray-600">2-10 Days in India</p>
              </div>
            </div>
            <p className="text-gray-700">Based on your location</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl p-6 shadow-lg border border-gray-200"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <FaShieldAlt className="text-2xl text-purple-600" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Free Shipping</h3>
                <p className="text-gray-600">On orders above ₹999</p>
              </div>
            </div>
            <p className="text-gray-700">Free standard shipping across India</p>
          </motion.div>
        </div>

        {/* Shipping Zones Tabs */}
        <div className="mb-12">
          <div className="flex border-b border-gray-200 mb-6">
            <button
              onClick={() => setActiveTab('domestic')}
              className={`flex-1 py-3 text-center font-medium text-lg ${activeTab === 'domestic' ? 'text-[#C06014] border-b-2 border-[#C06014]' : 'text-gray-600'}`}
            >
              <FaGlobeAsia className="inline mr-2" />
              Domestic Shipping
            </button>
            <button
              onClick={() => setActiveTab('international')}
              className={`flex-1 py-3 text-center font-medium text-lg ${activeTab === 'international' ? 'text-[#C06014] border-b-2 border-[#C06014]' : 'text-gray-600'}`}
            >
              <FaGlobeAsia className="inline mr-2" />
              International Shipping
            </button>
          </div>

          {/* Domestic Shipping */}
          {activeTab === 'domestic' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-4">{shippingData.domestic.title}</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {shippingData.domestic.zones.map((zone, index) => (
                  <div key={index} className="bg-white rounded-xl p-6 shadow border border-gray-200">
                    <h3 className="font-bold text-lg mb-3 text-[#003D33]">{zone.name}</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <FaClock className="text-gray-500" />
                        <span className="font-medium">{zone.deliveryTime}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FaRupeeSign className="text-gray-500" />
                        <span className="font-medium">{zone.cost}</span>
                      </div>
                      <div className="mt-4">
                        <p className="text-sm text-gray-600 mb-2">Major Cities:</p>
                        <p className="text-gray-700">{zone.cities.join(', ')}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8">
                <h3 className="text-xl font-bold text-gray-800 mb-4">Express Services</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {shippingData.domestic.specialServices.map((service, index) => (
                    <div key={index} className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-200">
                      <h4 className="font-bold text-lg mb-2">{service.name}</h4>
                      <div className="space-y-2">
                        <p className="flex items-center gap-2">
                          <FaClock className="text-blue-500" />
                          <span className="font-medium">{service.time}</span>
                        </p>
                        <p className="flex items-center gap-2">
                          <FaRupeeSign className="text-blue-500" />
                          <span className="font-medium">{service.cost}</span>
                        </p>
                        <p className="text-sm text-gray-600 mt-2">{service.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* International Shipping */}
          {activeTab === 'international' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-4">{shippingData.international.title}</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {shippingData.international.regions.map((region, index) => (
                  <div key={index} className="bg-white rounded-xl p-6 shadow border border-gray-200">
                    <h3 className="font-bold text-lg mb-3 text-[#003D33]">{region.name}</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <FaClock className="text-gray-500" />
                        <span className="font-medium">{region.deliveryTime}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <FaRupeeSign className="text-gray-500" />
                        <span className="font-medium">{region.cost}</span>
                      </div>
                      <div className="mt-4">
                        <p className="text-sm text-gray-600 mb-2">Countries:</p>
                        <p className="text-gray-700">{region.countries.join(', ')}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                <h4 className="font-bold text-lg mb-3 text-yellow-800">Important Notes:</h4>
                <ul className="space-y-2">
                  {shippingData.international.notes.map((note, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <FaCheckCircle className="text-yellow-600 mt-1" />
                      <span className="text-yellow-800">{note}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          )}
        </div>

        {/* Delivery Timeline */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <FaClock className="text-[#C06014]" />
            Order Delivery Journey
          </h2>
          <div className="bg-white rounded-xl p-6 shadow border border-gray-200">
            <div className="relative">
              {/* Timeline Line */}
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-300 md:left-1/2 md:-translate-x-1/2"></div>
              
              {deliveryTimeline.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`relative flex items-center mb-8 ${index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}
                >
                  {/* Timeline Dot */}
                  <div className="absolute left-0 w-8 h-8 bg-[#C06014] rounded-full border-4 border-white shadow-md md:left-1/2 md:-translate-x-1/2"></div>
                  
                  {/* Content */}
                  <div className={`ml-12 md:ml-0 ${index % 2 === 0 ? 'md:pr-12 md:text-right md:w-1/2' : 'md:pl-12 md:w-1/2'}`}>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h3 className="font-bold text-[#003D33]">{item.day}</h3>
                      <p className="text-gray-700">{item.activity}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Coverage Areas */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <FaMapMarkerAlt className="text-[#C06014]" />
            Service Coverage in India
          </h2>
          <div className="bg-white rounded-xl p-6 shadow border border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-bold text-lg mb-4 text-[#003D33]">PIN Code Ranges</h3>
                <div className="space-y-4">
                  {coverageAreas.pinCodeRanges.map((area, index) => (
                    <div key={index} className="border-l-4 border-[#00695C] pl-4">
                      <h4 className="font-medium">{area.area}</h4>
                      <p className="text-sm text-gray-600">{area.range}</p>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="font-bold text-lg mb-4 text-[#003D33]">Special Areas</h3>
                <ul className="space-y-3">
                  {coverageAreas.specialCoverage.map((item, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <FaCheckCircle className="text-green-500 mt-1" />
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Policies */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Shipping Details & Policies</h2>
          <div className="space-y-4">
            {policies.map((policy, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-xl p-6 shadow border border-gray-200"
              >
                <div className="flex items-center gap-4 mb-3">
                  <div className="w-10 h-10 bg-[#F7F3E9] rounded-full flex items-center justify-center text-[#C06014]">
                    {policy.icon}
                  </div>
                  <h3 className="font-bold text-lg">{policy.title}</h3>
                </div>
                <p className="text-gray-700">{policy.content}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            <FaQuestionCircle className="text-[#C06014]" />
            Frequently Asked Questions
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow border border-gray-200">
                <h3 className="font-bold text-lg mb-2 text-[#003D33]">{faq.question}</h3>
                <p className="text-gray-700">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact & Support */}
        <div className="bg-gradient-to-r from-[#003D33] to-[#00695C] rounded-2xl p-8 text-white">
          <h2 className="text-2xl font-bold mb-6">Need Help With Shipping?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">Contact Our Support Team</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <FaPhone className="text-xl" />
                  <div>
                    <p className="font-medium">Phone Support</p>
                    <p>+91-9876543210 (10 AM - 7 PM, Mon-Sat)</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FaEnvelope className="text-xl" />
                  <div>
                    <p className="font-medium">Email Support</p>
                    <p>shipping@astrologyshop.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <FaExchangeAlt className="text-xl" />
                  <div>
                    <p className="font-medium">Live Chat</p>
                    <p>Available on website (10 AM - 6 PM)</p>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-bold mb-4">Quick Links</h3>
              <ul className="space-y-3">
                <li><a href="/track-order" className="hover:underline">Track Your Order</a></li>
                <li><a href="/return-policy" className="hover:underline">Return & Refund Policy</a></li>
                <li><a href="/faq" className="hover:underline">Shipping FAQ</a></li>
                <li><a href="/contact" className="hover:underline">Contact Form</a></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Last Updated */}
        <div className="mt-8 text-center text-gray-600">
          <p className="text-sm">
            <strong>Last Updated:</strong> January 15, 2024
          </p>
          <p className="text-sm mt-2">
            We reserve the right to update this shipping policy at any time. Please check this page periodically for changes.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ShippingPolicy;