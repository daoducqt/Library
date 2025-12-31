import router from './wishlist.routes.js';

const WishlistRouter = (app) => {
    app.use('/wishlist', router);
};

export default WishlistRouter;