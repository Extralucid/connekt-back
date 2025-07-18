import router from 'express';
import { createBookCategoryHandler, deleteBookCategoryHandler, getBookCategoryHandler, listAllDeletedBookCategorysHandler, listAllBookCategorysHandler, updateBookCategoryHandler } from '../../controllers/books/bookCategory.controller.js';
import { authentication } from '../../middlewares/authentication.js';
import { cache } from '../../middlewares/cacheMiddleware.js';

const bookCategoryRoutes = router.Router();

const bookCategoryRoute = () => {
  bookCategoryRoutes.post(
    '/create-new-bookCategory',
    authentication,
    createBookCategoryHandler
  );
  bookCategoryRoutes.put(
    '/update-bookCategory/:id',
    authentication,
    updateBookCategoryHandler
  );
  bookCategoryRoutes.get(
    '/list-all-bookCategorys',
    authentication,
    cache(60),
    listAllBookCategorysHandler
  );
  bookCategoryRoutes.get(
    '/list-deleted-bookCategorys',
    authentication,
    cache(60),
    listAllDeletedBookCategorysHandler
  );
  bookCategoryRoutes.get(
    '/get-bookCategory/:id',
    authentication,
    getBookCategoryHandler
  );
  bookCategoryRoutes.get(
    '/delete-bookCategory/:id',
    authentication,
    deleteBookCategoryHandler
  );

  return bookCategoryRoutes;
};

export default bookCategoryRoute;
