import { connectDB } from "@/lib/db";
import Shipment from "@/models/Shipment";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";

export async function GET(req) {
  try {
    const token = getTokenFromRequest(req);
    const user = verifyToken(token);

    if (!user || user.role !== "admin") {
      return Response.json(
        { ok: false, message: "Forbidden" },
        { status: 403 }
      );
    }

    await connectDB();

    const shipments = await Shipment.find({})
      .populate("userId", "name email") // ✅ THIS IS THE FIX
      .sort({ createdAt: -1 });

    return Response.json({
      ok: true,
      shipments,
    });

  } catch (err) {
    console.error("ADMIN SHIPMENTS ERROR:", err);
    return Response.json(
      { ok: false, message: "Server error" },
      { status: 500 }
    );
  }
}
