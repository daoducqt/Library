const { Schema, model } = require("mongoose");

const UserSchema = new Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // hash trước khi lưu
    role: { type: String, default: "user" },
  },
  { timestamps: true }
);

module.exports = model("User", UserSchema);
