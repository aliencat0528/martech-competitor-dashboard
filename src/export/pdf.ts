/**
 * L4 匯出層：PDF。用 `@media print` ＋ `window.print()`，零依賴。
 *
 * **不引入 jsPDF／html2canvas**：那類套件產出的 PDF 是點陣圖，字選不了也搜不了，
 * 對「可以匯出報告」這個需求而言等於沒做（← MC-006）。
 */
export function exportPdf(): void {
  window.print();
}
