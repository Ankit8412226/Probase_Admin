import { model, models, Schema } from "mongoose";

const proposalSchema = new Schema(
  {
    _id: { type: String, required: true },
    title: { type: String, required: true, trim: true },
    leadId: { type: String, required: true, ref: "Lead" },
    clientId: { type: String, ref: "Client" },
    ownerId: { type: String, required: true, ref: "User" },
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["Draft", "Sent", "Accepted", "Rejected", "Expired"],
      required: true,
    },
    sentDate: { type: String },
    validUntil: { type: String, required: true },
  },
  {
    timestamps: true,
  },
);

const Proposal = models.Proposal || model("Proposal", proposalSchema);

export default Proposal;
