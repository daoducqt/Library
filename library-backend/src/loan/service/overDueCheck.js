import Loan from "../model/loan.js";
import { notifyDueSoon, notifyOverdue } from "../../notification/services/notification.service.js";

/**
 * Kiểm tra sách gần hết hạn và quá hạn
 * Gửi notification tự động
 * Chạy mỗi giờ qua cron job
 */
export const checkDueLoans = async () => {
    try {
        const now = new Date();
        
        console.log("📅 Starting due loans check...");

        /* ===== TÌM LOAN SẮP HẾT HẠN (1-3 NGÀY) ===== */
        const dueSoonLoans = await Loan.find({
            status: "BORROWED",
            dueDate: {
                $gt: now,
                $lte: new Date(now.getTime() + 3 * 86400000) // 3 ngày nữa
            }
        }).populate("bookId");

        console.log(`Found ${dueSoonLoans.length} loans due soon`);

        for (const loan of dueSoonLoans) {
            const daysLeft = Math.ceil((loan.dueDate - now) / 86400000);
            
            // Chỉ gửi notification nếu còn 1-3 ngày
            if (daysLeft > 0 && daysLeft <= 3) {
                try {
                    await notifyDueSoon(loan.userId, loan.bookId.title, loan._id, daysLeft);
                    console.log(`Notified user ${loan.userId} - ${daysLeft} days left for "${loan.bookId.title}"`);
                } catch (err) {
                    console.error(`Error notifying due soon loan ${loan._id}:`, err.message);
                }
            }
        }

        /* ===== 2️⃣ TÌM LOAN QUÁ HẠN ===== */
        const overdueLoans = await Loan.find({
            status: "BORROWED",
            dueDate: { $lt: now }
        }).populate("bookId");

        console.log(`Found ${overdueLoans.length} overdue loans`);

        for (const loan of overdueLoans) {
            try {
                // Cập nhật status thành OVERDUE
                loan.status = "OVERDUE";
                await loan.save();

                const daysLate = Math.ceil((now - loan.dueDate) / 86400000);
                
                await notifyOverdue(loan.userId, loan.bookId.title, loan._id, daysLate);
                console.log(`Notified user ${loan.userId} - ${daysLate} days overdue for "${loan.bookId.title}"`);
            } catch (err) {
                console.error(`Error notifying overdue loan ${loan._id}:`, err.message);
            }
        }

        console.log("Due loans check completed");
    } catch (error) {
        console.error("Error in checkDueLoans:", error);
    }
};

export default { checkDueLoans };