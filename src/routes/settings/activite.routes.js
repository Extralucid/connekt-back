import router from 'express';
import { createActiviteHandler, deleteActiviteHandler, getActiviteHandler, listAllDeletedActivitesHandler, listAllActivitesHandler, updateActiviteHandler } from '../../controllers/settings/activite.controller.js';
import { authentication } from '../../middlewares/authentication.js';

const activiteRoutes = router.Router();

const activiteRoute = () => {
  activiteRoutes.post(
    '/create-new-activite',
    createActiviteHandler
  );
  activiteRoutes.put(
    '/update-activite/:id',
    authentication,
    updateActiviteHandler
  );
  activiteRoutes.get(
    '/list-all-activites',
    authentication,
    listAllActivitesHandler
  );
  activiteRoutes.get(
    '/list-deleted-activites',
    authentication,
    listAllDeletedActivitesHandler
  );
  activiteRoutes.get(
    '/get-activite/:id',
    authentication,
    getActiviteHandler
  );
  activiteRoutes.get(
    '/delete-activite/:id',
    authentication,
    deleteActiviteHandler
  );

  return activiteRoutes;
};

export default activiteRoute;
