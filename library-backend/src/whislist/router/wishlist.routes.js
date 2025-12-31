import express from 'express';
import authenticationMiddleware from '../../../core/middleware/authentication.js';
import { RoleTypeEnum } from "../../user/models/User.js";

import addToWishlist from '../controller/addToWishlist.js';
import removeFromWishlist from '../controller/removeWishlist.js';
import getUserWishlist from '../controller/getWishlist.js';

const router = express.Router();

// Thêm sách vào wishlist
router.route("/add").post(authenticationMiddleware.verifyToken, addToWishlist.excecute);

router.route("/getwishlist").get(authenticationMiddleware.verifyToken, getUserWishlist.excecute);

// Xóa sách khỏi wishlist
router.route("/remove/:wishlistId").delete(authenticationMiddleware.verifyToken, removeFromWishlist.excecute);

export default router;