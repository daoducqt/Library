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
    email: { type: String, unique: true, sparse: true },
    phone: { type: String, unique: true, sparse: true },
    password: { type: String, required: true },
    refreshToken: { type: String, select: false },
    fullName: { type: String, required: true },
    avatar: { type: String },
    role: {
      type: String,
      required: true,
      index: true,
      enum: Object.values(RoleTypeEnum),
    },

    status: {
    type: String,
    enum: ["ACTIVE", "BANNED"],
    default: "ACTIVE"
  },


    // OTP cho đăng ký
    pendingEmail: String,
    otpCode: { type: String, select: false },
    otpExpires: { type: Date, select: false },
    otpPurpose: { type: String, select: false }, 
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

//  BẮT BUỘC: email hoặc phone phải có ít nhất 1
userSchema.pre("validate", function (next) {
  if (!this.email && !this.phone) {
    return next(
      new Error("Người dùng phải có ít nhất email hoặc số điện thoại")
    );
  }
  next();
});

export default model("User", userSchema);
