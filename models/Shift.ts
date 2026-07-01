import { model, models, Schema } from "mongoose";

const shiftSchema = new Schema(
  {
    _id: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    startTime: { type: String, required: true }, // "09:00"
    endTime: { type: String, required: true },   // "18:00"
    assignedEmployeeIds: { type: [String], default: [] },
  },
  {
    timestamps: true,
  }
);

const Shift = models.Shift || model("Shift", shiftSchema);

export default Shift;
