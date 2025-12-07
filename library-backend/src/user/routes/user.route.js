import express from "express";
import register from "../controllers/register.js";
import login from "../controllers/login.js";
import { validateRequest } from "../../../core/middleware/validationRequest.js";
import authenticationMiddleware from "../../../core/middleware/authentication.js";
import { RoleTypeEnum } from "../models/User.js";
import create from "../controllers/create.js";
import getList from "../controllers/getList.js";
import resendOtp from "../../../core/middleware/resendOtp.js";
import verifyOtp from "../../../core/middleware/verifyOtp.js";
import googleUrl from "../controllers/googleUrl.js";
import googleCallBack from "../controllers/googleCallBack.js";

import getUserId from "../controllers/getUserId.js";
import updateProfile from "../controllers/updateProfile.js";
import updateRoleStatus from "../controllers/updateRoleStatus.js";
import updateAvatar from "../controllers/updateAvatar.js";
import uploadAvatar from "../../../core/middleware/uploadAvatar.js";
import deleteById from "../controllers/delete.js"
import logout from "../controllers/logout.js";
import requestChangeEmail from "../controllers/changEmail.js"

const router = express.Router();

// Public routes
router.route("/register").post(validateRequest(register.validate), register.excecute);
router.route("/login").post(validateRequest(login.validate), login.excecute);
router.route("/resend-otp").post(resendOtp.excecute);
// router.route("/verify-otp").post(verifyOtp.excecute);
router.route("/google/url").get(googleUrl.excecute);
router.route("/google/callback").get(googleCallBack.excecute);
router.route("/").get(getList.excecute);
router.route("/:id").get(getUserId.excecute);


// Routes for logged-in users
router.route("/update-profile/:id").put(authenticationMiddleware.verifyToken, updateProfile.excecute);
router.route("/logout").post(authenticationMiddleware.verifyToken, logout.excecute);

// Admin/Super Admin only
router.route("/create").post(
  authenticationMiddleware.verifyToken,
  authenticationMiddleware.verifyRole(RoleTypeEnum.ADMIN, RoleTypeEnum.SUPER_ADMIN),
  validateRequest(create.validate),
  create.excecute
);
router.route("/update-role-status/:id").patch(
  authenticationMiddleware.verifyToken,
  authenticationMiddleware.verifyRole(RoleTypeEnum.ADMIN, RoleTypeEnum.SUPER_ADMIN),
  updateRoleStatus.excecute
);
router.route("/delete/:id").delete(
  authenticationMiddleware.verifyToken,
  authenticationMiddleware.verifyRole(RoleTypeEnum.ADMIN, RoleTypeEnum.SUPER_ADMIN),
  deleteById.excecute
);

// phần này cho user upload avatar
router.route("/update-avatar")
  .put(
    authenticationMiddleware.verifyToken,
    uploadAvatar.single("avatar"),
    updateAvatar.excecute
  );

// đổi email request
router.post(
  "/request-change-email",
  authenticationMiddleware.verifyToken,
  validateRequest(requestChangeEmail.validate),
  requestChangeEmail.excecute
);

export default router;