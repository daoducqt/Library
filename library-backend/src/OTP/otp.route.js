import express from "express";
import sendOtp from "../../core/middleware/sendOtp.js";

const router = express.Router();

router.route("/send-otp").post(sendOtp.excecute);


export default router;