import mongoose from "mongoose";

const ShipmentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    recipient: {
      name1: String,
      street: String,
      city: String,
      zipCode: String,
      country: String,
    },

    trackingNumber: {
      type: String,
      required: true,
    },

    mpsId: String,

    source: {
      type: String,
      enum: ["single", "bulk"],
      default: "single",
    },
  },
  { timestamps: true }
);

export default mongoose.models.Shipment ||
  mongoose.model("Shipment", ShipmentSchema);
