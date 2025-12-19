import express from 'express';
import { validateRequest } from "../../../core/middleware/validationRequest.js";
import authenticationMiddleware from "../../../core/middleware/authentication.js";
import { RoleTypeEnum } from "../../user/models/User.js";
import stockIn from '../controller/stockin.js';
import stockout from '../controller/stockout.js';
import historyStock from '../controller/historyStock.js';

const router = express.Router();

// Route nhập kho sách - chỉ admin và super admin được phép
router.route('/stock-in/:id').post(
    authenticationMiddleware.verifyToken,
    authenticationMiddleware.verifyRole(RoleTypeEnum.ADMIN, RoleTypeEnum.SUPER_ADMIN),
    validateRequest(stockIn.validate),
    stockIn.execute
);

// Route xuất kho sách - chỉ admin và super admin được phép
router.route('/stock-out/:id').post(
    authenticationMiddleware.verifyToken,
    authenticationMiddleware.verifyRole(RoleTypeEnum.ADMIN, RoleTypeEnum.SUPER_ADMIN),
    validateRequest(stockIn.validate),
    stockout.execute
);

// Route lấy lịch sử nhập xuất kho - chỉ admin và super admin được phép
router.route('/history').get(
    authenticationMiddleware.verifyToken,
    authenticationMiddleware.verifyRole(RoleTypeEnum.ADMIN, RoleTypeEnum.SUPER_ADMIN),
    historyStock.execute
);

export default router;