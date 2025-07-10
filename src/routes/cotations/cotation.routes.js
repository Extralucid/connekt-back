import router from 'express';
import { createCotationHandler, deleteCotationHandler, getCotationHandler, listAllDeletedCotationsHandler, listAllCotationsHandler, updateCotationHandler } from '../../controllers/cotations/cotation.controller.js';
import { authentication } from '../../middlewares/authentication.js';

const cotationRoutes = router.Router();

const cotationRoute = () => {
  cotationRoutes.post(
    '/create-new-cotation',
    createCotationHandler
  );
  cotationRoutes.put(
    '/update-cotation/:id',
    authentication,
    updateCotationHandler
  );
  cotationRoutes.get(
    '/list-all-cotations',
    authentication,
    listAllCotationsHandler
  );
  cotationRoutes.get(
    '/list-deleted-cotations',
    authentication,
    listAllDeletedCotationsHandler
  );
  cotationRoutes.get(
    '/get-cotation/:id',
    authentication,
    getCotationHandler
  );
  cotationRoutes.get(
    '/delete-cotation/:id',
    authentication,
    deleteCotationHandler
  );

  return cotationRoutes;
};

export default cotationRoute;
