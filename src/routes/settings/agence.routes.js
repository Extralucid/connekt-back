import router from 'express';
import { createAgenceHandler, deleteAgenceHandler, getAgenceHandler, listAllDeletedAgencesHandler, listAllAgencesHandler, updateAgenceHandler } from '../../controllers/settings/agence.controller.js';
import { authentication } from '../../middlewares/authentication.js';

const agenceRoutes = router.Router();

const agenceRoute = () => {
  agenceRoutes.post(
    '/create-new-agence',
    createAgenceHandler
  );
  agenceRoutes.put(
    '/update-agence/:id',
    authentication,
    updateAgenceHandler
  );
  agenceRoutes.get(
    '/list-all-agences',
    authentication,
    listAllAgencesHandler
  );
  agenceRoutes.get(
    '/list-deleted-agences',
    authentication,
    listAllDeletedAgencesHandler
  );
  agenceRoutes.get(
    '/get-agence/:id',
    authentication,
    getAgenceHandler
  );
  agenceRoutes.get(
    '/delete-agence/:id',
    authentication,
    deleteAgenceHandler
  );

  return agenceRoutes;
};

export default agenceRoute;
