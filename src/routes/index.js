import authRoute from './auth/auth.routes.js';
import documentRoute from './auth/document.routes.js';
import tdocumentRoute from './auth/tdocument.routes.js';
import userRoute from './auth/user.routes.js';

import categoryRoute from './blog/category.routes.js';
import tagRoute from './blog/tag.routes.js';
import postRoute from './blog/post.routes.js';
import commentRoute from './blog/comment.routes.js';

//job routes imports
import categorieRoute from './jobs/categorie.routes.js';
import jobRoute from './jobs/job.routes.js';
import skillRoute from './jobs/skill.routes.js';
import applicationRoute from './jobs/application.routes.js';

//book routes imports
import bookCategorieRoute from './books/bookCategory.routes.js';
import bookRoute from './books/book.routes.js';

//tutorial routes imports
import tutorialCategorieRoute from './tutorials/tutorialCategory.routes.js';
import tutorialRoute from './tutorials/tutorial.routes.js';

//forum
import forumRoute from './forum/forum.routes.js';
import topicRoute from './forum/topic.routes.js';
import replyRoute from './forum/reply.routes.js';

import chatRoute from './chat/chat.routes.js';
import podcastRoute from './podcast/podcast.routes.js';

export default (router) => {
  router.use('/auth', authRoute());
  router.use('/user', userRoute());
  router.use('/document', documentRoute());

  router.use('/tdocument', tdocumentRoute());
  //blog
  router.use('/blog-category', categoryRoute());
  router.use('/tag', tagRoute());
  router.use('/post', postRoute());
  router.use('/comment', commentRoute());

  //forum routes
  router.use('/forum', forumRoute());
  router.use('/topic', topicRoute());
  router.use('/reply', replyRoute());

  //jobs routes
  router.use('/job', jobRoute());
  router.use('/application', applicationRoute());
  router.use('/skill', skillRoute());
  router.use('/job-catgory', categorieRoute());

  //chat routes
  router.use('/chat', chatRoute());
  router.use('/podcast', podcastRoute());

  //books routes
  router.use('/book', bookRoute());
  router.use('/book-catgory', bookCategorieRoute());
  //tutorials routes
  router.use('/tutorial', tutorialRoute());
  router.use('/tutorial-catgory', tutorialCategorieRoute());
  return router;
};
