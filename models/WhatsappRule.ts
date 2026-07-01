import { model, models, Schema } from "mongoose";

const whatsappRuleSchema = new Schema(
  {
    _id: { type: String, required: true },
    keyword: { type: String, required: true, lowercase: true, trim: true },
    replyText: { type: String, required: true },
    mediaUrl: { type: String, required: false },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

const WhatsappRule = models.WhatsappRule || model("WhatsappRule", whatsappRuleSchema);
export default WhatsappRule;
