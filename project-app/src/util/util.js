import FileSaver from "file-saver";
import XLSX from "sheetjs-style";

const fileType =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
const fileExtension = ".xlsx";

function sanitizeFileName(name) {
  // Remove characters that can cause issues on some platforms
  return String(name).replace(/[:\\/*?|<>"\\]/g, "-").replace(/\s+/g, "_");
}

export function exportToExcel(exceldata, fileName) {
  try {
    console.log("exportToExcel: preparing file", fileName, "rows:", (exceldata && exceldata.length) || 0);
    const ws = XLSX.utils.json_to_sheet(exceldata);
    const wb = { Sheets: { data: ws }, SheetNames: ["data"] };
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: fileType });

    const safeName = sanitizeFileName(fileName) + fileExtension;

    // Try FileSaver first
    try {
      FileSaver.saveAs(data, safeName);
      console.log("exportToExcel: FileSaver.saveAs called for", safeName);
      return;
    } catch (fsErr) {
      console.error("exportToExcel: FileSaver.saveAs failed:", fsErr);
    }

    // Fallback: create an <a> element and click it
    try {
      const url = window.URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = safeName;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      console.log("exportToExcel: fallback download triggered for", safeName);
      return;
    } catch (fallbackErr) {
      console.error("exportToExcel: fallback download failed:", fallbackErr);
      alert("Download failed. Check console for details.");
    }
  } catch (err) {
    console.error("exportToExcel: unexpected error:", err);
    alert("Export failed. Check console for details.");
  }
}
