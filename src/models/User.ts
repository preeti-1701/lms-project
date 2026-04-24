import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  role: "Admin" | "Trainer" | "Student";
  status: "Active" | "Disabled";
  lastSeen: string;
  ip: string;
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    role: { 
      type: String, 
      enum: ["Admin", "Trainer", "Student"], 
      required: true 
    },
    status: { 
      type: String, 
      enum: ["Active", "Disabled"], 
      required: true 
    },
    lastSeen: { type: String, required: true },
    ip: { type: String, required: true },
  },
  { timestamps: true }
);

export const User = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
