import router from 'express';
import { createJobHandler, deleteJobHandler, getJobHandler, listAllDeletedJobsHandler, listAllJobsHandler, listRecommendedJobsHandler, updateJobHandler } from '../../controllers/jobs/job.controller.js';
import { authentication } from '../../middlewares/authentication.js';
import { cache } from '../../middlewares/cacheMiddleware.js';

const jobRoutes = router.Router();

const jobRoute = () => {
  jobRoutes.post(
    '/create-new-job',
    authentication,
    createJobHandler
  );
  jobRoutes.put(
    '/update-job/:id',
    authentication,
    updateJobHandler
  );
  jobRoutes.get(
    '/list-all-jobs',
    authentication,
    cache(60),
    listAllJobsHandler
  );
    jobRoutes.get(
    '/list-recommended-jobs',
    authentication,
    cache(60),
    listRecommendedJobsHandler
  );
  jobRoutes.get(
    '/list-deleted-jobs',
    authentication,
    cache(60),
    listAllDeletedJobsHandler
  );
  jobRoutes.get(
    '/get-job/:id',
    authentication,
    getJobHandler
  );
  jobRoutes.get(
    '/delete-job/:id',
    authentication,
    deleteJobHandler
  );

  return jobRoutes;
};

export default jobRoute;
