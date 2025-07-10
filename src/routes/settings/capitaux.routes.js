import router from 'express';
import { createCapitauxHandler, deleteCapitauxHandler, getCapitauxHandler, listAllDeletedCapitauxsHandler, listAllCapitauxsHandler, updateCapitauxHandler } from '../../controllers/settings/capitaux.controller.js';
import { authentication } from '../../middlewares/authentication.js';

const capitauxRoutes = router.Router();

const capitauxRoute = () => {
  capitauxRoutes.post(
    '/create-new-capitaux',
    createCapitauxHandler
  );
  capitauxRoutes.put(
    '/update-capitaux/:id',
    authentication,
    updateCapitauxHandler
  );
  capitauxRoutes.get(
    '/list-all-capitauxs',
    authentication,
    listAllCapitauxsHandler
  );
  capitauxRoutes.get(
    '/list-deleted-capitauxs',
    authentication,
    listAllDeletedCapitauxsHandler
  );
  capitauxRoutes.get(
    '/get-capitaux/:id',
    authentication,
    getCapitauxHandler
  );
  capitauxRoutes.get(
    '/delete-capitaux/:id',
    authentication,
    deleteCapitauxHandler
  );

  return capitauxRoutes;
};

export default capitauxRoute;
