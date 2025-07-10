import router from 'express';
import { createMarqueHandler, deleteMarqueHandler, getMarqueHandler, listAllDeletedMarquesHandler, listAllMarquesHandler, updateMarqueHandler } from '../../controllers/settings/marque.controller.js';
import { authentication } from '../../middlewares/authentication.js';

const marqueRoutes = router.Router();

const marqueRoute = () => {
  marqueRoutes.post(
    '/create-new-marque',
    createMarqueHandler
  );
  marqueRoutes.put(
    '/update-marque/:id',
    authentication,
    updateMarqueHandler
  );
  marqueRoutes.get(
    '/list-all-marques',
    authentication,
    listAllMarquesHandler
  );
  marqueRoutes.get(
    '/list-deleted-marques',
    authentication,
    listAllDeletedMarquesHandler
  );
  marqueRoutes.get(
    '/get-marque/:id',
    authentication,
    getMarqueHandler
  );
  marqueRoutes.get(
    '/delete-marque/:id',
    authentication,
    deleteMarqueHandler
  );

  return marqueRoutes;
};

export default marqueRoute;
