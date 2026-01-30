import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Shipment from "@/models/Shipment";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";

export async function GET(req) {
  const token = getTokenFromRequest(req);
  const decoded = verifyToken(token);
  if (!decoded) return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  if (decoded.role !== "admin") return NextResponse.json({ ok: false, message: "Forbidden" }, { status: 403 });

  await connectDB();
  const shipments = await Shipment.find().populate("userId", "name email role").sort({ createdAt: -1 });

  return NextResponse.json({
    ok: true,
    shipments: shipments.map((s) => ({
      id: s._id.toString(),
      trackingNumber: s.trackingNumber,
      mpsId: s.mpsId,
      createdAt: s.createdAt,
      sender: s.sender,
      recipient: s.recipient,
      user: {
        id: s.userId?._id?.toString(),
        name: s.userId?.name,
        email: s.userId?.email,
        role: s.userId?.role,
      },
    })),
  });
}
