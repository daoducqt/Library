import express from "express";
import register from "../controllers/register.js";
import login from "../controllers/login.js";
import { validateRequest } from "../../../core/middleware/validationRequest.js";
import authenticationMiddleware from "../../../core/middleware/authentication.js";
import { RoleTypeEnum } from "../models/User.js";
import create from "../controllers/create.js";
import getList from "../controllers/getList.js";
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
import verifyRegistration from "../controllers/verifyRegistration.js";
import forgotPass from "../controllers/forgotPass.js";
import resetPass from "../controllers/resetPass.js";
import changePass from "../controllers/changePass.js";

const router = express.Router();

// ============================================
// PUBLIC ROUTES (không cần auth)
// ============================================
router.post("/register", validateRequest(register.validate), register.excecute);
router.post("/login", validateRequest(login.validate), login.excecute);
router.get("/google/url", googleUrl.excecute);
router.get("/google/callback", googleCallBack.excecute);
router.post("/verify-registration", validateRequest(verifyRegistration.validate), verifyRegistration.excecute);

// FORGOT PASSWORD - PUBLIC (không cần token)
router.post("/forgot-password", validateRequest(forgotPass.validate), forgotPass.excecute);
router.post("/reset-password", validateRequest(resetPass.validate), resetPass.excecute);

// ============================================
// AUTHENTICATED ROUTES (cần token)
// ============================================
router.post("/logout", authenticationMiddleware.verifyToken, logout.excecute);

// CHANGE PASSWORD - Protected
router.post(
  "/change-password",
  authenticationMiddleware.verifyToken,
  validateRequest(changePass.validate),
  changePass.excecute
);

// CHANGE EMAIL - Protected
router.post(
  "/request-change-email",
  authenticationMiddleware.verifyToken,
  validateRequest(requestChangeEmail.validate),
  requestChangeEmail.excecute
);

// UPDATE AVATAR - Protected
router.put(
  "/update-avatar",
  authenticationMiddleware.verifyToken,
  uploadAvatar.single("avatar"),
  updateAvatar.excecute
);

// UPDATE PROFILE - Protected
router.put("/update-profile/:id", authenticationMiddleware.verifyToken, updateProfile.excecute);

// ============================================
// ADMIN ROUTES
// ============================================
const adminAuth = [
  authenticationMiddleware.verifyToken,
  authenticationMiddleware.verifyRole(RoleTypeEnum.ADMIN, RoleTypeEnum.SUPER_ADMIN)
];

router.post("/create", adminAuth, validateRequest(create.validate), create.excecute);
router.patch("/update-role-status/:id", adminAuth, updateRoleStatus.excecute);
router.delete("/delete/:id", adminAuth, deleteById.excecute);


router.get("/", getList.excecute); // GET /user (list all)
router.get("/:id", getUserId.excecute); // GET /user/:id (by ID)

export default router;