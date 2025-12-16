import mongoose from "mongoose";
import Loan from "../model/loan.js";
import StatusCodes from "../../../core/utils/statusCode/statusCode.js";
import Joi from "joi";

const validate = Joi.object({
  extraDays: Joi.number().integer().min(1).max(30).required(),
});

const excecute = async (req, res) => {
  try {
    const { loanId } = req.params;
    const { extraDays } = req.body;
    const user = req.user;

    /* ===== 1️⃣ validate loanId ===== */
    if (!mongoose.Types.ObjectId.isValid(loanId)) {
      return res.status(StatusCodes.BAD_REQUEST).send({
        status: StatusCodes.BAD_REQUEST,
        message: "Loan ID không hợp lệ",
      });
    }

    const loan = await Loan.findById(loanId);
    if (!loan) {
      return res.status(StatusCodes.NOT_FOUND).send({
        status: StatusCodes.NOT_FOUND,
        message: "Không tìm thấy loan",
      });
    }

    /* ===== 2️⃣ chỉ chủ loan mới được gia hạn ===== */
    if (loan.userId.toString() !== user._id.toString()) {
      return res.status(StatusCodes.FORBIDDEN).send({
        status: StatusCodes.FORBIDDEN,
        message: "Không thể gia hạn loan của người khác",
      });
    }

    /* ===== 3️⃣ chỉ gia hạn khi BORROWED ===== */
    if (loan.status !== "BORROWED") {
      return res.status(StatusCodes.BAD_REQUEST).send({
        status: StatusCodes.BAD_REQUEST,
        message: "Loan đã trả hoặc quá hạn, không thể gia hạn",
      });
    }

    /* ===== 4️⃣ chỉ được gia hạn 1 lần ===== */
    if (loan.extendCount >= 1) {
      loan.extendHistory.push({
        status: "REJECTED",
        reason: "Loan đã được gia hạn tối đa 1 lần",
      });

      await loan.save();

      return res.status(StatusCodes.BAD_REQUEST).send({
        status: StatusCodes.BAD_REQUEST,
        message: "Loan này chỉ được gia hạn 1 lần",
      });
    }

    /* ===== 5️⃣ gia hạn thành công ===== */
    loan.dueDate = new Date(
      loan.dueDate.getTime() + extraDays * 86400000
    );
    loan.extendCount += 1;

    loan.extendHistory.push({
      status: "APPROVED",
      extraDays,
    });

    await loan.save();

    return res.status(StatusCodes.OK).send({
      status: StatusCodes.OK,
      message: "Gia hạn thành công",
      data: loan,
    });

  } catch (error) {
    console.error("loanExtend error:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: "Lỗi máy chủ",
    });
  }
};

export default { validate, excecute };