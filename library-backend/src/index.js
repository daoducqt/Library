import UserRoutes from "./user/routes/index.js";
import BookRoutes from "./book/routes/index.js";
import OTProutes from "./OTP/routes/index.js";

const routes = (app) => {
  UserRoutes(app);
  BookRoutes(app);
  OTProutes(app);
};

export { routes };