import router from "./otp.route.js";

const OTProutes = (app) => {
  app.use("/auth", router);
}

export default OTProutes;