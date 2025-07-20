import router from 'express';
import { createPostHandler, deletePostHandler, getPostHandler, listAllDeletedPostsHandler, listAllPostsHandler, listRecommendedPostsHandler, updatePostHandler } from '../../controllers/blog/post.controller.js';
import { authentication } from '../../middlewares/authentication.js';
import { cache } from '../../middlewares/cacheMiddleware.js';

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
    cache(60),
    listAllPostsHandler
  );
  postRoutes.get(
    '/list-recommended-posts',
    authentication,
    cache(60),
    listRecommendedPostsHandler
  );
  postRoutes.get(
    '/list-deleted-posts',
    authentication,
    cache(60),
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
