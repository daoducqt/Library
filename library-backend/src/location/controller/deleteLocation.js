import Location from "../model/location.js";
import Book from "../../book/models/Book.js";
import StatusCodes from "../../../core/utils/statusCode/statusCode.js";
import ReasonPhrases from "../../../core/utils/statusCode/reasonPhares.js";

const excecute = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if location exists
    const location = await Location.findById(id);
    if (!location) {
      return res.status(StatusCodes.NOT_FOUND).send({
        status: StatusCodes.NOT_FOUND,
        message: "Không tìm thấy vị trí",
      });
    }

    // Check if any books are using this location
    const booksUsingLocation = await Book.countDocuments({ locationId: id });
    if (booksUsingLocation > 0) {
      return res.status(StatusCodes.BAD_REQUEST).send({
        status: StatusCodes.BAD_REQUEST,
        message: `Không thể xóa. Có ${booksUsingLocation} sách đang sử dụng vị trí này.`,
      });
    }

    await Location.findByIdAndDelete(id);

    return res.status(StatusCodes.OK).send({
      status: StatusCodes.OK,
      message: "Xóa vị trí thành công",
    });
  } catch (error) {
    console.error("Delete location error:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: ReasonPhrases.INTERNAL_SERVER_ERROR,
    });
  }
};

export default { excecute };