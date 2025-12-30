import Whislist from "../model/whislist.model.js";
import StatusCodes from "../../../core/utils/statusCode/statusCode.js";
import ReasonPhrases from "../../../core/utils/statusCode/reasonPhares.js";

const excecute = async (req, res) => {
    try {
        const { wishlistId } = req.params;
        const userId = req.user._id;

        const wishlist = await Whislist.findOne({ _id: wishlistId, userId });

        if (!wishlist) {
            return res.status(StatusCodes.NOT_FOUND).send({
                status: StatusCodes.NOT_FOUND,
                message: "Không tìm thấy wishlist",
            });
        }

        await Whislist.deleteOne({ _id: wishlistId});

        return res.status(StatusCodes.OK).send({
            status: StatusCodes.OK,
            message: ReasonPhrases.OK,
        });
    } catch (error) {
        console.error("Remove wishlist error:", error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
            status: StatusCodes.INTERNAL_SERVER_ERROR,
            message: ReasonPhrases.INTERNAL_SERVER_ERROR,
        });
    }
};
export default { excecute };