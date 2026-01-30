import { PDFDocument } from "pdf-lib";

export async function mergeBase64Pdfs(base64List) {
  const mergedPdf = await PDFDocument.create();

  for (const base64 of base64List) {
    if (!base64) continue;

    const pdfBytes = Buffer.from(base64, "base64");
    const pdf = await PDFDocument.load(pdfBytes);

    const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
    pages.forEach((p) => mergedPdf.addPage(p));
  }

  const mergedBytes = await mergedPdf.save();
  return Buffer.from(mergedBytes).toString("base64");
}
