import express from "express";
import sendOtp from "../../../core/middleware/sendOtp.js";
import verifyChangeEmail from "../controller/verifyChangeEmail.js";
import { validateRequest } from "../../../core/middleware/validationRequest.js";
import authenticationMiddleware from "../../../core/middleware/authentication.js";
import verifyOtp from "../../../core/middleware/verifyOtp.js";

const router = express.Router();

router.route("/send-otp").post(sendOtp.excecute);

// dùng cho verify otp khi login hoặc đăng ký
router.route("/verify-otp").post(verifyOtp.excecute);

// dùng cho verify otp khi đổi email
router.post(
  "/verify-change-email",
  authenticationMiddleware.verifyToken,
  validateRequest(verifyChangeEmail.validate),
  verifyChangeEmail.excecute
);

export default router;