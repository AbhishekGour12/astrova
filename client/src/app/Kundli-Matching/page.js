"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FaTrash } from "react-icons/fa";
import toast from "react-hot-toast";
import { getLatLngFromCity } from "../lib/geocode";
import { getFullMatchReport } from "../lib/astrology/getFullMatchReport";
import { downloadMatchReportPdf } from "../lib/pdf/matchReportPdf";

const emptyPerson = {
  name: "",
  dob: "",
  time: "",
  place: "",
};

export default function KundliMatching() {
  const [activeTab, setActiveTab] = useState("boy");
  const [boy, setBoy] = useState(emptyPerson);
  const [girl, setGirl] = useState(emptyPerson);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);

  /* ---------------- LOAD HISTORY ---------------- */
  useEffect(() => {
    const saved = localStorage.getItem("kundli_matches");
    if (saved) setHistory(JSON.parse(saved));
  }, []);

  /* ---------------- SAVE HISTORY ---------------- */
  const saveHistory = (boy, girl) => {
    const record = {
      id: Date.now(),
      boy,
      girl,
      createdAt: new Date().toISOString(),
    };

    const updated = [record, ...history].slice(0, 5);
    setHistory(updated);
    localStorage.setItem("kundli_matches", JSON.stringify(updated));
  };

  /* ---------------- MATCH HANDLER ---------------- */
  const handleMatch = async () => {
    try {
      if (!boy.name || !girl.name) {
        return toast.error("Fill both partner details");
      }

      setLoading(true);
      setReport(null);

      const boyGeo = await getLatLngFromCity(boy.place);
      const girlGeo = await getLatLngFromCity(girl.place);

      const fullReport = await getFullMatchReport(
        { ...boy, ...boyGeo, tz: 5.5 },
        { ...girl, ...girlGeo, tz: 5.5 }
      );
     console.log(fullReport)
      setReport(fullReport);
      saveHistory(boy, girl);
      toast.success("Kundli matched successfully!");
    } catch (err) {
      toast.error(err.message || "Matching failed");
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- HISTORY HANDLERS ---------------- */
  const loadHistory = (item) => {
    setBoy(item.boy);
    setGirl(item.girl);
    setReport(null);
    toast.success("Details loaded");
  };

  const deleteHistory = (id) => {
    const filtered = history.filter((h) => h.id !== id);
    setHistory(filtered);
    localStorage.setItem("kundli_matches", JSON.stringify(filtered));
  };

  const person = activeTab === "boy" ? boy : girl;
  const setPerson = activeTab === "boy" ? setBoy : setGirl;
return(
    <div className="min-h-screen bg-[#F7F3E9] px-4 py-10 pt-28">
      <h1 className="text-3xl font-bold text-center text-[#003D33] mb-6">
        Kundli Matching
      </h1>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* FORM SECTION */}
        <div className="lg:col-span-2 bg-white border border-[#B2C5B2] rounded-2xl p-6">
          {/* Tabs */}
          <div className="flex bg-[#ECE5D3] rounded-full p-1 mb-6">
            {["boy", "girl"].map((t) => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`flex-1 py-2 rounded-full font-semibold transition
                ${
                  activeTab === t
                    ? "bg-[#C06014] text-white"
                    : "text-[#003D33]"
                }`}
              >
                {t === "boy" ? "Boy's Detail" : "Girl's Detail"}
              </button>
            ))}
          </div>

          {/* Form */}
          <div className="space-y-4">
            <Input label="Name" value={person.name} onChange={(v) => setPerson({ ...person, name: v })} />
            <Input type="date" placeholder="Date of Birth"  label="Date of Birth"  value={person.dob}  onChange={(v) => setPerson({ ...person, dob: v })} className="w-full border border-gray-400 h-10 rounded-md " />
            <Input type="time" label="Time of Birth" value={person.time} onChange={(v) => setPerson({ ...person, time: v })} />
            <Input label="Birth Place (City)" value={person.place} onChange={(v) => setPerson({ ...person, place: v })} />
          </div>

          <button
            onClick={handleMatch}
            disabled={loading}
            className="w-full mt-6 bg-[#C06014] hover:bg-[#D47C3A] text-white py-3 rounded-full font-semibold disabled:opacity-60"
          >
            {loading ? "Matching..." : "Match Horoscope"}
          </button>

          {/* RESULT SECTION */}
          {report && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 border rounded-xl p-5 bg-[#F7F3E9]"
            >
              <h3 className="text-xl font-bold text-[#003D33] mb-3">
                Match Summary
              </h3>

              <div className="grid grid-cols-2 gap-4 text-sm">
               <Info
  label="Guna Score"
  value={
    report.summary.guna_score
      ? `${report.summary.guna_score} / ${report.summary.max_score} (${report.summary.guna_result})`
      : "-"
  }
/>

               <Info
  label="Manglik Status"
  value={report.summary.manglik_status || "No major Manglik issue"}
/>

                <Info
  label="Compatibility"
  value={report.summary.compatibility || "-"}
/>

              </div>
              {report && (
  <button
    onClick={() => downloadMatchReportPdf(report, boy, girl)}
    className="mt-4 w-full bg-[#003D33] hover:bg-[#005A4A] text-white py-2 rounded-full font-semibold"
  >
    Download Full Match Report (PDF)
  </button>
)}

            </motion.div>
          )}
        </div>

        {/* HISTORY */}
        <div className="bg-white border border-[#B2C5B2] rounded-2xl p-5">
          <h3 className="font-semibold text-[#003D33] mb-3">
            Saved Matches
          </h3>

          {history.length === 0 && (
            <p className="text-sm text-[#00695C]">No saved matches</p>
          )}

          <div className="space-y-3">
            {history.map((item) => (
              <div
                key={item.id}
                className="border rounded-xl p-3 hover:bg-[#F7F3E9]"
              >
                <div
                  onClick={() => loadHistory(item)}
                  className="cursor-pointer"
                >
                  <p className="font-semibold">
                    {item.boy.name} & {item.girl.name}
                  </p>
                  <p className="text-xs text-[#00695C]">
                    {item.boy.place} • {item.girl.place}
                  </p>
                </div>

                <button
                  onClick={() => deleteHistory(item.id)}
                  className="text-red-500 text-xs mt-2"
                >
                  <FaTrash />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- SMALL COMPONENTS ---------------- */
function Input({ label, value, onChange, type = "text" }) {
  return (
    <div>
      <label className="block text-sm font-medium text-[#003D33] mb-1">
        {label} *
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        
        className="w-full border border-[#B2C5B2] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#C06014]"
        max={new Date().toISOString().split("T")[0]}
      />
    </div>
  );
}

function Info({ label, value }) {
  return (
    <div>
      <p className="text-xs text-[#00695C]">{label}</p>
      <p className="font-semibold text-[#003D33]">{value || "-"}</p>
    </div>
  );
}
