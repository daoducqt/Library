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
