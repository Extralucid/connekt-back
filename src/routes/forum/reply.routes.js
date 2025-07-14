import router from 'express';
import { createReplyHandler, deleteReplyHandler, getReplyHandler, listAllDeletedReplysHandler, listAllReplysHandler, updateReplyHandler } from '../../controllers/forum/reply.controller.js';
import { authentication } from '../../middlewares/authentication.js';
import { cache } from '../../middlewares/cacheMiddleware.js';

const replyRoutes = router.Router();

const replyRoute = () => {
  replyRoutes.post(
    '/create-new-reply',
    authentication,
    createReplyHandler
  );
  replyRoutes.put(
    '/update-reply/:id',
    authentication,
    updateReplyHandler
  );
  replyRoutes.get(
    '/list-all-replys',
    authentication,
    cache(60),
    listAllReplysHandler
  );
  replyRoutes.get(
    '/list-deleted-replys',
    authentication,
    cache(60),
    listAllDeletedReplysHandler
  );
  replyRoutes.get(
    '/get-reply/:id',
    authentication,
    getReplyHandler
  );
  replyRoutes.get(
    '/delete-reply/:id',
    authentication,
    deleteReplyHandler
  );

  return replyRoutes;
};

export default replyRoute;
