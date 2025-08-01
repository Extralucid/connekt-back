import router from 'express';
import { createTopicHandler, deleteTopicHandler, getTopicHandler, listAllDeletedTopicsHandler, listAllTopicsHandler, updateTopicHandler } from '../../controllers/forum/topic.controller.js';
import { authentication } from '../../middlewares/authentication.js';
import { cache } from '../../middlewares/cacheMiddleware.js';

const topicRoutes = router.Router();

const topicRoute = () => {
  topicRoutes.post(
    '/create-new-topic',
    authentication,
    createTopicHandler
  );
  topicRoutes.put(
    '/update-topic/:id',
    authentication,
    updateTopicHandler
  );
  topicRoutes.get(
    '/list-all-topics',
    authentication,
    cache(60),
    listAllTopicsHandler
  );
  topicRoutes.get(
    '/list-deleted-topics',
    authentication,
    cache(60),
    listAllDeletedTopicsHandler
  );
  topicRoutes.get(
    '/get-topic/:id',
    authentication,
    getTopicHandler
  );
  topicRoutes.get(
    '/delete-topic/:id',
    authentication,
    deleteTopicHandler
  );

  return topicRoutes;
};

export default topicRoute;
