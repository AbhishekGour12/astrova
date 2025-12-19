import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const downloadMatchReportPdf = (report, boy, girl) => {
  const doc = new jsPDF();

  /* ---------------- TITLE ---------------- */
  doc.setFontSize(18);
  doc.text("Kundli Matching Report", 105, 15, { align: "center" });

  doc.setFontSize(10);
  doc.text(
    `Generated on: ${new Date().toLocaleDateString()}`,
    105,
    22,
    { align: "center" }
  );

  /* ---------------- PARTNER DETAILS ---------------- */
  doc.setFontSize(12);
  doc.text("Partner Details", 14, 32);

  autoTable(doc, {
    startY: 36,
    theme: "grid",
    head: [["", "Male", "Female"]],
    body: [
      ["Name", boy.name, girl.name],
      ["DOB", boy.dob, girl.dob],
      ["Time", boy.time, girl.time],
      ["Place", boy.place, girl.place],
    ],
  });

  /* ---------------- SUMMARY ---------------- */
  let y = doc.lastAutoTable.finalY + 10;
  doc.setFontSize(12);
  doc.text("Match Summary", 14, y);

  autoTable(doc, {
    startY: y + 4,
    theme: "grid",
    body: [
      ["Guna Score", `${report.summary.guna_score} / ${report.summary.max_score}`],
      ["Minimum Required", report.summary.minimum_required],
      ["Compatibility", report.summary.compatibility],
    ],
  });

  /* ---------------- ASHTAKOOT ---------------- */
  y = doc.lastAutoTable.finalY + 10;
  doc.setFontSize(12);
  doc.text("Ashtakoot Analysis", 14, y);

  const ashtakootRows = Object.entries(report.ashtakoot)
    .filter(([k]) => !["total", "conclusion"].includes(k))
    .map(([key, v]) => [
      key.toUpperCase(),
      v.male_koot_attribute,
      v.female_koot_attribute,
      `${v.received_points} / ${v.total_points}`,
    ]);

  autoTable(doc, {
    startY: y + 4,
    theme: "grid",
    head: [["Koot", "Male", "Female", "Score"]],
    body: ashtakootRows,
  });

  /* ---------------- ASHTAKOOT CONCLUSION ---------------- */
  y = doc.lastAutoTable.finalY + 10;
  doc.setFontSize(12);
  doc.text("Ashtakoot Conclusion", 14, y);

  doc.setFontSize(10);
  doc.text(
    doc.splitTextToSize(report.ashtakoot.conclusion.report, 180),
    14,
    y + 6
  );

  /* ---------------- MANGLIK ---------------- */
  y += 30;
  doc.setFontSize(12);
  doc.text("Manglik Analysis", 14, y);

  doc.setFontSize(10);
  doc.text(
    doc.splitTextToSize(report.manglik.conclusion.report, 180),
    14,
    y + 6
  );

  /* ---------------- OBSTRUCTIONS ---------------- */
  if (report.obstructions?.is_present) {
    y += 30;
    doc.setFontSize(12);
    doc.text("Dosha / Obstructions", 14, y);

    doc.setFontSize(10);
    doc.text(
      doc.splitTextToSize(report.obstructions.vedha_report, 180),
      14,
      y + 6
    );
  }

  /* ---------------- SAVE ---------------- */
  doc.save(
    `Kundli_Match_${boy.name}_${girl.name}.pdf`
      .replace(/\s+/g, "_")
      .toLowerCase()
  );
};
