import router from "./category.route.js";

const CategoryRouter = (app) => {
  app.use("/category", router);
};

export default CategoryRouter;