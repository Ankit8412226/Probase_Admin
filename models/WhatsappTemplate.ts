import { model, models, Schema } from "mongoose";

const whatsappTemplateSchema = new Schema(
  {
    _id: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    templateText: { type: String, required: true },
    mediaUrl: { type: String, required: false },
  },
  {
    timestamps: true,
  }
);

const WhatsappTemplate = models.WhatsappTemplate || model("WhatsappTemplate", whatsappTemplateSchema);
export default WhatsappTemplate;
