import router from 'express';
import { createUserHandler, createUserReviewHandler, deleteUserHandler, getUserHandler, getUserReviewsHandler, listAllDeletedUsersHandler, listAllUsersHandler, updateUserHandler } from '../../controllers/auth/user.controllers.js';
import { authentication } from '../../middlewares/authentication.js';

const userRoutes = router.Router();

const userRoute = () => {
  userRoutes.post(
    '/create-new-user',
    createUserHandler
  );
  userRoutes.put(
    '/update-user/:id',
    authentication,
    updateUserHandler
  );
  userRoutes.get(
    '/list-all-users',
    authentication,
    listAllUsersHandler
  );
  userRoutes.post(
    '/create-review',
    authentication,
    createUserReviewHandler
  );
  userRoutes.get(
    '/employers/:userId/reviews',
    authentication,
    getUserReviewsHandler
  );
  userRoutes.get(
    '/list-deleted-users',
    authentication,
    listAllDeletedUsersHandler
  );
  userRoutes.get(
    '/get-user/:id',
    authentication,
    getUserHandler
  );
  userRoutes.get(
    '/delete-user/:id',
    authentication,
    deleteUserHandler
  );

  return userRoutes;
};

export default userRoute;
