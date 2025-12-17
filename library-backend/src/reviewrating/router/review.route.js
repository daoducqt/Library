import express from "express";
import authenticationMiddleware from "../../../core/middleware/authentication.js";
import { validateRequest } from "../../../core/middleware/validationRequest.js";
import { RoleTypeEnum } from "../../user/models/User.js";

import createReview from "../controller/create.js";
import updateReview from "../controller/update.js";
import deleteReview from "../controller/delete.js";
import getReviewsByBook from "../controller/getReviewsByBook.js";

const router = express.Router();

// tạo review cho sách
router.route("/create").post(
  [
    authenticationMiddleware.verifyToken,
    validateRequest(createReview.validate),
  ],
  createReview.excecute
);

// lấy danh sách review theo sách
router.route("/book/:bookId").get(getReviewsByBook.excecute);

// cập nhật review
router.route("/update/:id").put(
    [
        authenticationMiddleware.verifyToken,
        validateRequest(updateReview.validate)
    ],
    updateReview.excecute
);

// xóa review
router.route("/delete/:id").delete(
    [
        authenticationMiddleware.verifyToken,
    ],
    deleteReview.excecute
);

export default router;