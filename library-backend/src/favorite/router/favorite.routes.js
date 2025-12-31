// favorite.routes.js
import express from "express";
import authenticationMiddleware from "../../../core/middleware/authentication.js";
import addFavorite from "../controller/addFarvorite.js";
import removeFavorite from "../controller/delFavorite.js";
import getFavorites from "../controller/getFavorite.js";

const router = express.Router();

// Tất cả routes đều cần authentication
router.use(authenticationMiddleware.verifyToken);

// Lấy danh sách sách yêu thích của user
router.route("/list").get(getFavorites.excecute);

// Thêm sách vào yêu thích
router.route("/add/:bookId").post(addFavorite.excecute);

// Xóa sách khỏi yêu thích
router.route("/delete/:id").delete(removeFavorite.excecute);

export default router;