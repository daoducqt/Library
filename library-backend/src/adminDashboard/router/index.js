import router from "./adminDashboard.routes.js";

const AdminRouter = (app) => {
  app.use("/admin-dashboard", router);
};

export default AdminRouter;