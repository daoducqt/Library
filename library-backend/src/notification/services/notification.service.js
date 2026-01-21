import Notification from "../model/notification.js";
import { emitNotification, emitNotificationToAdmins } from "../../socket/socket.js";

/**
 * Tạo Notification mới
 *  @param { string } userId - ID người dùng nhận thông báo
 *  @param { string } title - Tiêu đề thông báo
 *  @param { string } message - Nội dung thông báo
 *  @param { object} options - Các tùy chọn khác
 *  @param { string } [options.link] - Liên kết kèm theo thông báo
 *  @param { string } [options.type] - Loại thông báo
 *  @param { string } [ options.loanId ] - ID loan (nếu có)
 *  @param { string } [ options.bookId ] - ID sách liên quan (nếu có)
 *  @param { string } [ options.bookIds ] - Danh sách ID sách liên quan (nếu có)
 */

export const createNotification = async (userId, title, message, options = {}) => {
    try {
        const newNotification = new Notification({
            userId,
            title,
            message,
            ...options,
        });
        const savedNotification = await newNotification.save();
        
        // Emit realtime notification to user
        emitNotification(userId, savedNotification);
        
        return savedNotification;
    } catch (err) {
        console.error("Create notification error:", err);
        throw new Error("Lỗi khi tạo thông báo");
    }
};

/**
 * Tạo thông báo mượn sách
 * @param { string } userId - ID người dùng nhận thông báo
 * @param { string } bookTitle - Tiêu đề sách được mượn
 * @param { string } loanId - ID loan
 * @return { Promise<Notification> }
 */

export const notifyBorrow = async (userId, bookTitle, loanId) => {
    return createNotification(
        userId,
        "Thông báo mượn sách",
        `Bạn đã mượn sách "${bookTitle}". Vui lòng trả sách đúng hạn.`,
        { type: "BORROW", loanId, link: `/loans/${loanId}` }
    );
};

/**
 * Tạo thông báo trả sách
 * @param { string } userId - ID người dùng nhận thông báo
 * @param { string } bookTitle - Tiêu đề sách được trả
 * @param { string } loanId - ID loan
 * @param { number } daysLate - Số ngày quá hạn (nếu có) 
 * @return { Promise<Notification> }
 */

export const notifyReturn = async (userId, bookTitle, loanId, daysLate = 0) => {
    const title = daysLate > 0 ? "Trả sách quá hạn" : "Trả sách thành công";
    const message =
        daysLate > 0
            ? `Bạn đã trả sách "${bookTitle}" muộn ${daysLate} ngày. Vui lòng kiểm tra lại quy định phạt quá hạn.`
            : `Bạn đã trả sách "${bookTitle}" thành công. Cảm ơn bạn!`;
    return createNotification(
        userId,
        title,
        message,
        { 
            type: "RETURN",
            link: `/loans/${loanId}`,
            loanId
        }
    );
};

/**
 * Tạo thông báo sách gần quá hạn
 * @param { string } userId - ID người dùng nhận thông báo
 * @param { string } bookTitle - Tiêu đề sách
 * @param { string } loanId - ID loan
 * @param { number } daysLeft - Số ngày còn lại trước khi quá hạn
 * @return { Promise<Notification> }
 */

export const notifyDueSoon = async (userId, bookTitle, loanId, daysLeft) => {
    return createNotification(
        userId,
        "Thông báo sách sắp quá hạn",
        `Sách "${bookTitle}" của bạn sẽ đến hạn trả sau ${daysLeft} ngày. Vui lòng chuẩn bị trả sách đúng hạn.`,
        {
            type: "DUE_SOON",
            link: `/loans/${loanId}`,
            loanId
        }
    );
};

/**
 * Tạo thông báo sách đã quá hạn
 * @param { string } userId - ID người dùng nhận thông báo
 * @param { string } bookTitle - Tiêu đề sách
 * @param { string } loanId - ID loan
 * @param { number } daysLate - Số ngày đã quá hạn
 * @return { Promise<Notification> }
 */

export const notifyOverdue = async (userId, bookTitle, loanId, daysLate) => {
    return createNotification(
        userId,
        "Thông báo sách đã quá hạn",
        `Sách "${bookTitle}" của bạn đã quá hạn trả ${daysLate} ngày. Vui lòng trả sách ngay để tránh bị phạt thêm.`,
        {
            type: "OVERDUE",
            link: `/loans/${loanId}`,
            loanId
        }
    );
};

/** 
 * Lấy thông báo của user
 */

export const getUserNotifications = async (userId) => {
    try {
        const notifications = await Notification.find({ userId })
            .sort({ createdAt: -1 })
            .limit(10);
        return notifications;
    } catch (err) {
        console.error("Get user notifications error:", err);
        throw new Error("Lỗi khi lấy thông báo của người dùng");
    }
};

/**
 * Đánh dấu thông báo đã đọc
 * @param { string } notificationId - ID thông báo
 * @return { Promise<Notification> }
 */

export const markAsRead = async (notificationId) => {
    try {
        const updatedNotification = await Notification.findByIdAndUpdate(
            notificationId,
            { isRead: true },
            { new: true }
        );
        return updatedNotification;
    } catch (err) {
        console.error("Mark notification as read error:", err);
        throw new Error("Lỗi khi đánh dấu thông báo đã đọc");
    }
};

/**
 * Đánh dấu tất cả thông báo của user đã đọc
 * @param { string } userId - ID người dùng
 * @return { Promise<object> }
 */

export const markAllAsRead = async (userId) => {
    try {
        const result = await Notification.updateMany(
            { userId, isRead: false },
            { isRead: true }
        );
        return result;
    } catch (err) {
        console.error("Mark all notifications as read error:", err);
        throw new Error("Lỗi khi đánh dấu tất cả thông báo đã đọc");
    }
};

/**
 * Xóa thông báo 
 * @param { string } notificationId - ID thông báo
 * @return { Promise<Notification> }
 */
export const deleteNotificationById = async (notificationId) => {
    try {
        const deletedNotification = await Notification.findByIdAndDelete(notificationId);
        return deletedNotification;
    } catch (err) {
        console.error("Delete notification error:", err);
        throw new Error("Lỗi khi xóa thông báo");
    }
};

/**
 * Lấy tất cả admin user IDs
 */
const getAllAdminIds = async () => {
    const User = (await import("../../user/models/User.js")).default;
    const { RoleTypeEnum } = await import("../../user/models/User.js");
    
    const admins = await User.find({ 
        role: { $in: [RoleTypeEnum.ADMIN, RoleTypeEnum.SUPER_ADMIN] }
    }).select('_id');
    
    return admins.map(admin => admin._id);
};

/**
 * Gửi notification cho tất cả Admin
 */
const notifyAllAdmins = async (title, message, options = {}) => {
    try {
        const adminIds = await getAllAdminIds();
        
        const notifications = adminIds.map(adminId => ({
            userId: adminId,
            title,
            message,
            targetRole: "ADMIN",
            ...options
        }));
        
        const result = await Notification.insertMany(notifications);
        
        // Emit realtime notification to all admins
        result.forEach(notification => {
            emitNotificationToAdmins(notification);
        });
        
        return result;
    } catch (err) {
        console.error("Notify all admins error:", err);
        throw new Error("Lỗi khi gửi thông báo cho admin");
    }
};

/**
 * Admin: Thông báo user mượn sách mới
 */
export const notifyAdminNewBorrow = async (userName, bookTitle, loanId) => {
    return notifyAllAdmins(
        "Mượn sách mới",
        `${userName} vừa mượn sách "${bookTitle}"`,
        {
            type: "ADMIN_NEW_BORROW",
            loanId,
            link: `/admin/loans/${loanId}`,
            metadata: { userName, bookTitle }
        }
    );
};

/**
 * Admin: Thông báo user trả sách
 */
export const notifyAdminReturn = async (userName, bookTitle, loanId, daysLate = 0) => {
    const title = daysLate > 0 ? "Trả sách quá hạn" : "Trả sách";
    const message = daysLate > 0 
        ? `${userName} đã trả sách "${bookTitle}" (trễ ${daysLate} ngày)`
        : `${userName} đã trả sách "${bookTitle}"`;
    
    return notifyAllAdmins(title, message, {
        type: "ADMIN_RETURN",
        loanId,
        link: `/admin/loans/${loanId}`,
        metadata: { userName, bookTitle, daysLate }
    });
};

/**
 * Admin: Cảnh báo quá hạn
 */
export const notifyAdminOverdue = async (userName, bookTitle, loanId, daysOverdue) => {
    return notifyAllAdmins(
        "⚠️ Cảnh báo quá hạn",
        `${userName} quá hạn ${daysOverdue} ngày - Sách: "${bookTitle}"`,
        {
            type: "ADMIN_OVERDUE",
            loanId,
            link: `/admin/loans/${loanId}`,
            metadata: { userName, bookTitle, daysOverdue }
        }
    );
};

/**
 * Admin: Thông báo thanh toán phạt
 */
export const notifyAdminFinePayment = async (userName, amount, fineId, paymentMethod) => {
    return notifyAllAdmins(
        "💰 Thanh toán phạt",
        `${userName} đã thanh toán ${amount.toLocaleString('vi-VN')}đ qua ${paymentMethod}`,
        {
            type: "ADMIN_FINE_PAYMENT",
            fineId,
            link: `/admin/fines/${fineId}`,
            metadata: { userName, amount, paymentMethod }
        }
    );
};

/**
 * Admin: Cảnh báo user vi phạm nhiều
 */
export const notifyAdminUserViolation = async (userName, userId, violationCount, violationType) => {
    return notifyAllAdmins(
        "⚠️ Người dùng vi phạm",
        `${userName} đã có ${violationCount} lần ${violationType}`,
        {
            type: "ADMIN_USER_VIOLATION",
            link: `/admin/users/${userId}`,
            metadata: { userName, userId, violationCount, violationType }
        }
    );
};

export default {
    createNotification,
    notifyBorrow,
    notifyReturn,
    notifyDueSoon,
    notifyOverdue,
    getUserNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotificationById,
    // Admin notifications
    notifyAdminNewBorrow,
    notifyAdminReturn,
    notifyAdminOverdue,
    notifyAdminFinePayment,
    notifyAdminUserViolation
};