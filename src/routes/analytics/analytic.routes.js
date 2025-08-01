import router from 'express';
import { getDashboardDataHandler } from '../../controllers/analytics/analytic.controller.js';
import { authentication } from '../../middlewares/authentication.js';

const postRoutes = router.Router();

const postRoute = () => {

  postRoutes.get(
    '/get-dashboard-data',
    authentication,
    getDashboardDataHandler
  );

  return postRoutes;
};

export default postRoute;
