import { model, models, Schema } from "mongoose";

const leadSchema = new Schema(
  {
    _id: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    contact: { type: String, required: true, trim: true },
    source: { type: String, required: true, trim: true },
    status: { type: String, enum: ["Converted", "Not Converted"], required: true },
    stage: {
      type: String,
      enum: ["New", "Qualified", "Proposal Sent", "Negotiation", "Won", "Lost"],
      required: true,
    },
    ownerId: { type: String, required: true, ref: "User" },
    value: { type: Number, required: true },
    acquisitionCost: { type: Number, required: true },
    expectedCloseDate: { type: String },
    lastContactDate: { type: String },
    convertedAt: { type: String },
    lostAt: { type: String },
    lostReason: { type: String },
    notes: { type: String },
  },
  {
    timestamps: true,
  },
);

const Lead = models.Lead || model("Lead", leadSchema);

export default Lead;
