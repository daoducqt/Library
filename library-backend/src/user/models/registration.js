import { Schema, model } from "mongoose";

const registrationSchema = new Schema(
    {
        fullName: { type: String, required: true },
        userName: { type: String, required:true},
        email: { type: String, required: true },
        phone: { type: String },
        password: { type: String, required: true },
        role: { type: String, required: true },
        otpCode: { type: String, required: true },
        otpExpires: { type: Date, required: true },
        createAt: {
            type: Date,
            default: Date.now,
            expires: 300 // 5 minutes
        }
    }
);

export default model("Registration", registrationSchema);