import router from 'express';
import { createPackHandler, deletePackHandler, getCreatePackDataHandler, getPackHandler, getUpdatePackDataHandler, listAllDeletedPacksHandler, listAllPacksHandler, updatePackHandler } from '../../controllers/settings/pack.controller.js';
import { authentication } from '../../middlewares/authentication.js';

const packRoutes = router.Router();

const packRoute = () => {
  packRoutes.post(
    '/create-new-pack',
    createPackHandler
  );
  packRoutes.put(
    '/update-pack/:id',
    authentication,
    updatePackHandler
  );
  packRoutes.get(
    '/list-all-packs',
    authentication,
    listAllPacksHandler
  );
  packRoutes.get(
    '/get-create-pack-data',
    authentication,
    getCreatePackDataHandler
  );
  packRoutes.get(
    '/get-update-pack-data/:id',
    authentication,
    getUpdatePackDataHandler
  );
  packRoutes.get(
    '/list-deleted-packs',
    authentication,
    listAllDeletedPacksHandler
  );
  packRoutes.get(
    '/get-pack/:id',
    authentication,
    getPackHandler
  );
  packRoutes.get(
    '/delete-pack/:id',
    authentication,
    deletePackHandler
  );

  return packRoutes;
};

export default packRoute;
