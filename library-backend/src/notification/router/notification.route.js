import express from 'express';
import { validateRequest } from "../../../core/middleware/validationRequest.js";
import authenticationMiddleware from "../../../core/middleware/authentication.js";
import { RoleTypeEnum } from "../../user/models/User.js";
import getNotifications from "../controller/getNotifications.js";
import pageNotification from "../controller/pageNotification.js";
import unread from "../controller/unread.js";
import createNft from "../controller/createNft.js";
import isRead from '../controller/isRead.js';
import isReadAll from '../controller/isReadAll.js';
import deleteNotification from '../controller/deleteById.js';

const router = express.Router();

// Public routes
router.route("/").get(authenticationMiddleware.verifyToken, getNotifications.excecute);
router.route("/page").post(authenticationMiddleware.verifyToken, validateRequest(pageNotification.validate), pageNotification.excecute);
router.route("/unread").get(authenticationMiddleware.verifyToken, unread.excecute);
router.route("/is-read/:id").post(authenticationMiddleware.verifyToken, isRead.excecute);
router.route("/is-read-all").post(authenticationMiddleware.verifyToken, isReadAll.excecute);
router.route("/delete/:id").delete(authenticationMiddleware.verifyToken, deleteNotification.excecute);

// Admin/Super Admin only
router.route("/create-nft").post(
    authenticationMiddleware.verifyToken,
    authenticationMiddleware.verifyRole(RoleTypeEnum.ADMIN, RoleTypeEnum.SUPER_ADMIN),
    validateRequest(createNft.validate),
    createNft.excecute
);

export default router;

