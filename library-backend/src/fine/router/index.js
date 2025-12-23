import router from '../router/fine.routes.js';

const FineRouter = (app) => {
  app.use('/fine', router);
};

export default FineRouter;