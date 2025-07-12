import authRoute from './auth/auth.routes.js';
import documentRoute from './auth/document.routes.js';
import tdocumentRoute from './auth/tdocument.routes.js';
import userRoute from './auth/user.routes.js';

import categoryRoute from './blog/category.routes.js';
import tagRoute from './blog/tag.routes.js';
import postRoute from './blog/post.routes.js';
import commentRoute from './blog/comment.routes.js';

export default (router) => {
  router.use('/auth', authRoute());
  router.use('/user', userRoute());
  router.use('/document', documentRoute());

  router.use('/tdocument', tdocumentRoute());

  router.use('/category', categoryRoute());
  router.use('/tag', tagRoute());
  router.use('/post', postRoute());
  router.use('/comment', commentRoute());
  return router;
};
