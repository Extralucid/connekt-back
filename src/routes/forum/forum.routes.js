import router from 'express';
import { createForumHandler, deleteForumHandler, getForumHandler, listAllDeletedForumsHandler, listAllForumsHandler, updateForumHandler } from '../../controllers/forum/forum.controller.js';
import { authentication } from '../../middlewares/authentication.js';
import { upload } from '../../middlewares/uploadHandler.js';

const forumRoutes = router.Router();

const forumRoute = () => {
  forumRoutes.post(
    '/create-new-forum',
    authentication,
    createForumHandler
  );
  forumRoutes.put(
    '/update-forum/:id',
    authentication,
    updateForumHandler
  );
  forumRoutes.get(
    '/list-all-forums',
    authentication,
    listAllForumsHandler
  );
  forumRoutes.get(
    '/list-deleted-forums',
    authentication,
    listAllDeletedForumsHandler
  );
  forumRoutes.get(
    '/get-forum/:id',
    authentication,
    getForumHandler
  );
  forumRoutes.get(
    '/delete-forum/:id',
    authentication,
    deleteForumHandler
  );

  return forumRoutes;
};

export default forumRoute;
