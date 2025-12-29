import Location from "../model/location.js";
import StatusCodes from "../../../core/utils/statusCode/statusCode.js";
import ReasonPhrases from "../../../core/utils/statusCode/reasonPhares.js";

const excecute = async (req, res) => {
  try {
    const { id } = req.params;

    const location = await Location.findById(id);

    if (!location) {
      return res.status(StatusCodes.NOT_FOUND).send({
        status: StatusCodes.NOT_FOUND,
        message: "Không tìm thấy vị trí",
      });
    }

    return res.status(StatusCodes.OK).send({
      status: StatusCodes.OK,
      message: ReasonPhrases.OK,
      data: location,
    });
  } catch (error) {
    console.error("Get location by ID error:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: ReasonPhrases.INTERNAL_SERVER_ERROR,
    });
  }
};

export default { excecute };