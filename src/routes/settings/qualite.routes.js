import router from 'express';
import { createQualiteHandler, deleteQualiteHandler, getQualiteHandler, listAllDeletedQualitesHandler, listAllQualitesHandler, updateQualiteHandler } from '../../controllers/settings/qualite.controller.js';
import { authentication } from '../../middlewares/authentication.js';

const qualiteRoutes = router.Router();

const qualiteRoute = () => {
  qualiteRoutes.post(
    '/create-new-qualite',
    createQualiteHandler
  );
  qualiteRoutes.put(
    '/update-qualite/:id',
    authentication,
    updateQualiteHandler
  );
  qualiteRoutes.get(
    '/list-all-qualites',
    authentication,
    listAllQualitesHandler
  );
  qualiteRoutes.get(
    '/list-deleted-qualites',
    authentication,
    listAllDeletedQualitesHandler
  );
  qualiteRoutes.get(
    '/get-qualite/:id',
    authentication,
    getQualiteHandler
  );
  qualiteRoutes.get(
    '/delete-qualite/:id',
    authentication,
    deleteQualiteHandler
  );

  return qualiteRoutes;
};

export default qualiteRoute;
