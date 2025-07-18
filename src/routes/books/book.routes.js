import router from 'express';
import { createBookHandler, deleteBookHandler, getBookHandler, listAllDeletedBooksHandler, listAllBooksHandler, updateBookHandler, listRecommendedBooksHandler, trackBookReadingProgressHandler } from '../../controllers/books/book.controller.js';
import { authentication } from '../../middlewares/authentication.js';
import { cache } from '../../middlewares/cacheMiddleware.js';

const bookRoutes = router.Router();

const bookRoute = () => {
  bookRoutes.post(
    '/create-new-book',
    authentication,
    createBookHandler
  );
  bookRoutes.put(
    '/update-book/:id',
    authentication,
    updateBookHandler
  );
  // User-specific: Track reading progress
  bookRoutes.post('/user-books', authentication, trackBookReadingProgressHandler);
  bookRoutes.get(
    '/list-all-books',
    authentication,
    cache(60),
    listAllBooksHandler
  );
  bookRoutes.get(
    '/list-recommended-books',
    authentication,
    cache(60),
    listRecommendedBooksHandler
  );
  bookRoutes.get(
    '/list-deleted-books',
    authentication,
    cache(60),
    listAllDeletedBooksHandler
  );
  bookRoutes.get(
    '/get-book/:id',
    authentication,
    getBookHandler
  );
  bookRoutes.get(
    '/delete-book/:id',
    authentication,
    deleteBookHandler
  );

  return bookRoutes;
};

export default bookRoute;
