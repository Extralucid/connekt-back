import router from 'express';
import { createStatutHandler, deleteStatutHandler, getStatutHandler, listAllDeletedStatutsHandler, listAllStatutsHandler, updateStatutHandler } from '../../controllers/settings/statut.controller.js';
import { authentication } from '../../middlewares/authentication.js';

const statutRoutes = router.Router();

const statutRoute = () => {
  statutRoutes.post(
    '/create-new-statut',
    createStatutHandler
  );
  statutRoutes.put(
    '/update-statut/:id',
    authentication,
    updateStatutHandler
  );
  statutRoutes.get(
    '/list-all-statuts',
    authentication,
    listAllStatutsHandler
  );
  statutRoutes.get(
    '/list-deleted-statuts',
    authentication,
    listAllDeletedStatutsHandler
  );
  statutRoutes.get(
    '/get-statut/:id',
    authentication,
    getStatutHandler
  );
  statutRoutes.get(
    '/delete-statut/:id',
    authentication,
    deleteStatutHandler
  );

  return statutRoutes;
};

export default statutRoute;
