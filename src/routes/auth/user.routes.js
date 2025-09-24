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
  /**
 * @swagger
 * /users:
 *   get:
 *     summary: Retrieve a list of JSONPlaceholder users.
 *     description: Retrieve a list of users from JSONPlaceholder. Can be used to populate a list of fake users when prototyping or testing an API.
 *     responses:
 *       200:
 *         description: A list of users.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         description: The user ID.
 *                         example: 0
 *                       name:
 *                         type: string
 *                         description: The user's name.
 *                         example: Leanne Graham
 */
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
