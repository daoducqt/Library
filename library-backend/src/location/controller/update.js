import Joi from "joi";
import Location from "../model/location.js";
import StatusCodes from "../../../core/utils/statusCode/statusCode.js";
import ReasonPhrases from "../../../core/utils/statusCode/reasonPhares.js";

const validate = Joi.object({
  area: Joi.string().trim(),
  shelf: Joi.string().trim(),
  row: Joi.string().trim(),
  position: Joi.string().trim(),
}).min(1);

const excecute = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Check if location exists
    const location = await Location.findById(id);
    if (!location) {
      return res.status(StatusCodes.NOT_FOUND).send({
        status: StatusCodes.NOT_FOUND,
        message: "Không tìm thấy vị trí",
      });
    }

    // Check duplicate if updating location details
    if (updates.area || updates.shelf || updates.row || updates.position) {
      const checkData = {
        area: updates.area || location.area,
        shelf: updates.shelf || location.shelf,
        row: updates.row || location.row,
        position: updates.position || location.position,
      };

      const duplicate = await Location.findOne({
        ...checkData,
        _id: { $ne: id },
      });

      if (duplicate) {
        return res.status(StatusCodes.CONFLICT).send({
          status: StatusCodes.CONFLICT,
          message: "Vị trí này đã tồn tại",
        });
      }
    }

    const updatedLocation = await Location.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    return res.status(StatusCodes.OK).send({
      status: StatusCodes.OK,
      message: "Cập nhật vị trí thành công",
      data: updatedLocation,
    });
  } catch (error) {
    console.error("Update location error:", error);
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: ReasonPhrases.INTERNAL_SERVER_ERROR,
    });
  }
};

export default { validate, excecute };