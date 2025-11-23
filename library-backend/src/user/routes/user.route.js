import express from "express";
import register from "../controllers/register.js";
import login from "../controllers/login.js";
import { validateRequest } from "../../../core/middleware/validationRequest.js";
import authenticationMiddleware from "../../../core/middleware/authentication.js";
import { RoleTypeEnum } from "../models/User.js";
import create from "../controllers/create.js";
import getList from "../controllers/getList.js";


const router = express.Router();
// router.route("/register").post(register.excecute);

router.route("/register").post(validateRequest(register.validate), register.excecute);
router.route("/login").post(validateRequest(login.validate), login.excecute);

router
  .route("/create")
  .post(
    [
      authenticationMiddleware.verifyToken,
      authenticationMiddleware.verifyRole(RoleTypeEnum.ADMIN, RoleTypeEnum.SUPER_ADMIN),
      validateRequest(create.validate),
    ],
    create.excecute
  );

router.route("/").get(getList.excecute);

export default router;