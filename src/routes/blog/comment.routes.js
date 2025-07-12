import router from 'express';
import { createCommentHandler, deleteCommentHandler, getCommentHandler, listAllDeletedCommentsHandler, listAllCommentsHandler, updateCommentHandler } from '../../controllers/blog/comment.controller.js';
import { authentication } from '../../middlewares/authentication.js';
import { upload } from '../../middlewares/uploadHandler.js';

const commentRoutes = router.Router();

const commentRoute = () => {
  commentRoutes.post(
    '/create-new-comment',
    authentication,
    createCommentHandler
  );
  commentRoutes.put(
    '/update-comment/:id',
    authentication,
    updateCommentHandler
  );
  commentRoutes.get(
    '/list-all-comments',
    authentication,
    listAllCommentsHandler
  );
  commentRoutes.get(
    '/list-deleted-comments',
    authentication,
    listAllDeletedCommentsHandler
  );
  commentRoutes.get(
    '/get-comment/:id',
    authentication,
    getCommentHandler
  );
  commentRoutes.get(
    '/delete-comment/:id',
    authentication,
    deleteCommentHandler
  );

  return commentRoutes;
};

export default commentRoute;
