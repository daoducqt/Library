import express from "express";
import getBooks from "../controllers/getBooks.js";
import create from "../../book/controllers/create.js";
import authenticationMiddleware from "../../../core/middleware/authentication.js";
import { validateRequest } from "../../../core/middleware/validationRequest.js";
import { RoleTypeEnum } from "../../user/models/User.js";

import importBookToDb from "../controllers/importOpenLB.js";
import searchBook from "../controllers/searchBook.js";
import getDetailBook from "../controllers/bookDetail.js";

const router = express.Router();

router.route("/getBookList").get(getBooks.excecute);
router.route("/importBooks").get(importBookToDb.excecute);
router.route("/search").get(searchBook.excecute);

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

router.route("/detailBook/:id").get(getDetailBook.excecute);


export default router;