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
import top10Borrowed from "../controller/top10Borrowed.js";
import confirmCodeBook from "../controller/comfrimCodeBook.js";
import cancelBorrow from "../controller/cancelBorrow.js";
import checkCode from "../controller/checkCode.js";
import pendingloans from "../controller/pendingloans.js";
import searchUserPending from "../controller/searchUserPending.js";
import getOnePendingLoan from "../controller/getOnePendingLoan.js";
import getLoanBorrow from "../controller/getLoanBorrow.js";


const router = express.Router();

// Admin routes
const adminAuth = [
  authenticationMiddleware.verifyToken,
  authenticationMiddleware.verifyRole(RoleTypeEnum.ADMIN, RoleTypeEnum.SUPER_ADMIN),
];

// 📌 Lấy danh sách tất cả các loan trong hệ thống
router.get("/list", adminAuth, getList.excecute);

// // 📌 [ADMIN] Đánh dấu một loan là quá hạn (OVERDUE)
// router.patch("/:loanId/mark-overdue", adminAuth, markOverDue.excecute);

// 📌 Lấy danh sách các loan quá hạn (OVERDUE)
router.get("/overdue", adminAuth, getOverDue.excecute);

// 📌 Thống kê mượn trả sách toàn hệ thống (số lượng, tình trạng, ...)
router.get("/stats", adminAuth, loanStats.excecute);

// 📌 Trả sách (cập nhật trạng thái loan sang RETURNED)  
router.post("/:loanId/return", 
    adminAuth,
    returnBook.excecute
);

// not authenticated user routes
// 📌 Lấy top 10 sách được mượn nhiều nhất trong khoảng thời gian
router.route("/top10-borrowed").get(top10Borrowed.excecute);

// check Code 
router.post("/check-code",adminAuth,validateRequest(checkCode.validate),checkCode.excecute);

// admin confirm mã lấy sách
router.post("/confirm-code/:loanId/",adminAuth,confirmCodeBook.excecute);

// lấy danh sách các loan đang mượn (BORROWED)
router.get("/borrowed",adminAuth,getLoanBorrow.excecute);

// lấy danh sách các yêu cầu mượn sách đang chờ xử lý
router.get("/pendinglist",adminAuth,pendingloans.excecute);

// tìm kiếm user và xem pending
router.get("/pending-search",adminAuth,searchUserPending.excecute);

// lấy chi tiết 1 yêu cầu mượn sách đang chờ xử lý
router.get("/pending-detail/:loanId",adminAuth,getOnePendingLoan.excecute);

// Authenticated user routes
// 📌 Lấy lịch sử mượn trả của một user theo userId
router.get("/history", 
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


// cancel borrow
router.post(
  "/cancel-borrow/:loanId",
  authenticationMiddleware.verifyToken,
  cancelBorrow.excecute
);

export default router;