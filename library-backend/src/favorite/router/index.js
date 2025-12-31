import router from "./favorite.routes.js";

const FavoriteRouter = (app) => {
  app.use("/favorite", router);
};
export default FavoriteRouter;