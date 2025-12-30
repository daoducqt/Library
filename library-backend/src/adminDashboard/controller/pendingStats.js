import Loan from "../../loan/model/loan.js";  
import StatusCodes from "../../../core/utils/statusCode/statusCode.js";
import ReasonPhrases from "../../../core/utils/statusCode/reasonPhares.js";

const excecute = async (req, res) => {
    try {
        const now = new Date();
        const startOfToday = new Date(now);
        startOfToday.setHours(0, 0, 0, 0);
        
        const endOfToday = new Date(now);
        endOfToday.setHours(23, 59, 59, 999);

        const [totalPending, expiredCount, todayCount] = await Promise.all([
            // Tổng số pending
            Loan.countDocuments({ status: "PENDING" }),
            
            // Số pending đã hết hạn
            Loan.countDocuments({ 
                status: "PENDING",
                pickupExpiry: { $lt: now }
            }),
            
            // Số pending tạo hôm nay
            Loan.countDocuments({
                status: "PENDING",
                createdAt: { 
                    $gte: startOfToday,
                    $lt: endOfToday
                }
            })
        ]);

        return res.status(StatusCodes.OK).send({
            status: StatusCodes.OK,
            message: ReasonPhrases.OK,
            data: {
                totalPending,
                expiredCount,
                todayCount,
                activeCount: totalPending - expiredCount,
            },
        });
    } catch (error) {
        console.error("Get pending stats error:", error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
            status: StatusCodes.INTERNAL_SERVER_ERROR,
            message: ReasonPhrases.INTERNAL_SERVER_ERROR,
        });
    }
};

export default { excecute };