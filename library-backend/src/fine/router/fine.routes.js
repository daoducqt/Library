import express from "express";
import authenticationMiddleware from "../../../core/middleware/authentication.js";
import { RoleTypeEnum } from "../../user/models/User.js";
import getAllFines from "../controller/getAllFines.js";
import getMyFines from "../controller/getMyFines.js";
import payFine from "../controller/payFine.js";
import confirmPay from "../controller/confirmPay.js";
// import createVnpayPayment from "../controller/createVnpayPayment.js";
// import vnpayReturn from "../controller/vnpayReturn.js";
// import vnpayIPN from "../controller/vnpayIPN.js";
import createZaloQR from "../controller/createZaloQR.js";
import zaloCallback from "../controller/zaloCallback.js";
import queryZaloOrder from "../controller/queryzaloOder.js";
import createVietQR from "../controller/createVietQR.js";
import vietqrwebhook from "../controller/vietqrwebhook.js";
import createTestFine from "../controller/createTestFine.js";

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

// router.post("/create-vnpay-payment/:fineId", userAuth, createVnpayPayment.excecute);

// router.get("/vnpay-return", vnpayReturn.excecute);
// router.get("/vnpay-ipn", vnpayIPN.excecute);
// router.post("/vnpay-ipn", vnpayIPN.excecute);

router.post("/create-zalo-qr/:fineId", userAuth, createZaloQR.excecute);
router.post("/zalopay-callback", zaloCallback.excecute);
router.get("/query-zalo-order/:fineId", userAuth, queryZaloOrder.excecute);

// vietqr
router.post("/create-viet-qr/:fineId", userAuth, createVietQR.excecute);
router.post("/vietqr-webhook", vietqrwebhook.excecute);

router.post("/create-test-fine", userAuth, createTestFine.excecute);

export default router;