import router from "./Books.route.js";

const routes = (app) => {
  app.use("/book", router);
};

export default routes;