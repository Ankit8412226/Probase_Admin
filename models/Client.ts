import { model, models, Schema } from "mongoose";

const clientSchema = new Schema(
  {
    _id: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    company: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, required: true, trim: true },
    revenue: { type: Number, required: true },
    accountManagerId: { type: String, required: true, ref: "User" },
    contractStartDate: { type: String, required: true },
    contractEndDate: { type: String, required: true },
    renewalStatus: {
      type: String,
      enum: ["On Track", "At Risk", "Renewed", "Expired"],
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

const Client = models.Client || model("Client", clientSchema);

export default Client;
