import { Schema, model } from "mongoose";

export const RoleTypeEnum = Object.freeze(
  {
    SUPER_ADMIN: "SUPER_ADMIN",
    ADMIN: "ADMIN",
    USER: "USER",
  },
  { _id: false }
);

const userSchema = new Schema(
  {
    userName: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, unique: true, sparse: true },
    password: { type: String, required: true },
    refreshToken: { type: String, select: false },
    // fullName: { type: String },
    avatar: { type: String },
    role: {
      type: String,
      required: true,
      index: true,
      enum: Object.values(RoleTypeEnum),
    },
  },
  { timestamps: true }
);

export default model("User", userSchema);
