import router from './review.js';

const ReviewRouter = (app) => {
  app.use('/review', router);
};

export default ReviewRouter;