import express from "express";
import getBooks from "../controllers/getBooks.js";
import create from "../../book/controllers/create.js";
import authenticationMiddleware from "../../../core/middleware/authentication.js";
import { validateRequest } from "../../../core/middleware/validationRequest.js";
import { RoleTypeEnum } from "../../user/models/User.js";

import importBookToDb from "../controllers/importOpenLB.js";
import FilterBook from "../controllers/filter.js";
import getDetailBook from "../controllers/bookDetail.js";
import bookView from "../controllers/bookView.js";
import updateBook from "../../book/controllers/updateBook.js";
import disableBook from "../controllers/disableBook.js";
import getByCategory from "../controllers/getByCategory.js";
import enableBook from "../controllers/enableBook.js";
import recommendBookAuthor from "../controllers/recommendAuthor.js";
import recommendBookCategory from "../controllers/recommendCate.js";
import uploadBook from "../../../core/middleware/uploadBook.js";
import upImage from "../../book/controllers/uploadBookImage.js"
import likeBook from "../controllers/likeBook.js";
// import getLikeCount from "../controllers/getLikeCount.js";

const router = express.Router();
// Lấy danh sách sách, có search + phân trang
router.route("/getBookList").get(getBooks.excecute);

// Import sách từ Open Library dựa trên subject
router.route("/importBooks").get(importBookToDb.excecute);

// Lấy sách gợi ý theo tác giả
router.route("/:id/recommend/author").get(recommendBookAuthor.excecute);
// Lấy sách gợi ý theo thể loại
router.route("/:id/recommend/category").get(recommendBookCategory.excecute);

// Lọc sách theo thể loại, năm xuất bản, trạng thái
router.route("/Filter").get(FilterBook.excecute);

// Tạo sách mới (Admin/Super Admin)
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

// Lấy chi tiết 1 sách
router.route("/detailBook/:id").get(getDetailBook.excecute);

// Tăng lượt view sách
router.route("/view/:id").patch(bookView.excecute);

// Cập nhật sách (Admin/Super Admin)
router
  .route("/update/:id")
  .patch(
    [
      authenticationMiddleware.verifyToken,
      authenticationMiddleware.verifyRole(RoleTypeEnum.ADMIN, RoleTypeEnum.SUPER_ADMIN),
      validateRequest(updateBook.validate),
    ],
    updateBook.excecute
  );
  
  // Upload ảnh sách (Admin/Super Admin)
router.route("/upload-image/:id").put(
  [
    authenticationMiddleware.verifyToken,
    authenticationMiddleware.verifyRole(RoleTypeEnum.ADMIN, RoleTypeEnum.SUPER_ADMIN),
    uploadBook.single("image"),
  ],
  upImage.excecute
);

// Vô hiệu hóa / bật sách
router.route("/disable/:id").patch(
  [
    authenticationMiddleware.verifyToken,
    authenticationMiddleware.verifyRole(RoleTypeEnum.ADMIN, RoleTypeEnum.SUPER_ADMIN),
  ],
  disableBook.excecute);
router.route("/enable/:id").patch(
  [
    authenticationMiddleware.verifyToken,
    authenticationMiddleware.verifyRole(RoleTypeEnum.ADMIN, RoleTypeEnum.SUPER_ADMIN),
  ],
enableBook.excecute); 

// Lấy sách theo category
// slug trong Map.js ở category
router.route("/category/:slug").get(getByCategory.excecute);

// Like / UnLike sách
router.route("/like/:bookId").post(
  authenticationMiddleware.verifyToken,
  likeBook.excecute
);
// router.route("/like-count/:bookId").get(
//   authenticationMiddleware.verifyToken,
//   getLikeCount.excecute
// );

export default router;