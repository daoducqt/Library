import Loan from "../model/loan.js";
import StatusCodes from "../../../core/utils/statusCode/statusCode.js";

const excecute = async (req, res) => {
    try {
        const user = req.user;

        const loans = await Loan.find({
            userId: user._id,
            status: { $in: ["PENDING", "BORROWED"] },
        }).populate("bookId", "title author");

        return res.status(StatusCodes.OK).send({
            status: StatusCodes.OK,
            message: "Thành công",
            data: loans,
        });

    } catch (error) {
        console.error(error);
    }
};

export default { excecute };
