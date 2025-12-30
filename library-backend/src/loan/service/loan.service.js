import Loan from "../model/loan.js";

export async function autoUpdateOverdue() {
    try {
        const now = new Date();

        const result = await Loan.updateMany(
            {
                status: "BORROWED",
                dueDate: { $lt: now }
            },
            { $set: { status: "OVERDUE" } }
        );

        console.log("Auto overdue updated:", result.modifiedCount);

    } catch (err) {
        console.error("Auto overdue failed:", err);
    }
}

export const generatePickupCode = async () => {
    let code;
    let exists = true;

    while (exists) {
        code = Math.floor(100000 + Math.random() * 900000).toString();

        exists = await Loan.exists({ pickCode: code, status: { $in: ["PENDING", "BORROWED"] } });
    }

    return code;
};