import { model, models, Schema } from "mongoose";

const whatsappCampaignSchema = new Schema(
  {
    _id: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    templateText: { type: String, required: true },
    mediaUrl: { type: String, required: false },
    targetType: { type: String, enum: ["Leads", "Clients", "Custom"], required: true },
    status: { type: String, enum: ["Draft", "Running", "Completed", "Failed"], required: true },
    sentCount: { type: Number, default: 0 },
    totalCount: { type: Number, default: 0 },
    customContacts: { type: [Schema.Types.Mixed], default: [] },
  },
  {
    timestamps: true,
  }
);

const WhatsappCampaign = models.WhatsappCampaign || model("WhatsappCampaign", whatsappCampaignSchema);
export default WhatsappCampaign;
