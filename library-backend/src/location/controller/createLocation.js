import Joi from "joi";
import StatusCodes from "../../../core/utils/statusCode/statusCode.js";
import ReasonPhrases from "../../../core/utils/statusCode/reasonPhares.js";
import Location from "../model/location.js";

const validate = Joi.object({
    area: Joi.string().required().trim().messages({
        "string.base": "Khu vực phải là chuỗi",
        "any.required": "Khu vực là bắt buộc",
    }),
    shelf: Joi.string().required().trim().messages({
        "string.base": "Kệ phải là chuỗi",
        "any.required": "Kệ là bắt buộc",
    }),
    row: Joi.string().required().trim().messages({
        "string.base": "Hàng phải là chuỗi",
        "any.required": "Hàng là bắt buộc",
    }),
    positon: Joi.string().required().trim().messages({
        "string.base": "Vị trí phải là chuỗi",
        "any.required": "Vị trí là bắt buộc",
    }),
});

const excecute = async (req, res) => {
    try {
        const { area, shelf, row, positon } = req.body;

        const existingLocation = await Location.findOne({
            area,
            shelf,
            row,
            positon,
        });
        if (existingLocation) {
            return res.status(StatusCodes.CONFLICT).send({
                status: StatusCodes.CONFLICT,
                message: "Vị trí đã tồn tại",
            });
        }

        const location = await Location.create({
            area,
            shelf,
            row,
            positon,
        });
        return res.status(StatusCodes.CREATED).send({
            status: StatusCodes.CREATED,
            message: ReasonPhrases.CREATED,
            data: location,
        });

    } catch (error) {
        console.error("Lỗi khi tạo vị trí:", error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
            status: StatusCodes.INTERNAL_SERVER_ERROR,
            message: "Đã xảy ra lỗi trong quá trình tạo vị trí",
        });
    }
};
export default { validate, excecute };
