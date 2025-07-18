import router from 'express';
import { createTutorialHandler, deleteTutorialHandler, getTutorialHandler, listAllDeletedTutorialsHandler, listAllTutorialsHandler, listRecommendedTutorialsHandler, updateTutorialHandler } from '../../controllers/tutorials/tutorial.controller.js';
import { authentication } from '../../middlewares/authentication.js';
import { cache } from '../../middlewares/cacheMiddleware.js';

const tutorialRoutes = router.Router();

const tutorialRoute = () => {
  tutorialRoutes.post(
    '/create-new-tutorial',
    authentication,
    createTutorialHandler
  );
  tutorialRoutes.put(
    '/update-tutorial/:id',
    authentication,
    updateTutorialHandler
  );
  tutorialRoutes.get(
    '/list-all-tutorials',
    authentication,
    cache(60),
    listAllTutorialsHandler
  );
    tutorialRoutes.get(
    '/list-recommended-tutorials',
    authentication,
    cache(60),
    listRecommendedTutorialsHandler
  );
  tutorialRoutes.get(
    '/list-deleted-tutorials',
    authentication,
    cache(60),
    listAllDeletedTutorialsHandler
  );
  tutorialRoutes.get(
    '/get-tutorial/:id',
    authentication,
    getTutorialHandler
  );
  tutorialRoutes.get(
    '/delete-tutorial/:id',
    authentication,
    deleteTutorialHandler
  );

  return tutorialRoutes;
};

export default tutorialRoute;
