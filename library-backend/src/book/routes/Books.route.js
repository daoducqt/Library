import express from "express";
import getBooks from "../controllers/getBooks.js";
import create from "../../book/controllers/create.js";
import authenticationMiddleware from "../../../core/middleware/authentication.js";
import { validateRequest } from "../../../core/middleware/validationRequest.js";
import { RoleTypeEnum } from "../../user/models/User.js";

const router = express.Router();

router.route("/").get(getBooks.excecute);

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

export default router;