import jsPDF from "jspdf";

/* 🔹 GENERATE RECEIPT ID */
export const generateReceiptId = (booking) => {
  const datePart = booking.date.replaceAll("-", "");
  const timePart = booking.time.split(" - ")[0].replace(":", "");
  const idPart = booking.id.slice(0, 4).toUpperCase();

  return `SR-${datePart}-${timePart}-${idPart}`;
};

/* 🎨 THEMED PDF RECEIPT */
export const downloadReceiptPDF = (booking, roomName) => {
  const doc = new jsPDF();
  const receiptId = generateReceiptId(booking);

  /* ================= HEADER ================= */
  doc.setFillColor(33, 150, 243);
  doc.rect(0, 0, 210, 30, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("SMART STUDY ROOM BOOKING", 105, 20, { align: "center" });

  doc.setTextColor(0, 0, 0);

  /* ================= PROJECT TITLE ================= */
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(
    "IoT-Based Smart Study Room Allocation",
    105,
    45,
    { align: "center" }
  );

  doc.setDrawColor(33, 150, 243);
  doc.line(30, 48, 180, 48);

  /* ================= RECEIPT DETAILS TABLE ================= */
  doc.setFontSize(11);

  const tableStartY = 65;
  const rowHeight = 10;
  const tableWidth = 140;
  const startX = (210 - tableWidth) / 2;

  const labelX = startX + 6;
  const valueX = startX + 65;

  const details = [
    ["Receipt ID", receiptId],
    ["Room Name", roomName || "N/A"],
    ["Date", booking.date],
    ["Time Slot", booking.time],
    ["Participants", booking.members ?? "N/A"],
    ["Booked By", booking.userEmail],
  ];

  doc.setDrawColor(180);
  doc.rect(
    startX,
    tableStartY - 6,
    tableWidth,
    details.length * rowHeight + 6
  );

  details.forEach((row, index) => {
    const y = tableStartY + index * rowHeight;

    if (index !== 0) {
      doc.line(startX, y - 5, startX + tableWidth, y - 5);
    }

    doc.setFont("helvetica", "bold");
    doc.text(`${row[0]} :`, labelX, y);

    doc.setFont("helvetica", "normal");
    doc.text(String(row[1]), valueX, y);
  });

  /* ================= STATUS BADGE ================= */
  const badgeY = tableStartY + details.length * rowHeight + 15;

  doc.setFillColor(76, 175, 80);
  doc.rect(startX, badgeY, tableWidth, 12, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.text("APPROVED & ACTIVE", 105, badgeY + 8, { align: "center" });

  doc.setTextColor(0, 0, 0);

  /* ================= FOOTER (JUSTIFIED & ALIGNED) ================= */
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");

  const footerText =
    "This receipt confirms that the study room booking has been " +
    "successfully approved by the administrator. The room capacity " +
    "and time slot have been verified as per system rules.\n\n" +
    "This document is system-generated and valid without signature.";

  const wrappedFooter = doc.splitTextToSize(
    footerText,
    tableWidth
  );

  doc.text(wrappedFooter, startX, badgeY + 30, {
    maxWidth: tableWidth,
    align: "left",
  });

  /* ================= PAGE FOOTER ================= */
  doc.setFontSize(10);
  doc.setTextColor(120);
  doc.text(
    "Smart Study Room Management System | Generated Automatically",
    105,
    285,
    { align: "center" }
  );

  /* ================= SAVE ================= */
  doc.save(`${receiptId}.pdf`);
};
