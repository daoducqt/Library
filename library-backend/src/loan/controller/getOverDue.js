import Loan from "../model/loan.js";
import StatusCodes from "../../../core/utils/statusCode/statusCode.js";

const excecute = async (req, res) => {
  try {
    const loans = await Loan.find({
      status: "OVERDUE"
    })
      .populate("userId", "userName fullName")
      .populate("bookId", "title author")
      .sort({ dueDate: 1 });

    return res.status(StatusCodes.OK).send({
      status: StatusCodes.OK,
      message: "Thành công",
      data: loans,
    });

  } catch (err) {
    console.error("Get overdue loans error:", err);
    return res.status(500).send({ message: "Server error" });
  }
};

export default { excecute };
