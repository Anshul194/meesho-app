import FileSaver from "file-saver";
import XLSX from "sheetjs-style";

const fileType =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
const fileExtension = ".xlsx";
export function exportToExcel(exceldata, fileName) {
  const ws = XLSX.utils.json_to_sheet(exceldata);
  const wb = { Sheets: { data: ws }, SheetNames: ["data"] };
  const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
  const data = new Blob([excelBuffer], { type: fileType });
  FileSaver.saveAs(data, fileName + fileExtension);
}
