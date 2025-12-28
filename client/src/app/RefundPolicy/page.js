// app/refund-policy/page.jsx
export const metadata = {
  title: "Refund Policy | MyAstrova Astrology",
  description: "Our refund policy and money-back guarantee for services and consultations.",
  openGraph: {
    title: "Refund Policy | MyAstrova Astrology",
    description: "Learn about our refund process and money-back guarantee.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1554224155-6726b3ff858f",
        width: 1200,
        height: 630,
        alt: "Policy documentation",
      },
    ],
  },
};

export default function RefundPolicy() {
  return (
    <main className="bg-[#F7F3E9] text-[#003D33] font-serif min-h-screen">
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 px-4 md:px-8 lg:px-20 bg-gradient-to-r from-[#003D33]/10 to-[#B2C5B2]/10">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold mb-6">
            Refund Policy
          </h1>
          <p className="text-lg md:text-xl text-[#00695C] max-w-3xl mx-auto">
            Our commitment to fair and transparent refund processes
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 md:py-20 px-4 md:px-8 lg:px-20">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-10 md:space-y-12">
            {/* Introduction */}
            <PolicySection
              title="Introduction"
              icon="📄"
            >
              <p className="mb-4">
                At MyAstrova Astrology, we are committed to providing high-quality spiritual guidance and services. We want you to be completely satisfied with your experience. This Refund Policy outlines the circumstances under which refunds may be provided.
              </p>
              <p>
                Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </PolicySection>

            {/* Refund Eligibility */}
            <PolicySection
              title="Refund Eligibility"
              icon="✅"
            >
              <ul className="space-y-4">
                <li className="flex items-start">
                  <span className="inline-block w-6 h-6 bg-[#B2C5B2] rounded-full mr-3 mt-1 flex-shrink-0"></span>
                  <span><strong>Service Not Delivered:</strong> Full refund if service is not provided within 24 hours of scheduled time without rescheduling</span>
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-6 h-6 bg-[#B2C5B2] rounded-full mr-3 mt-1 flex-shrink-0"></span>
                  <span><strong>Technical Issues:</strong> Refund if our platform issues prevent service delivery</span>
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-6 h-6 bg-[#B2C5B2] rounded-full mr-3 mt-1 flex-shrink-0"></span>
                  <span><strong>Wrong Service:</strong> Refund if you receive a different service than purchased</span>
                </li>
              </ul>
            </PolicySection>

            {/* Non-Refundable Items */}
            <PolicySection
              title="Non-Refundable Items"
              icon="❌"
            >
              <ul className="space-y-4">
                <li className="flex items-start">
                  <span className="inline-block w-6 h-6 bg-[#F7F3E9] border border-[#B2C5B2] rounded-full mr-3 mt-1 flex-shrink-0"></span>
                  <span>Completed consultations and readings</span>
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-6 h-6 bg-[#F7F3E9] border border-[#B2C5B2] rounded-full mr-3 mt-1 flex-shrink-0"></span>
                  <span>Subscription fees for used periods</span>
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-6 h-6 bg-[#F7F3E9] border border-[#B2C5B2] rounded-full mr-3 mt-1 flex-shrink-0"></span>
                  <span>Digital products and downloadable content</span>
                </li>
                <li className="flex items-start">
                  <span className="inline-block w-6 h-6 bg-[#F7F3E9] border border-[#B2C5B2] rounded-full mr-3 mt-1 flex-shrink-0"></span>
                  <span>Services cancelled less than 2 hours before scheduled time</span>
                </li>
              </ul>
            </PolicySection>

            {/* Refund Process */}
            <PolicySection
              title="Refund Process"
              icon="🔄"
            >
              <div className="grid md:grid-cols-3 gap-6">
                <ProcessStep
                  number="1"
                  title="Submit Request"
                  description="Contact support within 7 days with order details"
                />
                <ProcessStep
                  number="2"
                  title="Review Period"
                  description="We review your request within 48 hours"
                />
                <ProcessStep
                  number="3"
                  title="Refund Issued"
                  description="Refund processed within 5-7 business days"
                />
              </div>
            </PolicySection>

            {/* Cancellation Policy */}
            <PolicySection
              title="Cancellation Policy"
              icon="⏱️"
            >
              <div className="bg-white border border-[#B2C5B2] rounded-lg p-6">
                <ul className="space-y-4">
                  <li className="pb-4 border-b border-[#F7F3E9]">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold">More than 24 hours before</span>
                      <span className="bg-[#B2C5B2] text-[#003D33] px-3 py-1 rounded-full text-sm">Full refund</span>
                    </div>
                    <p className="text-sm text-[#00695C]">100% refund of service fee</p>
                  </li>
                  <li className="pb-4 border-b border-[#F7F3E9]">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold">2-24 hours before</span>
                      <span className="bg-[#F7F3E9] text-[#003D33] border border-[#B2C5B2] px-3 py-1 rounded-full text-sm">50% refund</span>
                    </div>
                    <p className="text-sm text-[#00695C]">50% refund of service fee</p>
                  </li>
                  <li>
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold">Less than 2 hours before</span>
                      <span className="bg-[#F7F3E9] text-[#003D33] border border-[#B2C5B2] px-3 py-1 rounded-full text-sm">No refund</span>
                    </div>
                    <p className="text-sm text-[#00695C]">Rescheduling option available</p>
                  </li>
                </ul>
              </div>
            </PolicySection>

            {/* Contact Information */}
            <div className="bg-gradient-to-r from-[#003D33]/5 to-[#B2C5B2]/5 p-8 rounded-xl border border-[#B2C5B2]">
              <h3 className="text-2xl font-semibold mb-4 flex items-center">
                <span className="mr-3">📧</span>
                Contact for Refund Inquiries
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Email</h4>
                  <p className="text-[#00695C]">refunds@sacredearth.com</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Response Time</h4>
                  <p className="text-[#00695C]">Within 24-48 hours</p>
                </div>
              </div>
            </div>

            {/* Note */}
            <div className="bg-[#FFF8E1] border-l-4 border-[#C06014] p-6 rounded">
              <p className="font-semibold mb-2">Important Note:</p>
              <p>
                All refunds are processed to the original payment method. The time it takes for the refund to appear in your account depends on your bank or payment provider.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

// Component for Policy Sections
function PolicySection({ title, children, icon }) {
  return (
    <div className="border-b border-[#B2C5B2] pb-8 md:pb-10">
      <h2 className="text-2xl md:text-3xl font-semibold mb-6 flex items-center">
        <span className="mr-3">{icon}</span>
        {title}
      </h2>
      <div className="text-lg leading-relaxed">
        {children}
      </div>
    </div>
  );
}

// Component for Process Steps
function ProcessStep({ number, title, description }) {
  return (
    <div className="text-center p-4">
      <div className="w-12 h-12 bg-[#003D33] text-white rounded-full flex items-center justify-center text-xl font-bold mb-4 mx-auto">
        {number}
      </div>
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-sm text-[#00695C]">{description}</p>
    </div>
  );
}