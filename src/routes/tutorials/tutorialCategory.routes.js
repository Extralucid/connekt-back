import router from 'express';
import { createTutorialCategoryHandler, deleteTutorialCategoryHandler, getTutorialCategoryHandler, listAllDeletedTutorialCategorysHandler, listAllTutorialCategorysHandler, updateTutorialCategoryHandler } from '../../controllers/tutorials/tutorialCategory.controller.js';
import { authentication } from '../../middlewares/authentication.js';
import { cache } from '../../middlewares/cacheMiddleware.js';

const tutorialCategoryRoutes = router.Router();

const tutorialCategoryRoute = () => {
  tutorialCategoryRoutes.post(
    '/create-new-tutorialCategory',
    authentication,
    createTutorialCategoryHandler
  );
  tutorialCategoryRoutes.put(
    '/update-tutorialCategory/:id',
    authentication,
    updateTutorialCategoryHandler
  );
  tutorialCategoryRoutes.get(
    '/list-all-tutorialCategorys',
    authentication,
    cache(60),
    listAllTutorialCategorysHandler
  );
  tutorialCategoryRoutes.get(
    '/list-deleted-tutorialCategorys',
    authentication,
    cache(60),
    listAllDeletedTutorialCategorysHandler
  );
  tutorialCategoryRoutes.get(
    '/get-tutorialCategory/:id',
    authentication,
    getTutorialCategoryHandler
  );
  tutorialCategoryRoutes.get(
    '/delete-tutorialCategory/:id',
    authentication,
    deleteTutorialCategoryHandler
  );

  return tutorialCategoryRoutes;
};

export default tutorialCategoryRoute;
