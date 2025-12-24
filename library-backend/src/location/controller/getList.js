import Location from "../model/location.js";
import StatusCodes from "../../../core/utils/statusCode/statusCode.js";
import ReasonPhrases from "../../../core/utils/statusCode/reasonPhares.js";
import mongoose from "mongoose";

const excecute = async (req, res) => {
    try {
        const { page = 1, limit = 10, area, shelf, row, positon } = req.query;
        const skip = (parent(page) - 1) * parent(limit);

        const filter = {};
        if ( area ) filter.area = area;
        if ( shelf ) filter.shelf = shelf;
        if ( row ) filter.row = row;
        if ( positon ) filter.positon = positon;

        const [ Locations, total ] = await Promise.all([
            Location.find(filter)
                .skip(parseInt(skip))
                .limit(parseInt(limit))
                .sort({ createdAt: -1 }),
            Location.countDocuments(filter),
        ]);
        return res.status(StatusCodes.OK).send({
            status: StatusCodes.OK,
            message: ReasonPhrases.OK,
            data: {
                locations: Locations,
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        console.error("Lỗi khi lấy danh sách vị trí:", error);
        return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({
            status: StatusCodes.INTERNAL_SERVER_ERROR,
            message: "Đã xảy ra lỗi trong quá trình lấy danh sách vị trí",
        });
    }
};

export default { excecute };