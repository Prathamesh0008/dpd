import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Shipment from "@/models/Shipment";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";

export async function GET(req) {
  const token = getTokenFromRequest(req);
  const decoded = verifyToken(token);
  if (!decoded) return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });

  await connectDB();
  const shipments = await Shipment.find({ userId: decoded.userId }).sort({ createdAt: -1 });

  return NextResponse.json({
    ok: true,
    shipments: shipments.map((s) => ({
      id: s._id.toString(),
      trackingNumber: s.trackingNumber,
      mpsId: s.mpsId,
      labelBase64: s.labelBase64,
      createdAt: s.createdAt,
      recipient: s.recipient,
    })),
  });
}
