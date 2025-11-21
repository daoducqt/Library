import jwt from "jsonwebtoken";
import StatusCodes from "../utils/statusCode/statusCode.js";
import ReasonPhrases from "../utils/statusCode/reasonPhares.js";
// import { PERMISSIONS } = require("../config/permissions");
// const UserRoleLink = require("../models/userRoleLink.model");
import dotenv from "dotenv";
dotenv.config();

const verifyToken = (req, res, next) => {
  const token = req.headers["authorization"];
  if (token) {
    const accessToken = token.split(" ")[1];
    jwt.verify(accessToken, process.env.JWT_ACCESS_SECRET, (err, user) => {
      if (err) {
        return res.status(StatusCodes.FORBIDDEN).send({
          status: StatusCodes.FORBIDDEN,
          message: ReasonPhrases.FORBIDDEN,
        });
      }
      req.user = user;
      next();
    });
  } else {
    return res.status(StatusCodes.UNAUTHORIZED).send({
      status: StatusCodes.UNAUTHORIZED,
      message: ReasonPhrases.UNAUTHORIZED,
    });
  }
};

const verifyRole = (...allowedRoles) => {
  return (req, res, next) => {
    const user = req.user;
    if (!user || !allowedRoles.includes(user.role)) {
      return res.status(StatusCodes.FORBIDDEN).send({
        status: StatusCodes.FORBIDDEN,
        message: "Bạn không có quyền truy cập",
      });
    }
    next();
  };
};

export default {
  verifyToken,
  verifyRole,
};
