import router from 'express';
import { createCategorieHandler, deleteCategorieHandler, getCategorieHandler, listAllDeletedCategoriesHandler, listAllCategoriesHandler, updateCategorieHandler } from '../../controllers/jobs/categorie.controller.js';
import { authentication } from '../../middlewares/authentication.js';
import { cache } from '../../middlewares/cacheMiddleware.js';

const categorieRoutes = router.Router();

const categorieRoute = () => {
  categorieRoutes.post(
    '/create-new-categorie',
    authentication,
    createCategorieHandler
  );
  categorieRoutes.put(
    '/update-categorie/:id',
    authentication,
    updateCategorieHandler
  );
  categorieRoutes.get(
    '/list-all-categories',
    authentication,
    cache(60),
    listAllCategoriesHandler
  );
  categorieRoutes.get(
    '/list-deleted-categories',
    authentication,
    cache(60),
    listAllDeletedCategoriesHandler
  );
  categorieRoutes.get(
    '/get-categorie/:id',
    authentication,
    getCategorieHandler
  );
  categorieRoutes.get(
    '/delete-categorie/:id',
    authentication,
    deleteCategorieHandler
  );

  return categorieRoutes;
};

export default categorieRoute;
