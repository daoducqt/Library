
import Favorite from "../model/favorite.model.js";
import  StatusCodes  from "../../../core/utils/statusCode/statusCode.js";
import  ReasonPhrases  from "../../../core/utils/statusCode/reasonPhares.js";

const removeFavorite = {
    excecute: async (req, res) => {
        try {
            const { id } = req.params; // favoriteId
            const userId = req.user._id;

            // Xóa favorite và kiểm tra userId để đảm bảo user chỉ xóa favorite của mình
            const favorite = await Favorite.findOneAndDelete({ 
                _id: id, 
                userId 
            });

            if (!favorite) {
                return res.status(StatusCodes.NOT_FOUND).json({
                    status: StatusCodes.NOT_FOUND,
                    message: "Không tìm thấy yêu thích này hoặc bạn không có quyền xóa",
                });
            }

            return res.status(StatusCodes.OK).json({
                status: StatusCodes.OK,
                message: "Xóa sách khỏi yêu thích thành công",
            });
        } catch (error) {
            console.error("Error in removeFavorite:", error);
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                status: StatusCodes.INTERNAL_SERVER_ERROR,
                message: ReasonPhrases.INTERNAL_SERVER_ERROR,
            });
        }
    },
};

export default removeFavorite;