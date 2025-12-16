import router from '../router/loan.route.js';

const LoanRouter = (app) => {
  app.use('/loan', router);
};

export default LoanRouter;