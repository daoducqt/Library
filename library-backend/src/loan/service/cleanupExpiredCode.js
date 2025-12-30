import loan from "../model/loan.js";

export const cleanupExpiredPickups = async () => {
    try {
        const result = await loan.updateMany(
            {
                status: "PENDING",
                pickupExpiry: { $lt: new Date() }
            },
            { $set: { status: "EXPIRED" } }
        );

        console.log("Expired pickup codes cleaned up:", result.modifiedCount);

    } catch (err) {
        console.error("Cleanup expired pickup codes failed:", err);
    }
};

export default { cleanupExpiredPickups };



