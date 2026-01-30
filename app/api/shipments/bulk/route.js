import { validateOrders, storeOrders } from "@/lib/dpd";
import { mergeBase64Pdfs } from "@/lib/mergePdf";

function parseCsv(csv) {
  const [headerLine, ...lines] = csv.trim().split("\n");
  const headers = headerLine.split(",").map(h => h.trim());

  return lines.map(line => {
    const values = line.split(",");
    const row = {};
    headers.forEach((h, i) => {
      row[h] = values[i]?.trim() || "";
    });
    return row;
  });
}

const FIXED_SENDER = {
  name1: "Your Company",
  street: "Your Street",
  city: "Amsterdam",
  zipCode: "1011AB",
  country: "NL",
  weight: "1",
};

export async function POST(req) {
  console.log("🚀 BULK API HIT");

  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      throw new Error("CSV file missing");
    }

    const csvText = await file.text();
    const rows = parseCsv(csvText);

    if (!rows.length) {
      throw new Error("CSV empty");
    }

    if (rows.length > 20) {
      throw new Error("Bulk limit exceeded (20 max)");
    }

    const results = [];
    const pdfs = [];

    for (const row of rows) {
      try {
        const payload = {
          sendingDepot: "0511",
          product: "CL",
          sender: FIXED_SENDER,
          recipient: {
            name1: row.name,
            street: row.street,
            city: row.city,
            zipCode: row.zipCode,
            country: "NL",
          },
        };

        const v = await validateOrders(payload);
        if (!v.success) throw new Error("Validate failed");

        const s = await storeOrders(payload);
        if (!s.labelBase64) throw new Error("Store failed");

        results.push({
          name: row.name,
          success: true,
          trackingNumber: s.trackingNumber,
        });

        pdfs.push(s.labelBase64);

        await new Promise(r => setTimeout(r, 400)); // DPD rate limit

      } catch (err) {
        results.push({
          name: row.name,
          success: false,
          error: err.message,
        });
      }
    }

    const mergedPdfBase64 = await mergeBase64Pdfs(pdfs);

    return Response.json({
      ok: true,
      results,
      mergedPdfBase64,
    });

  } catch (err) {
    console.error("❌ BULK API CRASH:", err);
    return Response.json(
      { ok: false, message: err.message },
      { status: 500 }
    );
  }
}
