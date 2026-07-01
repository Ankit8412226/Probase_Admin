import { model, models, Schema } from "mongoose";

const whatsappLogSchema = new Schema(
  {
    _id: { type: String, required: true },
    recipientName: { type: String, required: true },
    recipientPhone: { type: String, required: true },
    message: { type: String, required: true },
    status: { type: String, enum: ["Sent", "Failed"], required: true },
    type: { type: String, enum: ["attendance", "invoice", "proposal", "test"], required: true },
  },
  {
    timestamps: true,
  }
);

export const WhatsappLog = models.WhatsappLog || model("WhatsappLog", whatsappLogSchema);

const whatsappConfigSchema = new Schema(
  {
    _id: { type: String, required: true }, // Always "config"
    gatewayUrl: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

export const WhatsappConfig = models.WhatsappConfig || model("WhatsappConfig", whatsappConfigSchema);
