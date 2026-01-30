export function downloadPdfFromBase64(base64, fileName = "label.pdf") {
  if (!base64) return;

  // IMPORTANT: remove spaces/new lines -> fixes corrupted PDF
  const clean = String(base64).replace(/\s/g, "");

  const bytes = Uint8Array.from(atob(clean), (c) => c.charCodeAt(0));
  const blob = new Blob([bytes], { type: "application/pdf" });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 3000);
}
