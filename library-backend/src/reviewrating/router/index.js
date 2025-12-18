import router from './review.route.js';

const ReviewRouter = (app) => {
  app.use('/review', router);
};

export default ReviewRouter;