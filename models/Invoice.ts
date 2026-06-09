import { model, models, Schema } from "mongoose";

const partPaymentSchema = new Schema(
  {
    amount: { type: Number, required: true },
    paidDate: { type: String, required: true },
  },
  { _id: false }
);

const invoiceSchema = new Schema(
  {
    _id: { type: String, required: true },
    invoiceNumber: { type: String, required: true, trim: true },
    clientId: { type: String, required: true, ref: "Client" },
    projectId: { type: String, ref: "Project" },
    ownerId: { type: String, required: true, ref: "User" },
    amount: { type: Number, required: true },
    issueDate: { type: String, required: true },
    dueDate: { type: String, required: true },
    status: {
      type: String,
      enum: ["Paid", "Pending", "Overdue", "Partially Paid"],
      required: true,
    },
    paidDate: { type: String },
    partPayments: {
      type: [partPaymentSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

const Invoice = models.Invoice || model("Invoice", invoiceSchema);

export default Invoice;
