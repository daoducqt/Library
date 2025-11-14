import router from "./user.route.js";

const UserRouter = (app) => {
  app.use("/user", router);
};

export default UserRouter;
