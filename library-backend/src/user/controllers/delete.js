import User, { RoleTypeEnum } from "../models/User.js";
import StatusCodes from "../../../core/utils/statusCode/statusCode.js";
import ReasonPhrases from "../../../core/utils/statusCode/reasonPhares.js";

const excecute = async (req, res) => {
  try {
    const currentUser = req.user; // user hiện tại đang login
    const id = req.params.id.trim();

    // Kiểm tra user cần xóa có tồn tại không
    const userToDelete = await User.findById(id);
    if (!userToDelete) {
      return res.status(StatusCodes.NOT_FOUND).send({
        status: StatusCodes.NOT_FOUND,
        message: "Người dùng không tồn tại.",
      });
    }

    // Phân quyền xóa
    const canDelete =
      currentUser.role === RoleTypeEnum.SUPER_ADMIN || // SUPER_ADMIN xóa được tất cả
      (currentUser.role === RoleTypeEnum.ADMIN && userToDelete.role === RoleTypeEnum.USER); // ADMIN chỉ xóa USER

    if (!canDelete) {
      return res.status(StatusCodes.FORBIDDEN).send({
        status: StatusCodes.FORBIDDEN,
        message:
          "Bạn không có quyền xoá người dùng này. " +
          "ADMIN chỉ có thể xoá USER, SUPER_ADMIN mới có thể xoá ADMIN hoặc người dùng khác.",
      });
    }

    // Thực hiện xóa
    await User.findByIdAndDelete(id);

    return res.status(StatusCodes.OK).send({
      status: StatusCodes.OK,
      message: "Xoá người dùng thành công.",
    });
  } catch (error) {
    console.error("Lỗi khi xoá người dùng:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: ReasonPhrases.INTERNAL_SERVER_ERROR,
    });
  }
};

export default { excecute };