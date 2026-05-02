import { model, models, Schema } from "mongoose";

const targetSchema = new Schema(
  {
    _id: { type: String, required: true },
    month: { type: String, required: true },
    ownerId: { type: String, required: true, ref: "User" },
    targetRevenue: { type: Number, required: true },
    targetConversions: { type: Number, required: true },
  },
  {
    timestamps: true,
  },
);

const Target = models.Target || model("Target", targetSchema);

export default Target;
