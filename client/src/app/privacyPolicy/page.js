// app/privacy-policy/page.jsx
export const metadata = {
  title: "Privacy Policy | MyAstrova Astrology",
  description: "How we collect, use, and protect your personal information.",
  openGraph: {
    title: "Privacy Policy | MyAstrova Astrology",
    description: "Your privacy is important to us. Read our privacy policy.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71",
        width: 1200,
        height: 630,
        alt: "Privacy and security",
      },
    ],
  },
};

export default function PrivacyPolicy() {
  return (
    <main className="bg-[#F7F3E9] text-[#003D33] font-serif min-h-screen">
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 px-4 md:px-8 lg:px-20 bg-gradient-to-r from-[#003D33]/10 to-[#B2C5B2]/10">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold mb-6">
            Privacy Policy
          </h1>
          <p className="text-lg md:text-xl text-[#00695C] max-w-3xl mx-auto">
            Protecting your spiritual journey and personal information
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
              icon="🔒"
            >
              <p className="mb-4">
                At MyAstrova Astrology, we respect your privacy and are committed to protecting your personal data. This privacy policy will inform you about how we look after your personal data when you visit our website and tell you about your privacy rights.
              </p>
              <p>
                We take your spiritual journey seriously and protect your confidentiality with the utmost care.
              </p>
            </PolicySection>

            {/* Data Collection */}
            <PolicySection
              title="Information We Collect"
              icon="📋"
            >
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="bg-white border border-[#B2C5B2] rounded-lg p-6">
                  <h4 className="font-semibold mb-3 text-lg">Personal Information</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-[#B2C5B2] rounded-full mr-2"></span>
                      Name and contact details
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-[#B2C5B2] rounded-full mr-2"></span>
                      Date, time, and place of birth
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-[#B2C5B2] rounded-full mr-2"></span>
                      Payment information
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-[#B2C5B2] rounded-full mr-2"></span>
                      Communication preferences
                    </li>
                  </ul>
                </div>
                <div className="bg-white border border-[#B2C5B2] rounded-lg p-6">
                  <h4 className="font-semibold mb-3 text-lg">Usage Information</h4>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-[#B2C5B2] rounded-full mr-2"></span>
                      Device and browser information
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-[#B2C5B2] rounded-full mr-2"></span>
                      IP address and location
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-[#B2C5B2] rounded-full mr-2"></span>
                      Pages visited and time spent
                    </li>
                    <li className="flex items-center">
                      <span className="w-2 h-2 bg-[#B2C5B2] rounded-full mr-2"></span>
                      Consultation history
                    </li>
                  </ul>
                </div>
              </div>
            </PolicySection>

            {/* How We Use Data */}
            <PolicySection
              title="How We Use Your Information"
              icon="🎯"
            >
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-[#003D33] text-white">
                      <th className="p-4 text-left">Purpose</th>
                      <th className="p-4 text-left">Data Used</th>
                      <th className="p-4 text-left">Legal Basis</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-[#B2C5B2]">
                      <td className="p-4">Provide astrological services</td>
                      <td className="p-4">Birth details, preferences</td>
                      <td className="p-4">Contract fulfillment</td>
                    </tr>
                    <tr className="border-b border-[#B2C5B2]">
                      <td className="p-4">Personalize your experience</td>
                      <td className="p-4">Usage data, preferences</td>
                      <td className="p-4">Legitimate interest</td>
                    </tr>
                    <tr className="border-b border-[#B2C5B2]">
                      <td className="p-4">Process payments</td>
                      <td className="p-4">Payment information</td>
                      <td className="p-4">Contract fulfillment</td>
                    </tr>
                    <tr>
                      <td className="p-4">Send updates and insights</td>
                      <td className="p-4">Email, preferences</td>
                      <td className="p-4">Consent</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </PolicySection>

            {/* Data Protection */}
            <PolicySection
              title="Data Protection"
              icon="🛡️"
            >
              <div className="grid md:grid-cols-3 gap-6">
                <ProtectionFeature
                  icon="🔐"
                  title="Encryption"
                  description="All data encrypted in transit and at rest"
                />
                <ProtectionFeature
                  icon="👁️"
                  title="Access Control"
                  description="Strict access controls and authentication"
                />
                <ProtectionFeature
                  icon="📊"
                  title="Regular Audits"
                  description="Regular security assessments and updates"
                />
              </div>
            </PolicySection>

            {/* Your Rights */}
            <PolicySection
              title="Your Rights"
              icon="⚖️"
            >
              <div className="grid md:grid-cols-2 gap-6">
                {[
                  { right: "Access", desc: "Request copies of your personal data" },
                  { right: "Correction", desc: "Request correction of inaccurate data" },
                  { right: "Deletion", desc: "Request deletion of your personal data" },
                  { right: "Objection", desc: "Object to processing of your data" },
                  { right: "Portability", desc: "Request transfer of data to another organization" },
                  { right: "Withdraw Consent", desc: "Withdraw consent at any time" },
                ].map((item, index) => (
                  <div key={index} className="flex items-start p-4 bg-white border border-[#B2C5B2] rounded-lg">
                    <span className="text-2xl mr-3">📋</span>
                    <div>
                      <h4 className="font-semibold mb-1">{item.right}</h4>
                      <p className="text-sm text-[#00695C]">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </PolicySection>

            {/* Contact Information */}
            <div className="bg-gradient-to-r from-[#003D33]/5 to-[#B2C5B2]/5 p-8 rounded-xl border border-[#B2C5B2]">
              <h3 className="text-2xl font-semibold mb-4 flex items-center">
                <span className="mr-3">📮</span>
                Data Protection Officer
              </h3>
              <div className="grid md:grid-cols-3 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Email</h4>
                  <p className="text-[#00695C]">dpo@sacredearth.com</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Phone</h4>
                  <p className="text-[#00695C]">+1 (555) 123-4567</p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Response Time</h4>
                  <p className="text-[#00695C]">Within 72 hours</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function ProtectionFeature({ icon, title, description }) {
  return (
    <div className="text-center p-4">
      <div className="text-3xl mb-3">{icon}</div>
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-sm text-[#00695C]">{description}</p>
    </div>
  );
}

// Reuse PolicySection component from Refund Policy
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