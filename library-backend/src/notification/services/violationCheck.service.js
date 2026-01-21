import Loan from "../../loan/model/loan.js";
import { notifyAdminUserViolation } from "./notification.service.js";

const VIOLATION_THRESHOLD = 3; // Ngưỡng cảnh báo

/**
 * Kiểm tra và thông báo vi phạm của user
 * @param {string} userId - ID user
 * @param {string} userName - Tên user
 */
export const checkAndNotifyViolation = async (userId, userName) => {
    try {
        // Đếm số lần quá hạn (OVERDUE hoặc đã trả muộn)
        const overdueCount = await Loan.countDocuments({
            userId,
            $or: [
                { status: "OVERDUE" },
                { 
                    status: "RETURNED",
                    returnDate: { $exists: true },
                    $expr: { $gt: ["$returnDate", "$dueDate"] }
                }
            ]
        });

        console.log(`User ${userName} has ${overdueCount} violations`);

        // Nếu đạt ngưỡng → Gửi cảnh báo cho admin
        if (overdueCount >= VIOLATION_THRESHOLD) {
            await notifyAdminUserViolation(
                userName,
                userId,
                overdueCount,
                "quá hạn trả sách"
            );
            console.log(`⚠️ Admin notified about user ${userName} violations`);
        }

    } catch (error) {
        console.error("Error checking violations:", error);
    }
};