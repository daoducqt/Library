import Fine from "../model/fine.js";
import Loan from "../../loan/model/loan.js";
import Notification from "../../notification/model/notification.js";

const FINE_PER_DAY = 5000; 

const autoGenerateFine = async () => {
    try {
        console.log("check for overdue loans to generate fines...");

        const now = new Date();

        const overdueLoans = await Loan.find({
            status: "OVERDUE",
            dueDate: { $lt: now },
        }).populate("bookId", "title");

        if (overdueLoans.length === 0) {
            console.log("No overdue loans found.");
            return;
        }

        console.log(`Found ${overdueLoans.length} overdue loans.`);

        for (const loan of overdueLoans) {
            const existingFine = await Fine.findOne({ loanId: loan._id});

            if (existingFine) {
                const daysLate = Math.floor((now - loan.dueDate) / (1000 * 60 * 60 * 24));
            };

            if (daysLate > existingFine.daysLate && !existingFine.isPayed) {
                existingFine.daysLate = daysLate;
                existingFine.amount = daysLate * FINE_PER_DAY;
                await existingFine.save();

                console.log(`Updated fine for loan ${loan._id}: ${existingFine.amount} VND for ${daysLate} days late.`);
            } else {
                const daysLate = Math.floor((now - loan.dueDate) / (1000 * 60 * 60 * 24));

                if (daysLate > 0) {
                    const fineAmount = daysLate * FINE_PER_DAY;
                    const newFine = new Fine({
                        loanId: loan.userId,
                        loanId: loan._id,
                        daysLate,
                        amount: daysLate * FINE_PER_DAY,
                    });
                    console.log(`Creating fine for loan ${loan._id}: ${fineAmount} VND for ${daysLate} days late.`);
                    await newFine.save();

                    await Notification.create({
                        userId: loan.userId,
                        title: "Phạt trễ hạn mượn sách",
                        message: `Bạn đã bị phạt ${fineAmount} VND vì trễ hạn trả sách "${loan.bookId.title}" trong ${daysLate} ngày.`,
                        type: "FINE",
                        loanId: loan._id,
                        bookId: loan.bookId._id,
                    });
                }
            }
        }
        console.log("Fine generation process completed.");
    } catch (error) {
        console.error("Error in autoGenerateFine:", error);
    }
};

export default autoGenerateFine;
        