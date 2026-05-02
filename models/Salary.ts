import { model, models, Schema } from "mongoose";

const salarySchema = new Schema(
  {
    _id: { type: String, required: true },
    employeeId: { type: String, required: true, ref: "Employee" },
    month: { type: String, required: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: ["Paid", "Pending"], required: true },
    paidDate: { type: String },
  },
  {
    timestamps: true,
  },
);

const Salary = models.Salary || model("Salary", salarySchema);

export default Salary;
