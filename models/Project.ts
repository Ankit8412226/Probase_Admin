import { model, models, Schema } from "mongoose";

const projectSchema = new Schema(
  {
    _id: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    clientId: { type: String, required: true, ref: "Client" },
    status: { type: String, enum: ["Active", "Completed"], required: true },
    budget: { type: Number, required: true },
    assignedEmployeeIds: [{ type: String, ref: "Employee" }],
    startDate: { type: String, required: true },
    endDate: { type: String },
  },
  {
    timestamps: true,
  },
);

const Project = models.Project || model("Project", projectSchema);

export default Project;
