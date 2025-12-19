import router from './stock.route.js';

const StockRouter = (app) => {
    app.use('/stock', router);
};

export default StockRouter;