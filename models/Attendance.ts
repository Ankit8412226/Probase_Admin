import { model, models, Schema } from "mongoose";

const attendanceSchema = new Schema(
  {
    _id: { type: String, required: true },
    userId: { type: String, required: true },
    userName: { type: String, required: true },
    userRole: { type: String, required: true },
    date: { type: String, required: true }, // YYYY-MM-DD
    loginTime: { type: String, required: true },
    logoutTime: { type: String, required: false },
    method: { type: String, enum: ["face", "password"], required: true },
    status: { type: String, enum: ["Present", "Late"], required: true },
  },
  {
    timestamps: true,
  }
);

const Attendance = models.Attendance || model("Attendance", attendanceSchema);

export default Attendance;
