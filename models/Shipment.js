import mongoose from "mongoose";

const ShipmentSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    sender: { type: Object, required: true },
    recipient: { type: Object, required: true },

    trackingNumber: { type: String, default: "" },
    mpsId: { type: String, default: "" },

    labelBase64: { type: String, default: "" }, // PDF base64 from DPD
  },
  { timestamps: true }
);

export default mongoose.models.Shipment || mongoose.model("Shipment", ShipmentSchema);
