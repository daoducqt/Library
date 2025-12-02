import express from "express";
import CreateCategory from "../controller/create.js"
import GetCategory from "../controller/getCategory.js"
import GetListCategory from "../controller/getList.js"
import update from "../controller/update.js";
import deleteCategory from "../controller/delete.js"

import authenticationMiddleware from "../../../core/middleware/authentication.js";
import { RoleTypeEnum } from "../../user/models/User.js";
import { validateRequest } from "../../../core/middleware/validationRequest.js";

const router = express.Router();

/**
 * CATEGORY ROUTES
 * 
 * Category dùng để phân loại các sản phẩm/sách trong hệ thống.
 * Front-End có thể dùng API này để:
 *  - Lấy danh sách category hiển thị trong dropdown, filter, menu
 *  - Hiển thị thông tin chi tiết category (name, description, icon)
 *  - Quản lý thứ tự hiển thị (order)
 *  - Bật/tắt category (isActive)
 */

// Public routes
router.route("/").get(GetListCategory.excecute);
router.route("/:id").get(GetCategory.excecute);

// Admin/Super Admin
router.post(
  "/create",
  authenticationMiddleware.verifyToken,
  authenticationMiddleware.verifyRole(RoleTypeEnum.ADMIN, RoleTypeEnum.SUPER_ADMIN),
  validateRequest(CreateCategory.validate),
  CreateCategory.excecute
);

router.put(
  "/update/:id",
  authenticationMiddleware.verifyToken,
  authenticationMiddleware.verifyRole(RoleTypeEnum.ADMIN, RoleTypeEnum.SUPER_ADMIN),
  validateRequest(update.validate),
  update.excecute
);

router.delete(
  "/delete/:id",
  authenticationMiddleware.verifyToken,
  authenticationMiddleware.verifyRole(RoleTypeEnum.ADMIN, RoleTypeEnum.SUPER_ADMIN),
  deleteCategory.excecute
);

export default router;
