import router from 'express';
import { createPostHandler, deletePostHandler, getPostHandler, listAllDeletedPostsHandler, listAllPostsHandler, updatePostHandler } from '../../controllers/blog/post.controller.js';
import { authentication } from '../../middlewares/authentication.js';
import { upload } from '../../middlewares/uploadHandler.js';

const postRoutes = router.Router();

const postRoute = () => {
  postRoutes.post(
    '/create-new-post',
    authentication,
    createPostHandler
  );
  postRoutes.put(
    '/update-post/:id',
    authentication,
    updatePostHandler
  );
  postRoutes.get(
    '/list-all-posts',
    authentication,
    listAllPostsHandler
  );
  postRoutes.get(
    '/list-deleted-posts',
    authentication,
    listAllDeletedPostsHandler
  );
  postRoutes.get(
    '/get-post/:id',
    authentication,
    getPostHandler
  );
  postRoutes.get(
    '/delete-post/:id',
    authentication,
    deletePostHandler
  );

  return postRoutes;
};

export default postRoute;
