import router from 'express';
import { createApplicationHandler, deleteApplicationHandler, getApplicationHandler, listAllDeletedApplicationsHandler, listAllApplicationsHandler, updateApplicationHandler, getApplicationTimelineHandler } from '../../controllers/jobs/application.controller.js';
import { authentication } from '../../middlewares/authentication.js';
import { cache } from '../../middlewares/cacheMiddleware.js';

const applicationRoutes = router.Router();

const applicationRoute = () => {
  applicationRoutes.post(
    '/create-new-application',
    authentication,
    createApplicationHandler
  );
  applicationRoutes.put(
    '/update-application/:id',
    authentication,
    updateApplicationHandler
  );
  applicationRoutes.get(
    '/list-all-applications',
    authentication,
    cache(60),
    listAllApplicationsHandler
  );
  applicationRoutes.get(
    '/list-deleted-applications',
    authentication,
    cache(60),
    listAllDeletedApplicationsHandler
  );
  applicationRoutes.get(
    '/get-application/:id',
    authentication,
    getApplicationHandler
  );
    applicationRoutes.get(
    '/:id/timeline',
    authentication,
    getApplicationTimelineHandler
  );
  applicationRoutes.get(
    '/delete-application/:id',
    authentication,
    deleteApplicationHandler
  );

  return applicationRoutes;
};

export default applicationRoute;
