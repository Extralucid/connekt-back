import router from 'express';
import { createGarantieHandler, deleteGarantieHandler, getGarantieHandler, listAllDeletedGarantiesHandler, listAllGarantiesHandler, updateGarantieHandler } from '../../controllers/settings/garantie.controller.js';
import { authentication } from '../../middlewares/authentication.js';

const garantieRoutes = router.Router();

const garantieRoute = () => {
  garantieRoutes.post(
    '/create-new-garantie',
    createGarantieHandler
  );
  garantieRoutes.put(
    '/update-garantie/:id',
    authentication,
    updateGarantieHandler
  );
  garantieRoutes.get(
    '/list-all-garanties',
    authentication,
    listAllGarantiesHandler
  );
  garantieRoutes.get(
    '/list-deleted-garanties',
    authentication,
    listAllDeletedGarantiesHandler
  );
  garantieRoutes.get(
    '/get-garantie/:id',
    authentication,
    getGarantieHandler
  );
  garantieRoutes.get(
    '/delete-garantie/:id',
    authentication,
    deleteGarantieHandler
  );

  return garantieRoutes;
};

export default garantieRoute;
