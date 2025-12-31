// getFavorites.js
import Favorite from "../model/favorite.model.js";
import  StatusCodes  from "../../../core/utils/statusCode/statusCode.js";
import  ReasonPhrases  from "../../../core/utils/statusCode/reasonPhares.js";

const getFavorites = {
    excecute: async (req, res) => {
        try {
            const userId = req.user._id;
            const { page = 1, limit = 10 } = req.query;

            const skip = (page - 1) * limit;

            // Lấy danh sách favorite và populate thông tin sách
            const favorites = await Favorite.find({ userId })
                .select("-userId") // Loại bỏ userId khỏi response
                .populate({
                    path: "bookId",
                    select: "title author description publishedYear availableCopies image coverId categoryId views likes isbn",
                    populate: {
                        path: "categoryId",
                        select: "name slug",
                    },
                })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit));

            // Thêm coverUrl cho mỗi sách
            const favoritesWithCover = favorites.map(fav => {
                const favoriteObj = fav.toObject();
                if (favoriteObj.bookId) {
                    // Nếu có coverId từ Open Library
                    if (favoriteObj.bookId.coverId) {
                        favoriteObj.bookId.coverUrl = `https://covers.openlibrary.org/b/id/${favoriteObj.bookId.coverId}-L.jpg`;
                    }
                    // Nếu có image upload
                    else if (favoriteObj.bookId.image) {
                        favoriteObj.bookId.coverUrl = favoriteObj.bookId.image;
                    }
                    // Default cover
                    else {
                        favoriteObj.bookId.coverUrl = null;
                    }
                }
                return favoriteObj;
            });

            // Đếm tổng số
            const total = await Favorite.countDocuments({ userId });

            return res.status(StatusCodes.OK).json({
                status: StatusCodes.OK,
                message: "Lấy danh sách yêu thích thành công",
                data: {
                    favorites: favoritesWithCover,
                    pagination: {
                        currentPage: parseInt(page),
                        totalPages: Math.ceil(total / limit),
                        totalItems: total,
                        itemsPerPage: parseInt(limit),
                    },
                },
            });
        } catch (error) {
            console.error("Error in getFavorites:", error);
            return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
                status: StatusCodes.INTERNAL_SERVER_ERROR,
                message: ReasonPhrases.INTERNAL_SERVER_ERROR,
            });
        }
    },
};

export default getFavorites;