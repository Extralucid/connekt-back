import router from 'express';
import { createReplyHandler, deleteReplyHandler, getReplyHandler, listAllDeletedReplysHandler, listAllReplysHandler, updateReplyHandler } from '../../controllers/forum/reply.controller.js';
import { authentication } from '../../middlewares/authentication.js';
import { upload } from '../../middlewares/uploadHandler.js';

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
    listAllReplysHandler
  );
  replyRoutes.get(
    '/list-deleted-replys',
    authentication,
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
