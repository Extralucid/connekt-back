import router from 'express';
import { createCategoryHandler, deleteCategoryHandler, getCategoryHandler, listAllDeletedCategorysHandler, listAllCategorysHandler, updateCategoryHandler } from '../../controllers/blog/category.controller.js';
import { authentication } from '../../middlewares/authentication.js';
import { upload } from '../../middlewares/uploadHandler.js';

const categoryRoutes = router.Router();

const categoryRoute = () => {
  categoryRoutes.post(
    '/create-new-category',
    authentication,
    createCategoryHandler
  );
  categoryRoutes.put(
    '/update-category/:id',
    authentication,
    updateCategoryHandler
  );
  categoryRoutes.get(
    '/list-all-categorys',
    authentication,
    listAllCategorysHandler
  );
  categoryRoutes.get(
    '/list-deleted-categorys',
    authentication,
    listAllDeletedCategorysHandler
  );
  categoryRoutes.get(
    '/get-category/:id',
    authentication,
    getCategoryHandler
  );
  categoryRoutes.get(
    '/delete-category/:id',
    authentication,
    deleteCategoryHandler
  );

  return categoryRoutes;
};

export default categoryRoute;
