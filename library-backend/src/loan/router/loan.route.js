import express from "express";
import { validateRequest } from "../../../core/middleware/validationRequest.js";
import authenticationMiddleware from "../../../core/middleware/authentication.js";
import { RoleTypeEnum } from "../../user/models/User.js";

import borrowBook from "../controller/borrow.js";
import returnBook from "../controller/return.js";
import getList from "../controller/getList.js";
import getLoanDetail from "../controller/loanDetail.js";
import extendLoan from "../controller/loanExtend.js";
import loanHistory from "../controller/loanHistory.js";
import loanStats from "../controller/loanStats.js";
import markOverDue from "../controller/markOverDue.js";
import loanActive from "../controller/loanActive.js";
import getOverDue from "../controller/getOverDue.js";

const router = express.Router();

// Admin routes
const adminAuth = [
  authenticationMiddleware.verifyToken,
  authenticationMiddleware.verifyRole(RoleTypeEnum.ADMIN, RoleTypeEnum.SUPER_ADMIN),
];

// 📌 Lấy danh sách tất cả các loan trong hệ thống
router.get("/list", adminAuth, getList.excecute);

// 📌 [ADMIN] Đánh dấu một loan là quá hạn (OVERDUE)
router.patch("/:loanId/mark-overdue", adminAuth, markOverDue.excecute);

// 📌 Lấy danh sách các loan quá hạn (OVERDUE)
router.get("/overdue", adminAuth, getOverDue.excecute);

// 📌 Thống kê mượn trả sách toàn hệ thống (số lượng, tình trạng, ...)
router.get("/stats", adminAuth, loanStats.excecute);

// Authenticated user routes
// 📌 Lấy lịch sử mượn trả của một user theo userId
router.get("/history/:userId", 
    authenticationMiddleware.verifyToken, 
    loanHistory.excecute
);

// 📌 Mượn sách (tạo loan mới)  
router.post("/borrow", 
    authenticationMiddleware.verifyToken, 
    validateRequest(borrowBook.validate), 
    borrowBook.excecute
);

// 📌 Lấy danh sách sách đang mượn (BORROWED) của user hiện tại
router.get(
  "/active",
  authenticationMiddleware.verifyToken,
  loanActive.excecute
);

// 📌 Trả sách (cập nhật trạng thái loan sang RETURNED)  
router.post("/:loanId/return", 
    authenticationMiddleware.verifyToken, 
    returnBook.excecute
);

// 📌 Gia hạn mượn sách (extend loan)  
router.patch("/:loanId/extend", 
    authenticationMiddleware.verifyToken, 
    extendLoan.excecute
);


// 📌 Lấy chi tiết 1 loan theo loanId  
router.get("/:loanId", 
    authenticationMiddleware.verifyToken, 
    getLoanDetail.excecute
);



export default router;