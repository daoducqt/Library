import UserRoutes from "./user/routes/index.js";
import BookRoutes from "./book/routes/index.js";
import OTProutes from "./OTP/routes/index.js";
import CategoryRouter from "./category/router/index.js";
import LoanRouter from "./loan/router/index.js";
import ReviewRouter from "./reviewrating/router/index.js";
import NotificationRouter from "./notification/router/index.js";
import StockRouter from "./stockIn/router/index.js";
import fineRouter from "./fine/router/index.js";

const routes = (app) => {
  UserRoutes(app);
  BookRoutes(app);
  OTProutes(app);
  CategoryRouter(app);
  LoanRouter(app);
  ReviewRouter(app);
  NotificationRouter(app);
  StockRouter(app);
  fineRouter(app);
};

export { routes };