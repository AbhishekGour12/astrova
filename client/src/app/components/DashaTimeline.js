const PLANET_ICONS = {
  Sun: "☀️",
  Moon: "🌙",
  Mars: "🔥",
  Mercury: "🧠",
  Jupiter: "📘",
  Venus: "💎",
  Saturn: "🪐",
  Rahu: "☊",
  Ketu: "☋",
};

export default function DashaTimeline({ data }) {
  if (!data) return null;

  const blocks = [
    { label: "Major Dasha", ...data.major },
    { label: "Minor Dasha", ...data.minor },
    { label: "Sub Minor", ...data.sub_minor },
    { label: "Sub Sub Minor", ...data.sub_sub_minor },
    { label: "Current Phase", ...data.sub_sub_sub_minor },
  ];

  return (
    <div className="bg-white p-6 rounded mb-6">
      <h2 className="text-xl font-bold mb-4">
        🪐 Current Dasha Timeline
      </h2>

      <div className="space-y-4">
        {blocks.map((b, i) => (
          <div
            key={i}
            className={`border-l-4 pl-4 ${
              i === blocks.length - 1
                ? "border-[#C06014] bg-[#FFF8F0]"
                : "border-gray-300"
            }`}
          >
            <p className="font-semibold">
              {PLANET_ICONS[b.planet] || "🪐"} {b.label} —{" "}
              <span className="text-[#00695C]">{b.planet}</span>
            </p>

            <p className="text-xs text-gray-500">
              {b.start} → {b.end}
            </p>
          </div>
        ))}
      </div>

      <p className="mt-4 text-sm text-[#00695C]">
        ✨ You are currently under the influence of{" "}
        <b>{data.sub_sub_sub_minor.planet}</b>, which
        affects your emotions and daily decisions today.
      </p>
    </div>
  );
}
