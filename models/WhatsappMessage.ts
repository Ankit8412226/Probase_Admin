import { model, models, Schema } from "mongoose";

const whatsappMessageSchema = new Schema(
  {
    _id: { type: String, required: true },
    senderPhone: { type: String, required: true },
    senderName: { type: String, required: true },
    messageText: { type: String, required: true },
    timestamp: { type: String, required: true },
    sessionId: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

const WhatsappMessage = models.WhatsappMessage || model("WhatsappMessage", whatsappMessageSchema);
export default WhatsappMessage;
