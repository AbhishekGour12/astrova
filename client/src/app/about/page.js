export const metadata = {
  title: "About Us | MyAstrova Astrology",
  description:
    "Learn about our mission, vision, story, and why millions trust MyAstrova for spiritual guidance.",
  openGraph: {
    title: "About Us | MyAstrova Astrology",
    description:
      "Ancient wisdom meets modern life. Discover who we are and what we do.",
    images: [
      {
        url: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee",
        width: 1200,
        height: 630,
        alt: "Peaceful nature and spirituality",
      },
    ],
  },
};

export default function About() {
  return (
    <main className="bg-[#F7F3E9] text-[#003D33] font-serif min-h-screen">
      {/* ================= HERO ================= */}
      <section className="relative h-[60vh] md:h-[75vh] lg:h-[80vh] mt-32">
        <div className="absolute inset-0 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1500530855697-b586d89ba3ee"
            alt="Spiritual calm"
            className="w-full h-full object-cover scale-105 lg:scale-100"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />

        <div className="relative h-full flex flex-col justify-end pb-16 md:pb-24 px-4 md:px-8 lg:px-20">
          <div className="max-w-4xl mx-auto w-full text-center text-white">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold mb-4 drop-shadow-lg">
              MyAstrova Astrology
            </h1>
            <p className="text-lg md:text-xl opacity-95">
              Where ancient wisdom meets modern guidance
            </p>
          </div>
        </div>

        {/* Stats Section */}
        <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-[90%] max-w-5xl bg-white border border-[#B2C5B2] grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 md:gap-10 px-4 sm:px-6 md:px-10 py-6 md:py-8 shadow-xl rounded-lg">
          <Stat value="4.3 Crore+" label="Happy Customers" />
          <div className="hidden sm:block h-12 w-px bg-[#B2C5B2] mx-auto" />
          <Stat value="13000+" label="Astrologers" />
          <div className="hidden sm:block h-12 w-px bg-[#B2C5B2] mx-auto" />
          <Stat value="60+" label="Countries" />
        </div>
      </section>

      <div className="pt-20 md:pt-24 pb-8 md:pb-12">
        {/* ================= WHO WE ARE ================= */}
        <Section title="WHO WE ARE">
          <div className="max-w-3xl mx-auto space-y-5 md:space-y-6">
            <p className="text-lg md:text-xl leading-relaxed">
              MyAstrova is a modern spiritual platform that blends ancient wisdom
              with today's lifestyle to guide people through life's uncertainties.
            </p>
            <p className="text-lg md:text-xl leading-relaxed">
              We believe astrology should be accessible, accurate, and deeply
              meaningful — not confusing or intimidating.
            </p>
          </div>
        </Section>

        {/* ================= WHAT WE DO ================= */}
        <SplitSection
          title="WHAT WE DO"
          image="https://images.unsplash.com/photo-1529333166437-7750a6dd5a70"
          imageAlt="Astrology consultation"
        >
          <div className="space-y-5 md:space-y-6">
            <p className="text-lg md:text-xl leading-relaxed">
              We connect people with experienced astrologers and spiritual experts
              through chat and call, available anytime you need guidance.
            </p>
            <p className="text-lg md:text-xl leading-relaxed">
              Alongside consultations, we provide horoscopes, compatibility tools,
              spiritual resources, and daily insights.
            </p>
          </div>
        </SplitSection>

        {/* ================= MISSION & VISION ================= */}
        <section className="py-16 md:py-20 px-4 md:px-8 lg:px-20">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-semibold text-center mb-12 md:mb-16">
              Our Core Values
            </h2>
            <div className="grid md:grid-cols-2 gap-8 md:gap-10">
              <Card 
                title="MISSION"
                icon={
                  <svg className="w-8 h-8 mb-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                  </svg>
                }
              >
                To build a trusted spiritual community where people find clarity,
                confidence, and peace during difficult phases of life.
              </Card>
              <Card 
                title="VISION"
                icon={
                  <svg className="w-8 h-8 mb-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                  </svg>
                }
              >
                To become a global destination for ethical, accurate, and meaningful
                spiritual guidance.
              </Card>
            </div>
          </div>
        </section>

        {/* ================= WE GOT YOUR BACK ================= */}
        <SplitSection
          title="WE GOT YOUR BACK"
          image="https://images.unsplash.com/photo-1521737604893-d14cc237f11d"
          imageAlt="Support team"
          reverse
        >
          <div className="space-y-5 md:space-y-6">
            <p className="text-lg md:text-xl leading-relaxed">
              Our astrologers and support team work together as one family to ensure
              you always feel heard and supported.
            </p>
            <p className="text-lg md:text-xl leading-relaxed">
              Whether it's career decisions, relationships, or inner peace — we
              stand beside you.
            </p>
          </div>
        </SplitSection>

        {/* ================= OUR STORY ================= */}
        <Section title="OUR STORY">
          <div className="max-w-3xl mx-auto space-y-5 md:space-y-6">
            <p className="text-lg md:text-xl leading-relaxed">
              MyAstrova was born from a desire to preserve the essence of
              traditional astrology while making it relevant for modern challenges.
            </p>
            <p className="text-lg md:text-xl leading-relaxed">
              By combining technology with timeless wisdom, we focus on emotional,
              mental, and spiritual well-being.
            </p>
          </div>
        </Section>

        {/* ================= WHY US ================= */}
        <section className="bg-gradient-to-r from-[#C06014] to-[#D97706] text-white py-16 md:py-24 px-4 md:px-8 lg:px-20">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold mb-8 md:mb-12">
              WHY MyAstrova
            </h2>
            <div className="space-y-6 md:space-y-8">
              <p className="text-lg md:text-xl leading-relaxed">
                Every astrologer on our platform is carefully verified and rated by
                users to maintain quality and trust.
              </p>
              <p className="text-lg md:text-xl leading-relaxed">
                Privacy, accuracy, and honesty are the foundation of everything we do.
              </p>
            </div>
          </div>
        </section>

        {/* ================= LIFE AT ================= */}
        <Section title="LIFE AT MyAstrova">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4 lg:gap-6 mt-10">
              <Gallery img="https://images.unsplash.com/photo-1522071820081-009f0129c71c" />
              <Gallery img="https://images.unsplash.com/photo-1497215728101-856f4ea42174" />
              <Gallery img="https://images.unsplash.com/photo-1504384308090-c894fdcc538d" />
              <Gallery img="https://images.unsplash.com/photo-1556761175-5973dc0f32e7" />
              <Gallery img="https://images.unsplash.com/photo-1522202176988-66273c2fd55f" />
              <Gallery img="https://images.unsplash.com/photo-1503387762-592deb58ef4e" />
              <Gallery img="https://images.unsplash.com/photo-1542744173-8e7e53415bb0" />
              <Gallery img="https://images.unsplash.com/photo-1552664730-d307ca884978" />
            </div>
          </div>
        </Section>

        {/* ================= CTA SECTION ================= */}
        <section className="py-16 md:py-20 px-4 md:px-8 lg:px-20 text-center">
          <div className="max-w-3xl mx-auto bg-white border border-[#B2C5B2] rounded-2xl p-8 md:p-12 shadow-lg">
            <h2 className="text-2xl md:text-3xl font-semibold mb-6">
              Ready to Begin Your Journey?
            </h2>
            <p className="text-lg mb-8">
              Connect with our expert astrologers today and find the guidance you seek.
            </p>
            <button className="bg-[#00695C] text-white px-8 py-3 rounded-lg font-medium hover:bg-[#004D40] transition-colors duration-200">
              Get Started
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}

/* ================= COMPONENTS ================= */

function Stat({ value, label }) {
  return (
    <div className="text-center px-2">
      <h3 className="text-xl md:text-2xl lg:text-3xl font-semibold mb-2">{value}</h3>
      <p className="text-sm md:text-base text-[#00695C] font-medium">{label}</p>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <section className="py-16 md:py-20 px-4 md:px-8 lg:px-20">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-semibold text-center mb-10 md:mb-12">
          {title}
        </h2>
        {children}
      </div>
    </section>
  );
}

function SplitSection({ title, image, imageAlt, children, reverse }) {
  return (
    <section className="py-16 md:py-20 px-4 md:px-8 lg:px-20">
      <div className="max-w-6xl mx-auto">
        <div className={`flex flex-col ${reverse ? 'lg:flex-row-reverse' : 'lg:flex-row'} gap-8 md:gap-12 items-center`}>
          <div className="lg:w-1/2">
            <div className="relative overflow-hidden rounded-xl shadow-lg">
              <img
                src={image}
                alt={imageAlt || title}
                className="w-full h-64 md:h-80 lg:h-96 object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>
          <div className="lg:w-1/2">
            <h2 className="text-3xl md:text-4xl font-semibold mb-6 md:mb-8">
              {title}
            </h2>
            <div className="space-y-4 md:space-y-5">
              {children}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Card({ title, children, icon }) {
  return (
    <div className="bg-white border border-[#B2C5B2] rounded-xl p-6 md:p-8 lg:p-10 shadow-sm hover:shadow-md transition-shadow duration-200 h-full">
      <div className="text-[#C06014]">
        {icon}
      </div>
      <h3 className="text-2xl md:text-3xl font-semibold mb-4 md:mb-6">{title}</h3>
      <p className="text-lg leading-relaxed">{children}</p>
    </div>
  );
}

function Gallery({ img }) {
  return (
    <div className="relative overflow-hidden rounded-lg aspect-square">
      <img
        src={img}
        alt="Life at MyAstrova"
        className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
      />
    </div>
  );
}