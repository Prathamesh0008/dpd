import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import Shipment from "@/models/Shipment";
import { getTokenFromRequest, verifyToken } from "@/lib/auth";
import { validateOrders, storeOrders } from "@/lib/dpd";

export async function POST(req) {
  try {
    /* ---------------- AUTH ---------------- */
    const token = getTokenFromRequest(req);
    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json(
        { ok: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    /* ---------------- BODY ---------------- */
    const body = await req.json();

    if (!body?.sender || !body?.recipient || !body?.sendingDepot || !body?.product) {
      return NextResponse.json(
        { ok: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    /* ---------------- VALIDATE ---------------- */
    const validate = await validateOrders(body);

    console.log("VALIDATE RESULT:", validate);

    if (!validate.success) {
      return NextResponse.json(
        {
          ok: false,
          step: "validateOrders",
          message: "DPD validateOrders failed",
          dpdResponse: validate.raw,
        },
        { status: 400 }
      );
    }

    /* ---------------- STORE ---------------- */
    const store = await storeOrders(body);

    console.log("STORE RESULT:", store);

   if (!store.labelBase64 || !store.trackingNumber) {
  return NextResponse.json(
    {
      ok: false,
      step: "storeOrders",
      message: "DPD did not return label or tracking number",
      dpdResponse: store.raw,
    },
    { status: 400 }
  );
}


    /* ---------------- SAVE ---------------- */
    await connectDB();

    const shipment = await Shipment.create({
      userId: decoded.userId,
      sender: body.sender,
      recipient: body.recipient,
      trackingNumber: store.trackingNumber,
      mpsId: store.mpsId,
      labelBase64: store.labelBase64,
    });

    /* ---------------- SUCCESS ---------------- */
    return NextResponse.json({
      ok: true,
      shipment: {
        id: shipment._id.toString(),
        trackingNumber: shipment.trackingNumber,
        mpsId: shipment.mpsId,
        labelBase64: shipment.labelBase64,
        createdAt: shipment.createdAt,
        recipient: shipment.recipient,
      },
    });

  } catch (err) {
    console.error("CREATE SHIPMENT ERROR:", err);
    return NextResponse.json(
      { ok: false, message: "Internal server error", error: String(err) },
      { status: 500 }
    );
  }
}
