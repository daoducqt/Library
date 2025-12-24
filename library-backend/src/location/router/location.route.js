import express from 'express'
import authenticationMiddleware from '../../../core/middleware/authentication.js'
import { RoleTypeEnum } from '../../user/models/User.js'
import createLocation from '../controller/createLocation.js'
import getList from '../controller/getList.js'
import getbyId from '../controller/getbyId.js'
import update from '../controller/update.js'
import deleteLocation from '../controller/deleteLocation.js'

const router = express.Router();

const adminAuth = [
    authenticationMiddleware.verifyToken,
    authenticationMiddleware.verifyRole(RoleTypeEnum.ADMIN, RoleTypeEnum.SUPER_ADMIN),
];

// public routes
router.route('/').get(getList.excecute);
router.route('/:id').get(getbyId.excecute);

// admin routes
router.route('/create').post(adminAuth, createLocation.excecute);
router.route('/update/:id').put(adminAuth, update.excecute);
router.route('/delete/:id').delete(adminAuth, deleteLocation.excecute);

export default router;