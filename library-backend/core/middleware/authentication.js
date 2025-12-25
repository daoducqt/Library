import jwt from "jsonwebtoken";
import StatusCodes from "../utils/statusCode/statusCode.js";
import ReasonPhrases from "../utils/statusCode/reasonPhares.js";
// import { PERMISSIONS } = require("../config/permissions");
// const UserRoleLink = require("../models/userRoleLink.model");
import dotenv from "dotenv";
dotenv.config();

const verifyToken = (req, res, next) => {
  let token = null;

  if (req.cookies?.accessToken) {
    token = req.cookies.accessToken;
  } else if (req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ message: "Chưa đăng nhập" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: "Token không hợp lệ" });
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
