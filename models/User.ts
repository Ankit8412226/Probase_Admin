import { model, models, Schema } from "mongoose";

const userSchema = new Schema(
  {
    _id: { type: String, required: true },
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    role: { type: String, enum: ["admin", "manager", "business", "employee"], required: true },
    password: { type: String, required: true },
    faceDescriptor: { type: [Number], required: false },
  },
  {
    timestamps: true,
  },
);

const User = models.User || model("User", userSchema);

export default User;
