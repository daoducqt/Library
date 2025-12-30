import express from "express";
import authenticationMiddleware from "../../../core/middleware/authentication.js";
import { RoleTypeEnum } from "../../user/models/User.js";
import dashboardStats from "../controller/dashboardStats.js";
import categoryDistribution from "../controller/categoryDistribution.js";
import recentActivities from "../controller/recentActive.js";
import fineStats from "../controller/fineStats.js";
import pendingStats from "../controller/pendingStats.js";

const router = express.Router();

const adminAuth = [
  authenticationMiddleware.verifyToken,
  authenticationMiddleware.verifyRole(RoleTypeEnum.ADMIN, RoleTypeEnum.SUPER_ADMIN),
];

router.route("/dashboard-stats").get(adminAuth, dashboardStats.excecute);
router.route("/category-distribution").get(adminAuth, categoryDistribution.excecute);
router.route("/recent-activities").get(adminAuth, recentActivities.excecute);
router.route("/fine-stats").get(adminAuth, fineStats.excecute);

// Thống kê mượn sách đang chờ xử lý
router.route("/pending-stats").get(adminAuth, pendingStats.excecute);

export default router;