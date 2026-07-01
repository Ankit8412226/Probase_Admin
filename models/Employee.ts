import { model, models, Schema } from "mongoose";

const employeeSchema = new Schema(
  {
    _id: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    role: { type: String, required: true, trim: true },
    salary: { type: Number, required: true },
    joiningDate: { type: String, required: true },
    loginRole: { type: String, enum: ["admin", "manager", "business", "employee"], required: false },
    password: { type: String, required: false },
    faceDescriptor: { type: [Number], required: false },
  },
  {
    timestamps: true,
  },
);

const Employee = models.Employee || model("Employee", employeeSchema);

export default Employee;
