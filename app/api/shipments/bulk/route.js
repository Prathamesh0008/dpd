import { validateOrders, storeOrders } from "@/lib/dpd";
import { connectDB } from "@/lib/db";
import Shipment from "@/models/Shipment";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";
import { mergeBase64Pdfs } from "@/lib/mergePdf";

/* ---------------- CSV PARSER ---------------- */
function parseCsv(text) {
  const [header, ...rows] = text.trim().split("\n");
  const keys = header.split(",").map(k => k.trim());

  return rows.map(row => {
    const values = row.split(",");
    const obj = {};
    keys.forEach((k, i) => {
      obj[k] = values[i]?.trim() || "";
    });
    return obj;
  });
}

/* ---------------- FIXED SENDER ---------------- */
const FIXED_SENDER = {
  name1: "Your Company",
  street: "Your Street",
  city: "Amsterdam",
  zipCode: "1011AB",
  country: "NL",
  weight: "1",
};

export async function POST(req) {
  try {
    /* ---------- AUTH ---------- */
    const token = getTokenFromRequest(req);
    const user = verifyToken(token);

    if (!user) {
      return Response.json(
        { ok: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    /* ---------- DB ---------- */
    await connectDB();

    /* ---------- FILE ---------- */
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      throw new Error("CSV file missing");
    }

    const csvText = await file.text();
    const rows = parseCsv(csvText);

    if (!rows.length) {
      throw new Error("CSV is empty");
    }

    const results = [];
    const pdfs = [];

    /* ---------- LOOP ---------- */
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
        if (!v.success) throw new Error("Validation failed");

        const s = await storeOrders(payload);
        if (!s.trackingNumber || !s.labelBase64) {
          throw new Error("DPD store failed");
        }

        /* ---------- SAVE EACH SHIPMENT ---------- */
        await Shipment.create({
          userId: user.id, // 👈 FROM JWT
          recipient: payload.recipient,
          trackingNumber: s.trackingNumber,
          mpsId: s.mpsId,
          source: "bulk",
        });

        results.push({
          name: row.name,
          success: true,
          trackingNumber: s.trackingNumber,
        });

        pdfs.push(s.labelBase64);

        // DPD rate limit safety
        await new Promise(r => setTimeout(r, 300));

      } catch (err) {
        results.push({
          name: row.name,
          success: false,
          error: err.message,
        });
      }
    }

    /* ---------- MERGE PDFs ---------- */
    const mergedPdfBase64 = await mergeBase64Pdfs(pdfs);

    return Response.json({
      ok: true,
      results,
      mergedPdfBase64,
    });

  } catch (err) {
    console.error("BULK ERROR:", err);
    return Response.json(
      { ok: false, message: err.message },
      { status: 500 }
    );
  }
}
