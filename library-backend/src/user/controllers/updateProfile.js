import User from "../models/User.js";
import StatusCodes from "../../../core/utils/statusCode/statusCode.js";
import ReasonPhrases from "../../../core/utils/statusCode/reasonPhares.js";
import Joi from "joi";

const validate = Joi.object({
  fullName: Joi.string().trim().optional().messages({
    "string.base": "Tên đầy đủ phải là chuỗi",
  }),
  phone: Joi.string().trim().optional().messages({
    "string.base": "Số điện thoại phải là chuỗi",
  }),
  
});

const excecute = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;
        const currentUser = req.user;


        // không update những thông tin này
        delete updateData.password;
        delete updateData.role;
        delete updateData.status;
        delete updateData.refreshToken;
        delete updateData.email;
        delete updateData.avatar;
        delete updateData.otpCode;
        delete updateData.pendingEmail;

        // Check quyền: user chỉ được update chính mình
        if (currentUser.role === "USER" && currentUser._id.toString() !== id) {
        return res.status(StatusCodes.FORBIDDEN).json({
            status: StatusCodes.FORBIDDEN,
            message: "Bạn không có quyền chỉnh sửa người dùng khác",
        });
 }

        const updateUser = await User.findByIdAndUpdate(id, updateData, {new: true}).select("-password -refreshToken -otpCode -otpExpires");
        
        if (!updateUser) {
            return res.status(StatusCodes.NOT_FOUND).json({
                status: StatusCodes.NOT_FOUND,
                message: "Người dùng không tồn tại",
        });
    }

    return res.status(StatusCodes.OK).json({
      status: StatusCodes.OK,
      message: "Cập nhật thông tin thành công",
      data: updateUser,
    });
  } catch (error) {
    console.error("Lỗi khi cập nhật người dùng:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: ReasonPhrases.INTERNAL_SERVER_ERROR,
    });
  }
};

export default { validate, excecute };