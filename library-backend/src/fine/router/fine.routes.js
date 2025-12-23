import express from "express";
import authenticationMiddleware from "../../../core/middleware/authentication.js";
import { RoleTypeEnum } from "../../user/models/User.js";
import getAllFines from "../controller/getAllFines.js";
import getMyFines from "../controller/getMyFines.js";
import payFine from "../controller/payFine.js";
import confirmPay from "../controller/confirmPay.js";

const router = express.Router();

const adminAuth = [
    authenticationMiddleware.verifyToken,
    authenticationMiddleware.verifyRole(RoleTypeEnum.ADMIN, RoleTypeEnum.SUPER_ADMIN),
];

const userAuth = [ authenticationMiddleware.verifyToken ];

// Admin routes
router.get("/all", adminAuth, getAllFines.excecute);

router.patch("/confirm-pay/:fineId", adminAuth, confirmPay.excecute);

// User routes
router.get("/my-fines", userAuth, getMyFines.excecute);

router.patch("/pay/:fineId", userAuth, payFine.excecute);

export default router;