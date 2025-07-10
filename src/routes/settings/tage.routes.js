import router from 'express';
import { createTageHandler, deleteTageHandler, getTageHandler, listAllDeletedTagesHandler, listAllTagesHandler, updateTageHandler } from '../../controllers/settings/tage.controller.js';
import { authentication } from '../../middlewares/authentication.js';

const tageRoutes = router.Router();

const tageRoute = () => {
  tageRoutes.post(
    '/create-new-tage',
    createTageHandler
  );
  tageRoutes.put(
    '/update-tage/:id',
    authentication,
    updateTageHandler
  );
  tageRoutes.get(
    '/list-all-tages',
    authentication,
    listAllTagesHandler
  );
  tageRoutes.get(
    '/list-deleted-tages',
    authentication,
    listAllDeletedTagesHandler
  );
  tageRoutes.get(
    '/get-tage/:id',
    authentication,
    getTageHandler
  );
  tageRoutes.get(
    '/delete-tage/:id',
    authentication,
    deleteTageHandler
  );

  return tageRoutes;
};

export default tageRoute;
