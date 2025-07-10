import router from 'express';
import { createTpuissanceHandler, deleteTpuissanceHandler, getTpuissanceHandler, listAllDeletedTpuissancesHandler, listAllTpuissancesHandler, updateTpuissanceHandler } from '../../controllers/settings/tpuissance.controller.js';
import { authentication } from '../../middlewares/authentication.js';

const tpuissanceRoutes = router.Router();

const tpuissanceRoute = () => {
  tpuissanceRoutes.post(
    '/create-new-tpuissance',
    createTpuissanceHandler
  );
  tpuissanceRoutes.put(
    '/update-tpuissance/:id',
    authentication,
    updateTpuissanceHandler
  );
  tpuissanceRoutes.get(
    '/list-all-tpuissances',
    authentication,
    listAllTpuissancesHandler
  );
  tpuissanceRoutes.get(
    '/list-deleted-tpuissances',
    authentication,
    listAllDeletedTpuissancesHandler
  );
  tpuissanceRoutes.get(
    '/get-tpuissance/:id',
    authentication,
    getTpuissanceHandler
  );
  tpuissanceRoutes.get(
    '/delete-tpuissance/:id',
    authentication,
    deleteTpuissanceHandler
  );

  return tpuissanceRoutes;
};

export default tpuissanceRoute;
