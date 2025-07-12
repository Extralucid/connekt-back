import router from 'express';
import { createTagHandler, deleteTagHandler, getTagHandler, listAllDeletedTagsHandler, listAllTagsHandler, updateTagHandler } from '../../controllers/blog/tag.controller.js';
import { authentication } from '../../middlewares/authentication.js';
import { upload } from '../../middlewares/uploadHandler.js';

const tagRoutes = router.Router();

const tagRoute = () => {
  tagRoutes.post(
    '/create-new-tag',
    authentication,
    createTagHandler
  );
  tagRoutes.put(
    '/update-tag/:id',
    authentication,
    updateTagHandler
  );
  tagRoutes.get(
    '/list-all-tags',
    authentication,
    listAllTagsHandler
  );
  tagRoutes.get(
    '/list-deleted-tags',
    authentication,
    listAllDeletedTagsHandler
  );
  tagRoutes.get(
    '/get-tag/:id',
    authentication,
    getTagHandler
  );
  tagRoutes.get(
    '/delete-tag/:id',
    authentication,
    deleteTagHandler
  );

  return tagRoutes;
};

export default tagRoute;
