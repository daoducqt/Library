import router from "./notification.route.js";

const NotificationRouter = (app) => {
  app.use("/notification", router);
};

export default NotificationRouter;