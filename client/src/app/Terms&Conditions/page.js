// app/terms-conditions/page.jsx
export const metadata = {
  title: "Terms & Conditions | MyAstrova Astrology",
  description: "Terms of service for using MyAstrova Astrology platform.",
  openGraph: {
    title: "Terms & Conditions | MyAstrova Astrology",
    description: "Read our terms and conditions for using our services.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f",
        width: 1200,
        height: 630,
        alt: "Legal terms and conditions",
      },
    ],
  },
};

export default function TermsConditions() {
  return (
    <main className="bg-[#F7F3E9] text-[#003D33] font-serif min-h-screen">
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 px-4 md:px-8 lg:px-20 bg-gradient-to-r from-[#003D33]/10 to-[#B2C5B2]/10">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold mb-6">
            Terms & Conditions
          </h1>
          <p className="text-lg md:text-xl text-[#00695C] max-w-3xl mx-auto">
            Guidelines for using our spiritual guidance platform
          </p>
          <div className="mt-8 text-sm text-[#00695C]">
            Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 md:py-20 px-4 md:px-8 lg:px-20">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-10 md:space-y-12">
            {/* Introduction */}
            <div className="bg-white border border-[#B2C5B2] rounded-xl p-6 md:p-8 shadow-sm">
              <p className="text-lg leading-relaxed">
                Welcome to MyAstrova Astrology. By accessing or using our website and services, you agree to be bound by these Terms and Conditions. Please read them carefully before using our services.
              </p>
            </div>

            {/* Acceptance of Terms */}
            <TermsSection
              title="1. Acceptance of Terms"
              number="1"
            >
              <p className="mb-4">
                By accessing and using MyAstrova Astrology, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, you must not use our services.
              </p>
              <div className="bg-[#F7F3E9] p-4 rounded-lg border border-[#B2C5B2]">
                <p className="text-sm italic">
                  <strong>Note:</strong> These terms apply to all users including visitors, customers, and astrologers.
                </p>
              </div>
            </TermsSection>

            {/* Services Description */}
            <TermsSection
              title="2. Services Description"
              number="2"
            >
              <p className="mb-4">
                MyAstrova Astrology provides spiritual guidance services including but not limited to:
              </p>
              <ul className="space-y-3 mb-4">
                <li className="flex items-start">
                  <span className="inline-block w-6 h-6 bg-[#B2C5B2] rounded-full mr-3 mt-1 flex-shrink-0"></span>
                  <span>Personal astrology consultations via chat, call, and video</span>
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-6 h-6 bg-[#B2C5B2] rounded-full mr-3 mt-1 flex-shrink-0"></span>
                  <span>Daily, weekly, and monthly horoscopes</span>
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-6 h-6 bg-[#B2C5B2] rounded-full mr-3 mt-1 flex-shrink-0"></span>
                  <span>Compatibility analysis and relationship guidance</span>
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-6 h-6 bg-[#B2C5B2] rounded-full mr-3 mt-1 flex-shrink-0"></span>
                  <span>Spiritual resources and educational content</span>
                </li>
              </ul>
            </TermsSection>

            {/* User Responsibilities */}
            <TermsSection
              title="3. User Responsibilities"
              number="3"
            >
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white border border-[#B2C5B2] rounded-lg p-6">
                  <h4 className="font-semibold mb-3 text-lg">All Users Must:</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-[#003D33] rounded-full mr-2"></span>
                      Provide accurate information
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-[#003D33] rounded-full mr-2"></span>
                      Maintain account security
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-[#003D33] rounded-full mr-2"></span>
                      Respect other users and astrologers
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-[#003D33] rounded-full mr-2"></span>
                      Use services for personal guidance only
                    </li>
                  </ul>
                </div>
                <div className="bg-white border border-[#B2C5B2] rounded-lg p-6">
                  <h4 className="font-semibold mb-3 text-lg">Users Must Not:</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-[#C06014] rounded-full mr-2"></span>
                      Share account credentials
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-[#C06014] rounded-full mr-2"></span>
                      Use services for commercial purposes
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-[#C06014] rounded-full mr-2"></span>
                      Harass or abuse astrologers
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-[#C06014] rounded-full mr-2"></span>
                      Violate any applicable laws
                    </li>
                  </ul>
                </div>
              </div>
            </TermsSection>

            {/* Payments and Billing */}
            <TermsSection
              title="4. Payments and Billing"
              number="4"
            >
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-[#003D33] text-white">
                      <th className="p-4 text-left">Service Type</th>
                      <th className="p-4 text-left">Payment Terms</th>
                      <th className="p-4 text-left">Cancellation</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-[#B2C5B2]">
                      <td className="p-4">Instant Consultation</td>
                      <td className="p-4">Pay per minute/session</td>
                      <td className="p-4">As per refund policy</td>
                    </tr>
                    <tr className="border-b border-[#B2C5B2]">
                      <td className="p-4">Scheduled Session</td>
                      <td className="p-4">Pre-payment required</td>
                      <td className="p-4">24-hour notice</td>
                    </tr>
                    <tr className="border-b border-[#B2C5B2]">
                      <td className="p-4">Subscription</td>
                      <td className="p-4">Monthly/Annual billing</td>
                      <td className="p-4">Cancel anytime</td>
                    </tr>
                    <tr>
                      <td className="p-4">Package Deals</td>
                      <td className="p-4">One-time payment</td>
                      <td className="p-4">Non-refundable</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="mt-4 text-sm text-[#00695C]">
                All payments are processed through secure payment gateways. We do not store your payment card details.
              </p>
            </TermsSection>

            {/* Intellectual Property */}
            <TermsSection
              title="5. Intellectual Property"
              number="5"
            >
              <div className="flex items-start p-6 bg-gradient-to-r from-[#F7F3E9] to-white border border-[#B2C5B2] rounded-lg">
                <span className="text-3xl mr-4">©</span>
                <div>
                  <h4 className="font-semibold mb-2">Ownership Rights</h4>
                  <p className="mb-3">
                    All content on MyAstrova Astrology, including text, graphics, logos, images, and software, is the property of MyAstrova Astrology or its content suppliers and is protected by international copyright laws.
                  </p>
                  <p className="text-sm text-[#00695C]">
                    You may not reproduce, distribute, or create derivative works without our explicit written permission.
                  </p>
                </div>
              </div>
            </TermsSection>

            {/* Limitation of Liability */}
            <TermsSection
              title="6. Limitation of Liability"
              number="6"
            >
              <div className="bg-[#FFF8E1] border-l-4 border-[#C06014] p-6 rounded">
                <h4 className="font-semibold mb-3">Important Disclaimer</h4>
                <p className="mb-3">
                  MyAstrova Astrology provides spiritual guidance for informational and entertainment purposes only. Our services are not substitutes for professional medical, legal, financial, or psychological advice.
                </p>
                <p>
                  We are not liable for decisions made based on information received through our services. Users are solely responsible for their life choices and decisions.
                </p>
              </div>
            </TermsSection>

            {/* Changes to Terms */}
            <TermsSection
              title="7. Changes to Terms"
              number="7"
            >
              <div className="flex items-start">
                <span className="text-2xl mr-4">🔄</span>
                <div>
                  <p className="mb-3">
                    We reserve the right to modify these Terms and Conditions at any time. Changes will be effective immediately upon posting on our website.
                  </p>
                  <p className="text-sm text-[#00695C]">
                    Continued use of our services after changes constitutes acceptance of the modified terms.
                  </p>
                </div>
              </div>
            </TermsSection>

            {/* Governing Law */}
            <TermsSection
              title="8. Governing Law"
              number="8"
            >
              <div className="bg-white border border-[#B2C5B2] rounded-lg p-6">
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <h4 className="font-semibold mb-2">Jurisdiction</h4>
                    <p className="text-sm">Delhi, India</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Governing Law</h4>
                    <p className="text-sm">Indian Law</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-2">Dispute Resolution</h4>
                    <p className="text-sm">Arbitration in Delhi</p>
                  </div>
                </div>
              </div>
            </TermsSection>

            {/* Contact Information */}
            <div className="bg-gradient-to-r from-[#003D33] to-[#00695C] text-white p-8 rounded-xl">
              <h3 className="text-2xl font-semibold mb-4">Contact Us</h3>
              <p className="mb-6">
                For questions about these Terms and Conditions, please contact:
              </p>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Legal Department</h4>
                  <p>legal@sacredearth.com</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Office Address</h4>
                  <p>MyAstrova Astrology<br />123 Spiritual Lane<br />Delhi, India</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Phone</h4>
                  <p>+91 11 1234 5678</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

// Component for Terms Sections
function TermsSection({ title, children, number }) {
  return (
    <div className="border-b border-[#B2C5B2] pb-8 md:pb-10">
      <div className="flex items-start mb-6">
        <div className="w-10 h-10 bg-[#003D33] text-white rounded-full flex items-center justify-center text-lg font-bold mr-4 flex-shrink-0">
          {number}
        </div>
        <h2 className="text-2xl md:text-3xl font-semibold">{title}</h2>
      </div>
      <div className="pl-14 text-lg leading-relaxed">
        {children}
      </div>
    </div>
  );
}