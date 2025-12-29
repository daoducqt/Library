import router from "./location.route.js";

const LocationRouter = (app) => {
  app.use("/location", router);
};

export default LocationRouter;