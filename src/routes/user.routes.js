import router from 'express';
import { createUserHandler, deleteUserHandler, getUserHandler, listAllDeletedUsersHandler, listAllUsersHandler,  updateUserHandler } from '../controllers/user.controllers.js';
import { authentication } from '../middlewares/authentication.js';

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
