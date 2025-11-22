import UserRoutes from "./user/routes/index.js";
import BookRoutes from "./book/routes/index.js";

const routes = (app) => {
  UserRoutes(app);
  BookRoutes(app);
};

export { routes };