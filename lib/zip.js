import JSZip from "jszip";

export async function downloadZip(results) {
  const zip = new JSZip();

  results.forEach(r => {
    const binary = atob(r.labelBase64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    zip.file(`${r.trackingNumber}.pdf`, bytes);
  });

  const blob = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "dpd-labels.zip";
  a.click();
}
